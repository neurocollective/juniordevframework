/* eslint-disable */
const fs = require('fs');
const { v4: uuid } = require('uuid');
const request = require('request-promise-native');
const {
  buildDbFunctions,
} = require('./postgres');
const CONSTANTS = require('./constants');
const { 
  START_QUERY_PARAMETER_KEY,
  SEARCH_ALL_PAGES,
  UI_CONSTANTS,
  OAUTH,
  MIDDLEWARE,
  COOKIES
} = CONSTANTS;

const {
  REDIRECT_URL
} = MIDDLEWARE;

const {
  KEY: COOKIE_KEY,
  COOKIE_MAX_AGE,
  CUSTOM_COOKIE_HEADER
} = COOKIES;

const readFile = path => new Promise((resolve, reject) => {
  fs.readFile(path, (error, buffer) => {
    if (error) {
      return reject(error);
    }
    return resolve(buffer.toString());
  });
});

const writeToFile = (path, contentsString) => new Promise((resolve, reject) => {
  fs.writeFile(path, contentsString, (error) => {
    if (error) {
      return reject(error);
    }
    return resolve();
  });
});

const readJson = path => readFile(path).then(string => JSON.parse(string));

const isTokenExpiredByUnixTime = (token, nowUnixTime) => {
  // console.log();

  if (!token) {
    return true;
  }

  const receivedDate = token['received_time_log'];
  // console.log('received instanceof Date:', receivedDate instanceof Date);
  const expiresIn = token['expires_in'];

  if (!receivedDate || !expiresIn) {
    console.log('no received_time_log or expires_in value, retuning isTokenExpired = true');
    return true;
  }

  try {
    const receivedAsUnixTime = receivedDate.getTime();
    const expirationDuration = Number(expiresIn);
    const expirationUnixTime = receivedAsUnixTime + expirationDuration;

    if (expirationUnixTime < nowUnixTime) {
      return true;
    }

  } catch (err) {
    console.error('error during isTokenExpired:', err);
    return true;
  }
  return false;
};


const isTokenExpiredByAPICheck = async (token) => {
  
  if (!token) {
    return true;
  }

  let error, response, statusCode;
  try {
    ({ error, response, statusCode } = await getGmailProfile(token))
  } catch (err) {
    console.error('error during isTokenExpired:', err.message, 'statusCode is:', statusCode);
    return true;
  }

  if (statusCode < 200 || statusCode > 299) {
    console.log(`token expired, got statusCode: ${statusCode}, response: ${JSON.stringify(response)}`);
    return true;
  }
  return false;
};

const readJSONFromFile = filePath => new Promise((resolve, reject) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      return reject(new Error(`Error reading file at ${filePath}: ${err.message}`));
    }
    return resolve(JSON.parse(content));
  });
});

const writeStringToFile = (filePath, contentsString) => new Promise((resolve, reject) => {
  fs.writeFile(filePath, contentsString, err => {
    if (err) {
      return reject(err);
    }
    return resolve();
  });
});

const {
  ACTION_TYPES: {
    CHANGE_ROUTE
  }
} = UI_CONSTANTS;

const fetchJSON = async (url, options = {}) => {

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    return [response.status, response.ok, json];
  } catch (error) {
    const { message } = error;
    console.error(`failed during fetch to ${url}: ${message}`);
    return [-1, false, { error: message }];
  }
};

