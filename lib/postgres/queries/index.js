/* eslint-disable */
const {
  CONTACT_ACTION_TYPES: {
    EMAIL,
    LINKEDIN,
    PHONE,
    TEXT,
    INTERNET,
    IN_PERSON    
  },
  TABLES: {
    JOB_LISTING,
    APP_USER,
    USER_JOB_LISTING,
    JOB_SEARCH_CONTACT,
    CONTACT_ACTION,
    USER_PREFERENCES,
    USER_JOB_FILTERS,
    OAUTH_TOKEN,
    OAUTH_CREDENTIALS,
    EMAIL_SCAN_RECORD,
    JOB_SEARCH_ENTITY
  }
} = require('../../constants');
const createTableQueriesV1 = require('./create_tables/v1');
const queryBuildersV1 = require('./builders/v1');
const createTableQueriesV2 = require('./create_tables/v2');
const queryBuildersV2 = require('./builders/v2');

// create queries

// NOTE: raw values in createJobListingTableQuery are unformatted as they appeared in source, for later display
// company_name, location, job_title are expected to have been formatted prior to insert
// TODO - should there be a constraint on the non-raw values that disallows space characters?

// TODO - SQL injection risk present, queries need to be refactored to send parameters separately

// insert queries

const insertSeedJobListingsQuery = `
  INSERT INTO ${JOB_LISTING} VALUES (
    nextval('${JOB_LISTING}_id_seq'),
    'giga_firm',
    'open source infiltrator',
    'nyc',
    now(),
    'indeed.com',
    now()
  ), 
  (
    nextval('${JOB_LISTING}_id_seq'),
    'douchr',
    'ten exxer',
    'nyc',
    now(),
    'indeed.com',
    now()
  );
`;

const insertUsersQuery = `
  INSERT INTO ${APP_USER} VALUES
  (
    nextval('${APP_USER}_id_seq'),
    'johny@johnnymccodes.com',
    'pw',
    now()
  );
`;

// read queries

const getAllJobListingsQuery = `
  SELECT * from ${JOB_LISTING};
`;

const getAllUserIdsQuery = `
  SELECT id FROM ${APP_USER};
`;

const getCredentialsQuery = `SELECT * FROM ${OAUTH_CREDENTIALS};`;

const v1Queries = {
  getAllJobListingsQuery,
  insertUsersQuery,
  insertSeedJobListingsQuery,
  getAllUserIdsQuery,
  getCredentialsQuery
};

const v2Queries = {
  getAllJobEntitiesQuery: () => `SELECT * FROM ${JOB_SEARCH_ENTITY};`
};

module.exports = {
  'v1': {
    queries: v1Queries,
    createTableQueries: createTableQueriesV1,
    queryBuilders: queryBuildersV1
  },
  'v2': {
    queries: {
      ...v1Queries,
      ...v2Queries
    },
    createTableQueries: createTableQueriesV2,
    queryBuilders: queryBuildersV2
  }
};