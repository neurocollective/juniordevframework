const fs = require('fs');
const readline = require('readline');
const {
  google
} = require('googleapis');
const  {
  env: {
    CREDENTIALS_FILE_PATH = `${process.cwd()}/jobs/email_scan/credentials.json`
  }
} = process;

/*
redirect_uri ->
http://localhost:8080/?code=4/4gGq6_7oGRAG3UND5X27N97TDUGGZMtXJjZox_3DVGaY7EziiebiNT3MCDojq_WaN8kDKkydEsHDfXafy8kIvmA&scope=https://www.googleapis.com/auth/gmail.readonly
*/

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const TOKEN_PATH = 'token.json';

const readFile = filePath => new Promise((resolve, reject) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      return reject(new Error(`Error reading file at ${filePath}: ${err.message}`));
    }
    return resolve(JSON.parse(content));
  });
});

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getNewToken(oAuth2Client, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
};

const getClientFromCredentials = (credentials) => {
  
  const {
    installed: {
      client_secret,
      client_id,
      redirect_uris
    }
  } = credentials;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  return oAuth2Client;
};

const checkForToken = async (oAuth2Client) => {
    try {
    const token = await readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(token);

    return Promise.resolve({ oAuth2Client, authorized: true });

  } catch (err) {
    console.log('failed to read token file');
    console.log('error:', err);
    return Promise.resolve({ oAuth2Client, authorized: false });
  }
};

const getClientAndCheckForPreAuthorization = async (credentials) => {

  const oAuth2Client = getClientFromCredentials(credentials);

  return checkForToken(oAuth2Client);
};

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return console.error('Error retrieving access token', err);
      }
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          return console.error(err);
        }
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
};

const generateNewToken = oAuth2Client => new Promise((resolve, reject) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();

    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return reject(new Error(`Error retrieving access token ${err.message}`));
      }
      oAuth2Client.setCredentials(token);

      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          return console.error(err);
        }
        console.log('Token stored to', TOKEN_PATH);
      });
      return resolve(oAuth2Client);
      // callback(oAuth2Client);
    });
  });
});

function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) {
      return console.log('The API returned an error: ' + err);
    }
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
};

const listAllLabels = (auth) => new Promise((resolve, reject) => {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.labels.list({ userId: 'me' }, (err, res) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      reject(err);
    }
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
    resolve();
  });
});

const main = async () => {
  
  let credentialsObject;
  try {
    credentialsObject = await readFile(CREDENTIALS_FILE_PATH);
  } catch (err) {
    console.error(err);
  }

  const { authorized, oAuth2Client } = await getClientAndCheckForPreAuthorization(credentialsObject);

  if (!authorized) {
    await generateNewToken(oAuth2Client);
  }

  await listAllLabels(oAuth2Client);
};


// const oAuthloginRouteHandler = async (req, res) => {
  
//   let credentialsObject;
//   try {
//     credentialsObject = await readFile(CREDENTIALS_FILE_PATH);
//   } catch (err) {
//     console.error(err);
//   }

//   const { authorized, oAuth2Client } = await getClientAndCheckForPreAuthorization(credentialsObject);

//   if (!authorized) {
//     await generateNewToken(oAuth2Client);
//   }

//   await listAllLabels(oAuth2Client);
// };

module.exports = {
  main,
  listLabels,
  // oAuthRoutehandler,
  readFile,
  getClientFromCredentials,
  getClientAndCheckForPreAuthorization
};