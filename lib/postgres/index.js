/* eslint-disable */
// const { Client } = require('pg');
const {
  CREDENTIALS_ACCESS_KEYS: {
    INSTALLED, WEB
  }
} = require('../constants');
const { queries, queryBuilders } = require('./queries');
const {
  getAllJobListingsQuery,
  insertUsersQuery,
  insertSeedJobListingsQuery,
  createUserPreferencesTableQuery,
  // createJobApplicationTableQuery,
  createJobListingTableQuery,
  createUserTableQuery,
  createUserJobListingTableQuery,
  getAllUserIdsQuery,
  createOAuthTokenTableQuery,
  getCredentialsQuery,
  createOAuthCredentialsTableQuery
} = queries;
const {
  buildGetAllUserJobListingsByIdQuery,
  buildGetJobListingDataForUserQuery,
  buildGetOAuthTokenForUserId,
  buildGetUserIdForEmail,
  buildInsertTokenQuery,
  buildInsertCredentialsQuery,
  buildInsertRefreshedTokenQuery,
  buildUpdateTokenForUserIdQuery,
  buildGetEmailForUserId
} = queryBuilders;

const buildInsertQueryFromJobListingResultObjects = jobListingsResultsArray => {

  const insertQuery =  jobListingsResultsArray.reduce((queryString, jobListingObject, index, { length: size }) => {
    const lastIndex = size - 1;
    const {
      company,
      jobTitle,
      location,
      url,
      jobBoard
    } = jobListingObject;

    if (!company) {
      console.log(`missing company string, for jobTitle '${jobTitle}' at '${company}'`);
    }

    if (!jobTitle) {
      console.log(`missing jobTitle string, for jobTitle '${jobTitle}' at '${company}'`);
    }

    if (!location) {
      console.log(`missing location string, for jobTitle '${jobTitle}' at '${company}'`);
    }

    if (!url) {
      console.log(`missing url string, for jobTitle '${jobTitle}' at '${company}'`);
    }

    const suffix = (lastIndex === index) ? ';' : ',';

    const formattedValues = `(nextval('job_listing_id_seq'),'${company}','${jobTitle}','${location}',now(),'${jobBoard}','${url}',now())`;

    return `${queryString}${formattedValues}${suffix}`;
  }, 'INSERT INTO job_listing VALUES');

  return `BEGIN TRANSACTION;${insertQuery}END TRANSACTION;`;
};

const buildInsertQueryFromListings = (userListingsToAdd) => {
  const userListingEntries = Array.from(userListingsToAdd.entries());

  const fullInsertQuery = userListingEntries.reduce((queryString, [userId, listingIdsToAddSet], userListIndex) => {
    const lastUserIdIndex = userListingEntries.length - 1;

    const listingIdsArray = Array.from(listingIdsToAddSet);
    const fullQueryStringForUserId = listingIdsArray.reduce((subQueryString, listingId, listingIdIndex) => {
      const lastListingIdIndex = listingIdsArray.length - 1;
      const isLastIndex = userListIndex === lastUserIdIndex &&
        lastListingIdIndex === listingIdIndex;

      const suffix = (isLastIndex) ? ';' : ',';

      const formattedValues = `(nextval('user_job_listing_id_seq'),${userId},'${listingId}')`;

      return `${subQueryString}${formattedValues}${suffix}`;
    }, '');

    return `${queryString}${fullQueryStringForUserId}`;

  }, 'INSERT INTO user_job_listing VALUES ');

  const thereIsDataToinsert = fullInsertQuery.includes('(');
  if (!thereIsDataToinsert) {
    return '';
  }

  return `BEGIN TRANSACTION;${fullInsertQuery}END TRANSACTION;`;
};


