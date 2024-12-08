
const { oauth2Client, getTokens } = require('../Config/OAuth2.js');
const { google } = require('googleapis');
const { fetchClientData } = require('../Services/Client/ClientDataRetrieval.js')
const { generateEmailUsingGemini,findEmailsByAddress } = require('../Services/Emails/EmailAIGenerator.js')

exports.GetInbox = async (req, res) => {
  const tokens = getTokens(); // Retrieve the tokens from the shared state
  if (!tokens) {
    return res.json({ error: 'Tokens not set. Please authenticate first.' });
  }

  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  let allThreads = [];
  let pageToken = null;

  try {
    do {
      const response = await gmail.users.threads.list({
        userId: 'me',
        maxResults: 150,
        pageToken: pageToken
      });

      const threads = await Promise.all(response.data.threads.map(async thread => {
        const threadDetails = await gmail.users.threads.get({ userId: 'me', id: thread.id });
        return {
          id: threadDetails.data.id,
          messages: threadDetails.data.messages.map(msg => ({
            id: msg.id,
            snippet: msg.snippet,
            date: msg.internalDate,
            from: msg.payload.headers.find(header => header.name === 'From').value,
            subject: msg.payload.headers.find(header => header.name === 'Subject').value
          }))
        };
      }));

      allThreads = allThreads.concat(threads);
      pageToken = response.data.nextPageToken;
    } while (pageToken && allThreads.length < 150);

    res.json(allThreads.slice(0, 150));
  } catch (error) {
    console.error('Error fetching threads:', error); // Log the error
    res.json({ error: `Error fetching threads: ${error.message}` });
  }
};

exports.SendEmail = async (req, res) => {
  const tokens = getTokens(); // Retrieve the tokens from the shared state
  if (!tokens) {
    return res.status(400).json({ error: 'Tokens not set. Please authenticate first.' });
  }

  const { to, subject, message } = req.body;

  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    message,
  ];

  const email = emailLines.join('\r\n').trim();

  try {
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: `Error sending email: ${error.message}` });
  }
};

exports.GenerateEmail = async (req, res) => {
  const { clientId, textPrompt, emailAddress } = req.body;
  console.log(clientId, textPrompt, emailAddress);

  try {
    // Fetch client data from the existing endpoint
    const clientData = await fetchClientData(clientId);

    // Fetch emails related to the client
    const emailMetadata = await findEmailsByAddress(emailAddress);

    // Combine client data, email metadata, and text prompt
    const emailPrompt = `
    You are an AI designed to assist our staff in communicating with clients. 
    Below is the information about the current client you need to interact with:
    - Personal Information: ${JSON.stringify(clientData.client)}
    - Documents: ${JSON.stringify(clientData.documents)}
    - Events: ${JSON.stringify(clientData.events)}
    - History: ${JSON.stringify(clientData.history)}
    - Notes: ${JSON.stringify(clientData.notes)}
    - Recent Emails: ${JSON.stringify(emailMetadata)}
    
    Based on this information, generate a personalized email for our client. Focus on the latest interactions and the development of our relationship with them. Use the following prompt as a basis: ${textPrompt}
    `;

    // Call Gemini API to generate the email content
    const emailContent = await generateEmailUsingGemini(emailPrompt);

    res.json({ emailContent });
  } catch (error) {
    console.error('Error generating email:', error);
    res.status(500).json({ error: `Error generating email: ${error.message}` });
  }
};















