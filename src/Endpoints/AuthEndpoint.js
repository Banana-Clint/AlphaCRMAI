const { oauth2Client,setTokens } = require('../Config/OAuth2.js');

//Authentication endpoint and privilege checking 
exports.Auth = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/generative-language.retriever' ,
      'https://www.googleapis.com/auth/cloud-platform'
    ]
  });
  res.redirect(url);
};


//Callback Endpoint for OAuth2 athentication attempt
exports.OAuth2Callback = async (req, res) => {
  const code = req.query.code;
  try {
    const result = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(result.tokens); 
    setTokens(result.tokens);
    // Update the tokens in the shared state
    res.redirect(`${process.env.CLIENT_URL}?auth=success`);
  }
  catch (error) { res.send(`Error authenticating: ${error.message}`); }
};

