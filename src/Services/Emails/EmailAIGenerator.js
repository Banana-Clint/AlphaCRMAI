const https = require('https');
const { getTokens } = require('../../Config/OAuth2.js');
const { google } = require('googleapis');

// Function to extract subject and body from the email content
const extractSubjectAndBody = (emailContent) => {
    const lines = emailContent.split('\n');
    let subject = lines[0].replace(/^Subject:\s*/, ''); // Remove "Subject:" prefix if it exists
    const body = lines.slice(1).join('\n');
    return { subject, body };
  };
  

exports.generateEmailUsingGemini = (prompt) => {
  
  const token = getTokens(); // Retrieve the token from the shared state
  if (!token) {
    throw new Error('Token not set or invalid. Please authenticate first.');
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: '/v1beta/models/gemini-1.5-flash-latest:generateContent',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.access_token}`, // Ensure to use access_token
        'Content-Type': 'application/json',
        'x-api-key': process.env.GEMINI_API_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log('Raw response from Gemini API:', data);
          
          const parsedData = JSON.parse(data);
          if (!parsedData.candidates || !parsedData.candidates[0] || !parsedData.candidates[0].content || !parsedData.candidates[0].content.parts || !parsedData.candidates[0].content.parts[0].text) {
            return reject(new Error(parsedData.error ? parsedData.error.message : 'Invalid response structure from Gemini API'));
          }

          const emailContent = parsedData.candidates[0].content.parts[0].text;
          const { subject, body } = extractSubjectAndBody(emailContent);

          resolve({ subject, body }); // Return subject and body separately
        } catch (error) {
          console.error('Error parsing response:', error);
          reject(new Error(`Failed to parse JSON. Received response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    const requestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    req.write(requestBody);
    req.end();
  });
};


exports.findEmailsByAddress = async (emailAddress) => {
    const tokens = getTokens();
    if (!tokens) {
      throw new Error('Tokens not set. Please authenticate first.');
    }
  
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
    let allThreads = [];
    let pageToken = null;
  
    try {
      do {
        const response = await gmail.users.threads.list({
          userId: 'me',
          q: `from:${emailAddress} OR to:${emailAddress}`,
          maxResults: 20,
          pageToken: pageToken
        });
  
        const threads = await Promise.all(response.data.threads.map(async thread => {
          const threadDetails = await gmail.users.threads.get({ userId: 'me', id: thread.id });
          return {
            id: threadDetails.data.id,
            messages: threadDetails.data.messages.map(msg => ({
              id: msg.id,
              snippet: msg.snippet,
              date: new Date(parseInt(msg.internalDate)), // Convert to date object
              from: msg.payload.headers.find(header => header.name === 'From').value,
              to: msg.payload.headers.find(header => header.name === 'To').value,
              subject: msg.payload.headers.find(header => header.name === 'Subject').value,
              body: msg.payload.parts ? msg.payload.parts.map(part => part.body.data).join('') : ''
            }))
          };
        }));
  
        allThreads = allThreads.concat(threads);
        pageToken = response.data.nextPageToken;
      } while (pageToken && allThreads.length < 20);
  
      const filteredEmails = allThreads.flatMap(thread => thread.messages);
  
      const result = filteredEmails.map(email => ({
        subject: email.subject,
        body: email.body,
        date: email.date
      }));
  
      return result;
  
    } catch (error) {
      console.error('Error fetching threads:', error);
      throw new Error(`Error fetching threads: ${error.message}`);
    }
  };
  
