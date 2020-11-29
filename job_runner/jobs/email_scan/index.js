const { refreshToken } = require('../../lib');

const scanEmails = async (pgFunctions, redisFunctions, userId) => {
  
	// let token;
	// let credentialsObject;

  const { rows: [token] = [] } = await pgFunctions.getOAuthTokenForUserId(userId);
  const { rows: [credentialsObject] = [] } = await pgFunctions.getCredentials();

  if (!credentialsObject) {
    console.error('no credentials found in db');
    process.exit(1);
  }

  if (!token) {
    console.error('no token data found in db');
    process.exit(1);
  }

  const refreshToken = await refreshToken(credentialsObject, token, uerId);

  // TODO - store refesToken

  if (!refreshToken) {
  	console.error('no refresh');
  }

};


module.exports = {
  scanEmails
};