// All dbFunctions return a promise for pg's Result object
const buildDbFunctions = client => {
  if (!client || !client.query || typeof client.query !== 'function') {
    throw new Error('invalid client passed to buildDbFunctions');
  }
  return {
    createTables: async () => { // TODO - make a transaction?
      try {
        await client.query(createJobListingTableQuery);
      } catch (err) {
        console.error('failed during createJobListingTableQuery()');
        console.error(err);
        process.exit(1);
      }
      try {
        await client.query(createUserTableQuery);
      } catch (err) {
        console.error('failed during createUserTableQuery()');
        console.error(err);
        process.exit(1);
      }
      try {
        await client.query(createUserJobListingTableQuery);
      } catch (err) {
        console.error('failed during createUserJobListingTableQuery()');
        console.error(err);
        process.exit(1);
      }
      try {
        await client.query(createUserPreferencesTableQuery);
      } catch (err) {
        console.error('failed during createUserPreferencesTableQuery()');
        console.error(err);
        process.exit(1);
      }
      try {
        await client.query(createOAuthTokenTableQuery);
      } catch (err) {
        console.error('failed during createOAuthTokenTableQuery()');
        console.error(err);
        process.exit(1);
      }
      try {
        await client.query(createOAuthCredentialsTableQuery);
      } catch (err) {
        console.error('failed during createOAuthCredentialsTableQuery()');
        console.error(err);
        process.exit(1);
      }
      try {
        await client.query(createEmailScanRecordTableQuery);
      } catch (err) {
        console.error('failed during createEmailScanRecordTableQuery()');
        console.error(err);
        process.exit(1);
      }
    },
    insertSeedDataIntoTables: async (credentialsObject, tokenObject, userId = 1) => {
      console.log('seeding...');
      console.log('credentials:', credentialsObject);
      // await client.query(insertUsersQuery);

      let credentialsAccessKey = INSTALLED;

      if (!credentialsObject[credentialsAccessKey]) {
        credentialsAccessKey = WEB;
      }

      if (!credentialsObject[credentialsAccessKey]) {
        console.error(`neither credentials.${INSTALLED} nor credentials.${WEB} exist inside credentials object!`);
        process.exit(1);
      }

      const {
        [credentialsAccessKey]: {
          client_id,
          client_secret,
          redirect_uris
        }
      } = credentialsObject;

      // TODO - these value should be encrypted, a decryption step will be required here
      const insertCredentialsQuery = buildInsertCredentialsQuery(client_id, client_secret, redirect_uris.join(','));
      
      await client.query(insertCredentialsQuery);

      // if (tokenObject) {
      //   const insertTokenQuery = buildInsertTokenQuery(tokenObject, userId);
      //   await client.query(insertTokenQuery);
      //   return;
      // }
    },
    insertJobListingResults: (jobListingResultObjectsArray) => {
      const query = buildInsertQueryFromJobListingResultObjects(jobListingResultObjectsArray);
      return client.query(query);
    },
    insertToken: (tokenObject, userId) => {
      const query = buildInsertTokenQuery(tokenObject, userId);
      return client.query(query);
    },
    insertRefreshedToken: (tokenObject, userId) => {
      const query = buildInsertRefreshedTokenQuery(tokenObject, userId);
      return client.query(query);
    },
    updateTokenValueForUser: (token, id) => client.query(buildUpdateTokenForUserIdQuery(token, id)),
    getAllJobListings: () => client.query(getAllJobListingsQuery),
    getAllUserIds: () => client.query(getAllUserIdsQuery),
    disconnect: () => client.end(),
    getUserListings: (id) => {
      const query = buildGetAllUserJobListingsByIdQuery(id);
      return client.query(query);
    },
    getListingsForUser: (id) => {
      const query = buildGetJobListingDataForUserQuery(id);
      return client.query(query);      
    },
    getOAuthTokenForUserId: (id) => {
      const query = buildGetOAuthTokenForUserId(id);
      return client.query(query);
    },
    getCredentials: () => {
      const query = getCredentialsQuery;
      return client.query(query);
    },
    getUserIdForEmail: (email) => {
      const query = buildGetUserIdForEmail(email);
      return client.query(query); 
    },
    getEmailForUserId: (userId) => {
      const query = buildGetEmailForUserId(userId);
      return client.query(query); 
    },
    insertUserListingsFromGeneratedQuery: query => client.query(query), // still needed?
    executeQuery: query => client.query(query),
    insertNewUser: (email, firstName, lastName, hashedPassword) => {
      const query = queryBuilders.buildInsertUserQuery(email, firstName, lastName, hashedPassword);
      return client.query(query);
    } 
  };
};

const bootstrapPostgresFunctions = (Client, connectionString) => {
  let client;
  
  if (connectionString) {
    client = new Client({ connectionString });
  } else {
    console.log('postgres client using local defaults');
    client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'test',
      port: 5432
    });
  }

  console.log('postgres client connecting...');
  client.connect((err) => {
    if (err) {
      console.error('postgres connection error:', err.message);
      console.error(err.stack);
      process.exit(1);
    } else {
      console.log('postgres connected successfully.')
    }
  });
  return buildDbFunctions(client);
};

module.exports = {
  bootstrapPostgresFunctions,
  buildInsertQueryFromJobListingResultObjects,
  buildInsertQueryFromListings,
  buildDbFunctions
};
