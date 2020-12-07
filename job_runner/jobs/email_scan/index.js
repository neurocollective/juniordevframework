const {
  refreshToken,
  isTokenExpiredByAPICheck,
  listGmailMessages,
  getGmailMessageById,
  insertRefreshedToken
} = require('../../lib');

// TODO - this should probably come from constants
const TARGET_MIME_TYPES = new Set([
  'multipart/alternative',
  'text/plain',
  'text/html'
]);

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

  const accessToken = token['access_token'];

  const tokenIsExpired = await isTokenExpiredByAPICheck(accessToken);
  let refreshedToken;

  if (tokenIsExpired) {
    console.log('refreshing token before email scan...');
    refreshedToken = await refreshToken(credentialsObject, token, userId);

    // console.log('old token', token['access_token']);
    // console.log("refreshedToken['access_token']", refreshedToken['access_token']);
    await pgFunctions.insertRefreshedToken(refreshedToken, userId);
  } else {
    refreshedToken = token;
  }

  if (!refreshedToken) {
  	console.error('no refresh token');
  } else {
    console.log('refreshed token:', refreshedToken);
  }

  // implement API call to get emails here
  const { response, statusCode, error } = await listGmailMessages(refreshedToken);

  const { messages } = response;

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log('response\'s statusCode:', statusCode);
  console.log('response', messages);

  const messagePromises = messages.map(({ id }) => getGmailMessageById(refreshedToken, id));
  
  let messageObjects;
  try {
    messageObjects = await Promise.all(messagePromises);
  } catch (err) {
    console.error(err.message);
  }

  const mappedEmailObjects = messageObjects.map(({ response: r }) => {
    const {
      payload: {
        headers,
        body,
        parts
      }
    } = r;  
    return { headers, body, parts };
  });

  const first = mappedEmailObjects[0];
  console.log('messageObjects[0]', first);

  const {
    headers: headersArray,
    parts: partsArray
  } = first;

  const relevantHeaders = headersArray.reduce((accumulator, headerObject) => {
    const { name, value } = headerObject;
    
    if (name == 'From') {
      accumulator.push({ name, value });
      return accumulator;
    }

    return accumulator;
  }, []);

  const relevantBodyParts = partsArray.reduce((accumulator, bodyObject) => {
    const { body, mimeType } = bodyObject;

    // console.log(body);

    const buffer = Buffer.from(body.data, 'base64');
    const text = buffer.toString();

    // console.log('accumulator', accumulator);
    if (TARGET_MIME_TYPES.has(mimeType)) {
      // TODO - maybe scan through the parts.body first?
      accumulator.push(text);
      return accumulator;
    }

    return accumulator;
  }, []);

  console.log('relevantBodyParts[0]', relevantBodyParts[0]);
  console.log('relevantHeaders[0]', relevantHeaders[0]);

  process.exit(0);
};

module.exports = {
  scanEmails
};
