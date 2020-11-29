const { refreshToken, isTokenExpiredByAPICheck } = require('../../lib');

const scanEmails = async (pgFunctions, redisFunctions, userId) => {

  const { rows: [token] = [] } = await pgFunctions.getOAuthTokenForUserId(userId);
  const { rows: [credentialsObject] = [] } = await pgFunctions.getCredentials();

  if (!credentialsObject) {
    console.error('no credentials found in db');
    process.exit(1);
  }

  if (!token || !token['refresh_token']) {
    console.error('no refresh token data found in db');
    process.exit(1);
  }

  const tokenIsExpired = await isTokenExpiredByAPICheck(token);
  let refreshedToken;

  if (tokenIsExpired) {
    console.log('refreshing token before email scan...');
    refreshedToken = await refreshToken(credentialsObject, token, userId);
  } else {
    refreshedToken = token;
  }

  if (!refreshedToken) {
  	console.error('no refresh token');
  } else {
    console.log('refreshed token:', refreshedToken);
  }

  // implement API call to get emails here

};

module.exports = {
  scanEmails
};
