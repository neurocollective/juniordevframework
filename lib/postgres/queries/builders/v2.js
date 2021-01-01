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
    EMAIL_SCAN_RECORD
  }
} = require('../../../constants');
const v1 = require('./v1.js');


const queryBuilders = {
  ...v1
};

// override any here as needed

module.exports = queryBuilders;
