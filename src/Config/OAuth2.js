const { google } = require('googleapis');

//Constructing the OAuth2 client Object
const oauth2Client = new google.auth.OAuth2(
  process.env.OAUTH2_API_CLIENT_ID,
  process.env.OAUTH2_API_CLIENT_SECRET,
  `${process.env.API_URL}${process.env.PORT_NUMBER}/Api/Auth/OAuth2Callback`
);

let tokens = null;

// OAuth2 access tokens getters and setters
const setTokens = (newTokens) => {
  tokens = newTokens;
};
const getTokens = () => tokens;

module.exports = { oauth2Client, setTokens, getTokens };
