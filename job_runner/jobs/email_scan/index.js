const { refreshToken } = require('../lib');

const scanEmails = (pgFunctions, redisFunctions, userId) => {
  
	let token;
	let credentialsObject;
  ({
  	rows: [
  	  token = {}
  	] = []
  }) = await pgFunctions.getOAuthTokenForUserId(userId);
  ({
  	rows: [
  	  credentialsObject
  	] = []
  }) = await pgFunctions.getCredentials();

  // const  {
  // 	installed: {
  // 		client_id: clientId = null,
  // 		client_secret, clientSecret
  // 	} = {},
  // } = CREDENTIALS;

  const refreshToken = await refreshToken(credentialsObject, token, uerId);

  // TODO - store refesToken

  if (!refreshToken) {
  	console.error('no refresh');
  }

};


module.exports = {
  scanEmails
};
