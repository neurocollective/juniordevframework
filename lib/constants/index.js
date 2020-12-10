/* eslint-disable */
let SEARCH_ALL_PAGES = false;
const isNode = typeof process !== 'undefined';

if (isNode && process.env.SEARCH_ALL_PAGES && process.env.SEARCH_ALL_PAGES.toLowerCase() === 'true') {
  SEARCH_ALL_PAGES = true;
}

const JOB_TITLE_DESCRIPTIONS = [
  '',
  'Front End',
  'Back End',
  'Data',
  'Fullstack',
  'Server',
  'Client',
  'UI',
  'UX'
];

const DEVELOPER = 'developer';
const ENGINEER = 'engineer';
const PROGRAMMER = 'programmer';
const SOFTWARE = 'software';
// const SOFTWARE_ENGINEER = 'software engineer';
const SPECIALIST = 'specialist';
const ARCHITECT = 'architect';
const APPLICATIONS = 'applications';

const lowerCaseify = (titles) => titles.map((title) => title.toLowerCase());

const createDeveloperJobTitlePermutations = (descriptions) => {
  const baseTitles = [
    ENGINEER,
    DEVELOPER,
    PROGRAMMER,
    ARCHITECT,
    SPECIALIST
  ];

  const titles = baseTitles.reduce((accumulator, title) => {
    return accumulator.concat([
      title,
      `${SOFTWARE} ${title}`,
      `${APPLICATIONS} ${title}`
    ]);
  }, []);


  return descriptions.reduce((accumulator, description) => {
    const titlesWithDescription = titles.map((title) => {
      if (description === '') {
        return title;
      }
      return `${description} ${title}`
    });
    return accumulator.concat(titlesWithDescription);
  }, []);
};

const cleanUp = (titles) => {
  const lowerCaseTitles = lowerCaseify(titles);

  // these four titles, without modifiers, are too generic
  return lowerCaseTitles.filter((title) => (
    title !== 'engineer' &&
    title !== 'architect' &&
    title !== 'developer' &&
    title !== 'specialist'
  ));
}

const DEVELOPER_JOB_TITLES_LIST = createDeveloperJobTitlePermutations(JOB_TITLE_DESCRIPTIONS);

const UI_CONSTANTS = {
  PAGES: {
    ACCOUNT: 'account',
    RESULTS: 'results',
    TODOS: 'todos',
    CONTACTS: 'contacts',
    HOME: '',
    LOGIN: 'login',
    SIGNUP: 'signup'
  },
  ACTION_TYPES: {
    LOAD_PAGE_DATA_SUCCESS: 'LOAD_PAGE_DATA_SUCCESS',
    LOAD_PAGE_DATA_ERROR: 'LOAD_PAGE_DATA_ERROR',
    CHANGE_ROUTE: 'CHANGE_ROUTE',
    INCREMENT_PAGE_COUNT: 'incrementPageCount',
    GO_TO_LOGIN: 'goToLogin',
    TOGGLE_MENU: 'toggleMenu',
    GO_HOME: 'goHome',
    GO_TO_ACCOUNT: 'goToAccount',
    GO_TO_RESULTS: 'goToResults',
    GO_TO_TODOS: 'goToToDos',
    GO_TO_CONTACTS: 'goToContacts',
    GO_TO_SIGNUP: 'goToSignup',
    LOGIN_ERROR: 'loginError'
  },
  APP_NAME: 'Junior Dev Framework',
};

const OAUTH = {
  SCOPES: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
  ],
  TESTING_EMAIL: 'david@neurocollective.io',
  SPACE_CHARACTER_FOR_SCOPES: ' ',
  AUTHORIZE_BASE_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  GET_TOKEN_BASE_URL: 'https://oauth2.googleapis.com/token'
};

const MIDDLEWARE = {
  VALID_TOKEN: 'validToken',
  USER_ID: 'userId',
  REDIRECT_URL: 'redirectUrl'
};

const ROUTING = {
  SLASH_LOGIN: '/login',
  SLASH_OAUTH: '/oauth',
  SLASH_PAGELOAD: '/pageload',
  SLASH_USER: '/user'
};

const EMAIL_SCAN_TARGET_HEADERS = {
  RECEIVED: 'Received',
  FROM: 'From',
  TO: 'To'
};

const COOKIES = {
  KEY: 'juniordevframework_sigil',
  COOKIE_MAX_AGE: 60 * 60 * 1000,
  CUSTOM_COOKIE_HEADER: 'Custom-Cookie-JuniorDevFrameWork'
};

const constants = {
  CONTACT_ACTION_TYPES: {
    EMAIL: 'email',
    LINKEDIN: 'linkedin',
    PHONE: 'phone',
    TEXT: 'text',
    INTERNET: 'internet',
    IN_PERSON: 'in-person'
  },
  JOB_COMMAND_CREATE_USER_LISTINGS: 'create_user_listings',
  JOB_COMMAND_SCAN_EMAILS: 'scan_emails',
  TABLES: {
    JOB_LISTING: 'job_listing',
    APP_USER: 'app_user',
    USER_JOB_LISTING: 'user_job_listing',
    JOB_SEARCH_CONTACT: 'job_search_contact',
    CONTACT_ACTION: 'contact_action',
    USER_PREFERENCES: 'user_preferences',
    USER_JOB_FILTERS: 'user_job_filters',
    OAUTH_TOKEN: 'oauth_token',
    OAUTH_CREDENTIALS: 'oauth_credentials',
    EMAIL_SCAN_RECORD: 'email_scan_record'
  },
  CREDENTIALS_ACCESS_KEYS: {
    INSTALLED: 'installed',
    WEB: 'web'
  },
  EMAIL_SCAN: {
    HEADERS: EMAIL_SCAN_TARGET_HEADERS,
    TARGET_MIME_TYPES_SET: new Set([
      'multipart/alternative',
      'text/plain',
      'text/html'
    ]),
    TARGET_HEADERS_SET: new Set(
      Object.keys(EMAIL_SCAN_TARGET_HEADERS).map(key => EMAIL_SCAN_TARGET_HEADERS[key])
    )
  }
};

const CONSTANTS = {
  JOB_TITLES_LIST: cleanUp(DEVELOPER_JOB_TITLES_LIST),
  START_QUERY_PARAMETER_KEY: 'start',
  SEARCH_ALL_PAGES,
  UI_CONSTANTS,
  OAUTH,
  MIDDLEWARE,
  COOKIES,
  ROUTING,
  ...constants
};

module.exports = CONSTANTS;