const adjustStateToLoadingPath = (dispatch) => {
  const {
    location: {
      pathname
    }
  } = window;

  dispatch({ type: CHANGE_ROUTE, destination: pathname.replace(/\//g, '') });
};

const buildScrubberUtility = dbRows => {

  const existingListingsMap = getListingsMappedToTitleSet(dbRows);
  // console.log('elm:', existingListingsMap);

  let newJobListingObjectArray = [];

  const concatenateNewJobListingObjectsArray = (newResults) => {
    newJobListingObjectArray = newJobListingObjectArray.concat(newResults);
  };

  const getNewJobListingObjectArray = () => newJobListingObjectArray;

  const getExistingListingsMap = () => existingListingsMap;

  // TODO - only comparing jobTitle and company. Should jobTitle + location be the key?
  const scrubResultsForJobTitle = (searchedJobTitle, results) => {

    const initialAccumulator = { existingListingsMap: getExistingListingsMap(), newResultObjects: [] };
    const { newResultObjects: newResults } = results.reduce((accumulator, resultObject) => {
      const {
        existingListingsMap,
        newResultObjects
      } = accumulator;
      const {
        company,
        jobTitle: titleForThisJob,
        location
      } = resultObject;

      if (!existingListingsMap[company]) {
        existingListingsMap[company] = new Set();
      }
      const currentListingsForTitle = existingListingsMap[company];

      if (currentListingsForTitle.has(titleForThisJob)) {
        return { existingListingsMap, newResultObjects };
      } else {
        currentListingsForTitle.add(titleForThisJob);
        newResultObjects.push(resultObject);
      }

      return { existingListingsMap, newResultObjects };
    }, initialAccumulator);

    // TODO - don't assume they are all new, only add the entries that are NOT in existingListingsMap
    concatenateNewJobListingObjectsArray(newResults);
  };
  return {
    scrubResultsForJobTitle,
    getNewJobListingObjectArray,
    getExistingListingsMap
  };
};

const getNextPageUrlFromCurrentUrl = (currentUrl) => {
  try {
    const queryBeginIndex = currentUrl.indexOf('?');
    if (queryBeginIndex < 0) {
      return `${currentUrl}?start=10`;
    }

    const urlWithoutQuery = currentUrl.slice(0, queryBeginIndex);
    const queryString = currentUrl.slice(queryBeginIndex + 1);
    const pairs = queryString.split('&');
    const queryObject = pairs.reduce((query, pairString) => {
      const [key, value] = pairString.split('=');
      query[key] = value;
      return query;
    }, {});

    let { [START_QUERY_PARAMETER_KEY]: page } = queryObject;

    if (!page) {
      page = 0;
    }

    const pageNumber = parseInt(page);

    queryObject[START_QUERY_PARAMETER_KEY] = String(pageNumber + 10);

    const reStringedQuery = Object.keys(queryObject).reduce((queryString, queryKey, index) => {
      const separator = (index === 0) ? '?' : '&';
      const pairAsString = `${queryKey}=${queryObject[queryKey]}`;
      return `${queryString}${separator}${pairAsString}`;
    }, '');

    return `${urlWithoutQuery}${reStringedQuery}`;
  } catch (err) {
    console.error(`error during getNextPageUrlFromCurrentUrl ${err.message}`);
    return null;
  }
};

const getListingsMappedToTitleSet = (rows = []) => {

  // let inactiveListings = {};
  const reducedToMap = rows.reduce((accumulator, row) => {
    const {
      company_name: company,
      job_title: jobTitle,
      location,
      apply_url: url
      // inactive_date: inactiveDate
    } = row;

    // TODO - consider inactive listings and queue them up for reactivation?
    // if (inactiveDate) {
    //  inactiveListings[]
    // }

    const nameIsInAccumulator = company in accumulator;
    if (!nameIsInAccumulator) {
      // const targetSet = accumulator[name];
      const itIsASet = accumulator[company] instanceof Set;

      if (!itIsASet) {
        accumulator[company] = new Set();
      }
      
      accumulator[company].add(jobTitle);

      return accumulator;
    }

    accumulator[company] = new Set([jobTitle]);
    return accumulator;
  }, {});

  return reducedToMap;
};

const wipeHTMLTagsFromString = (stringThatMaybeHasHTML) => {
  const { length: size } = stringThatMaybeHasHTML;
  const rangesToWipe = [];

  let tagOpen = false;
  let currentPair = [null, null];
  let foundATag = false;
  stringThatMaybeHasHTML.split('').forEach((char, i) => {
    if (!tagOpen && char === '<') {
      foundATag = true;
      tagOpen = true;
      currentPair[0] = i;
      return;
    }
    if (tagOpen && char === '>') {
      currentPair[1] = i;
      rangesToWipe.push(currentPair);
      currentPair = new Array(2).fill(null);
      tagOpen = false;  
    }
  });

  if (!foundATag) {
    return stringThatMaybeHasHTML;
  }

  const inputAccumulator = {
    previousIndex: 0,
    originalString: stringThatMaybeHasHTML,
    wipedString: ''
  };
  const { length: rangesCount } = rangesToWipe;

  const { wipedString: result } = rangesToWipe.reduce((accumulator, twoIndexRangeList, index) => {
    const {
      previousIndex,
      originalString,
      wipedString
    } = accumulator;


    const sliceStart = (index === 0) ? previousIndex : previousIndex + 1;

    let portionToRetain = originalString.slice(sliceStart, twoIndexRangeList[0]);

    if (index === rangesCount - 1) {
      portionToRetain = portionToRetain + originalString.slice(twoIndexRangeList[1] + 1, originalString.length);
    }

    return {
      previousIndex: twoIndexRangeList[1],
      originalString,
      wipedString: wipedString + portionToRetain
    };
  }, inputAccumulator);

  return result;
};

const {
  SCOPES,
  SPACE_CHARACTER_FOR_SCOPES,
  TESTING_EMAIL,
  AUTHORIZE_BASE_URL,
  GET_TOKEN_BASE_URL
} = OAUTH;

const getAuthUrlFromCredentials = (credentials, userId, email) => {

  // console.log('credentials', credentials);

  const {
    ['client_id']: client_id,
    ['redirect_uris']: redirect_uris
  } = credentials;

  const redirectURIs = redirect_uris.split(',');

  // console.log('redirect_uris:', redirect_uris);

  const queryValues = {
    'scope': SCOPES.join(SPACE_CHARACTER_FOR_SCOPES),
    client_id,
    'response_type': 'code',
    'redirect_uri': redirectURIs[0],
    'access_type': 'offline'
  };

  if (userId) {
    queryValues['state'] = String(userId);
  }

  if (email) {
    queryValues['login_hint'] = email;
  }

  const queryString = new URLSearchParams(queryValues);

  return `${AUTHORIZE_BASE_URL}?${queryString.toString()}`;
};

const requestToken = async (credentials, code) => {
  // console.log('requestToken');
  const {
    ['client_id']: client_id,
    ['client_secret']: client_secret,
    ['redirect_uris']: redirect_uris
  } = credentials;

  const redirectURIs = redirect_uris.split(',');

  const uri = `${GET_TOKEN_BASE_URL}`;

  const form = {
    client_id,
    client_secret,
    'redirect_uri': redirectURIs[0],
    code,
    grant_type: 'authorization_code',
    access_type: 'offline'
  };

  const requestOptions = {
    method: 'POST',
    form,
    uri,
    resolveWithFullResponse: true,
    simple: false
  };

  try {
    const response = await request(requestOptions);
    const { body, statusCode } = response;

    console.log('raw token response:', body);

    const TOKEN_FILE_PATH = `${process.cwd()}/server/token.json`;
    await writeStringToFile(TOKEN_FILE_PATH, body);

    return { response: JSON.parse(body), statusCode, error: null };
  } catch (error) {
    console.error('error getting token:', error.message);
    return { error, statusCode };
  }
};

const refreshToken = async (credentials, existingTokenObject, userId) => {

  const {
    ['client_id']: client_id,
    ['client_secret']: client_secret,
    ['redirect_uris']: redirect_uris
  } = credentials;

  const { refresh_token } = existingTokenObject;

  const uri = `${GET_TOKEN_BASE_URL}`;

  const form = {
    client_id,
    client_secret,
    refresh_token,
    grant_type: 'refresh_token'
  };

  const requestOptions = {
    method: 'POST',
    form,
    uri,
    resolveWithFullResponse: true
  };

  try {
    const response = await request(requestOptions);
    const { body } = response;

   // console.log('body', body);

    // await writeFile(TOKEN_FILE_PATH, body);

    return JSON.parse(body);
  } catch (error) {
    return null;
  }
};

// possible resource: [users]
// possible actions: messages, messages + identifier, messages/send 
const getGmailUrl = (resource, action, identifier) => {
  const suffix = identifier ? `/${identifier}` : '';
  return `https://gmail.googleapis.com/gmail/v1/${resource}/me/${transformedAction}${suffix}`;
};

const getGmailProfile = async (token) => {

  // console.log('typeof token', typeof token);

  // console.log('token passed to getGmailProfile:', token);
  const uri = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';

  const requestOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    uri,
    resolveWithFullResponse: true,
    simple:false
  };

  try {
    const response = await request(requestOptions);

    const { body, statusCode } = response;
    // status = statusCode;

    return { response: JSON.parse(body), statusCode, error: null };
  } catch (error) {

    console.error('error getting gmail profile:', error.message);

    return { error };
  }
};

const getGmailMessages = async (tokenObject = {}) => {
  const { access_token: token } = tokenObject;

  const uri = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';

  const requestOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    uri,
    resolveWithFullResponse: true,
    simple:false
  };

  try {
    const response = await request(requestOptions);
    const { body, statusCode } = response;
    // status = statusCode;

    return { response: JSON.parse(body), statusCode, error: null };
  } catch (error) {
    console.error('error getting gmail profile:', error.message);
    return { error };
  }
};

const getAuthURLAndSendRedirectJSON = (res, contextObject, statusCode = 200) => {
  const { credentialsObject, id, email } = contextObject;
  const authURL = getAuthUrlFromCredentials(credentialsObject, id, email);
  return res.status(statusCode).json({ [REDIRECT_URL]: authURL });
};

const createSessionCookie = async (res, redisFunctions, userId) => {
  const cookieValue = uuid();
  res.cookie(COOKIE_KEY, cookieValue, { maxAge: COOKIE_MAX_AGE, httpOnly: true });
  res.set({
    // [CUSTOM_COOKIE_HEADER]: `cookie:${cookieValue}`
    [CUSTOM_COOKIE_HEADER.toLowerCase()]: cookieValue,
    [CUSTOM_COOKIE_HEADER]: cookieValue
  });

  console.log('res.headers:', res.headers);

  try {
    await redisFunctions.mapCookieAndUserId(cookieValue, userId);
  } catch (err) {
    console.error('error setting key/value in redis:', err);
    return Promise.reject(err);
  }

  return cookieValue;
};

const exportsObject = {
  readFile,
  readJson,
  writeToFile,
  buildDbFunctions,
  fetchJSON,
  adjustStateToLoadingPath,
  buildScrubberUtility,
  getNextPageUrlFromCurrentUrl,
  wipeHTMLTagsFromString,
  isTokenExpiredByAPICheck,
  readJSONFromFile,
  writeStringToFile,
  requestToken,
  refreshToken,
  getGmailProfile,
  getAuthUrlFromCredentials,
  getAuthURLAndSendRedirectJSON,
  createSessionCookie,
  getGmailMessages
};

module.exports = exportsObject;
