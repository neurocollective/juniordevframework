const {
  refreshToken,
  isTokenExpiredByAPICheck,
  listGmailMessages,
  getGmailMessageById,
  insertRefreshedToken,
  decodeBase64String,
  CONSTANTS
} = require('../../lib');

const {
  EMAIL_SCAN: {
    TARGET_MIME_TYPES,
    TARGET_HEADERS
  }  
} = CONSTANTS;

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

    await pgFunctions.insertRefreshedToken(refreshedToken, userId);
  } else {
    refreshedToken = token;
  }

  const { response, statusCode, error } = await listGmailMessages(refreshedToken);

  const { messages } = response;

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const messagePromises = messages.map(({ id }) => getGmailMessageById(refreshedToken, id));
  
  let messageObjects;
  try {
    console.log('waiting for all getGmailMessageById api calls to finish...');
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
    
    if (TARGET_HEADERS.has(name)) {
      accumulator.push({ name, value });
      return accumulator;
    }

    return accumulator;
  }, []);

  const relevantBodyParts = partsArray.reduce((accumulator, bodyObject) => {
    const { body, mimeType } = bodyObject;

    // const buffer = Buffer.from(body.data, 'base64');
    // const text = buffer.toString();

    const text = decodeBase64String(body.data);

    if (TARGET_MIME_TYPES.has(mimeType)) {
      accumulator.push(text);
      return accumulator;
    }

    return accumulator;
  }, []);

  console.log('relevantBodyParts[0]', relevantBodyParts[0]);
  console.log('relevantHeaders', relevantHeaders);

  process.exit(0);
};

module.exports = {
  scanEmails
};
