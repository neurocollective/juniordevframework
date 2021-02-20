/* eslint-disable */
import CONSTANTS from '../../../constants';
import v1 from './v1.js';

const {
  CONTACT_ACTION_TYPES: {
    EMAIL,
    LINKEDIN,
    PHONE,
    TEXT,
    INTERNET,
    IN_PERSON,
  },
} = CONSTANTS;

const {
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
    // LAST_EMAIL_SCAN,
    EDGE_DATE_EMAILS,
    UNRECOGNIZED_EMAILS,    
  },
} = CONSTANTS;

const queryBuilders = {
  ...v1,
  buildGetjobContactsForUserQuery: (userId) => `
    SELECT * FROM ${JOB_SEARCH_CONTACT}
    where user_id = ${userId};
  `,
  buildGetLastEmailsScanForUserIdQuery: (userId) => `
    SELECT * FROM ${EMAIL_SCAN_RECORD}
    where user_id = ${userId};
  `,
  buildGetEdgeDateEmailsForUserIdQuery: (userId) => `
    SELECT * FROM ${EDGE_DATE_EMAILS}
    where user_id = ${userId};
  `,
  buildGetUnrecognizedEmailsForUserIdQuery: (userId) => `
    SELECT * FROM ${UNRECOGNIZED_EMAILS}
    where user_id = ${userId};
  `
};

// override any here as needed

export default queryBuilders;
