/* eslint-disable */
import CONSTANTS from '../../../constants';
import v1 from './v1.js';

const {
  EMAIL,
  LINKEDIN,
  PHONE,
  TEXT,
  INTERNET,
  IN_PERSON
} = CONSTANTS.CONTACT_ACTION_TYPES;

const {
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
} = CONSTANTS.TABLES;

const queryBuilders = {
  ...v1,
  buildGetjobContactsForUserQuery: (userId) => `
    SELECT * FROM ${JOB_SEARCH_CONTACT}
    where user_id = ${userId};
  `
};

// override any here as needed

export default queryBuilders;
