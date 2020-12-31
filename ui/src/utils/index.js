import CONSTANTS from '../../../lib/constants';

const {
  MIDDLEWARE: {
    REDIRECT_URL
  },
  OAUTH: {
    AUTHORIZE_BASE_URL
  },
  UI_CONSTANTS: {
    ACTION_TYPES: {
      GO_TO_LOGIN
    }
  },
  ROUTING: {
    SLASH_LOGIN
  },
  COOKIES: {
    CUSTOM_COOKIE_HEADER
  }
} = CONSTANTS;

// gets JSON with fetch, but redirects the page if the json response prompts it
export const buildFetchJsonOrRedirect = (dispatch) => async (fetchOptions) => {
  const { url } = fetchOptions;

  // set defaults?
  const options = {
    ...fetchOptions,
    credentials: 'include' // send cookies the browser has for the domain
  };

  const response = await fetch(url, options);

  const {
    ok,
    statusCode,
    headers
  } = response;

  const json = await response.json();

  const {
    [REDIRECT_URL]: redirectURL
  } = json;

  let STORAGE;
  if (typeof localStorage !== 'undefined') {
    STORAGE = localStorage;
  } else {
    STORAGE = {
      getItem: () => {},
      setItem: () => {}
    };
  }

  const cookie = headers.get(CUSTOM_COOKIE_HEADER);
  if (cookie && cookie !== 'undefined') {
    STORAGE.setItem(CUSTOM_COOKIE_HEADER, cookie);
  }

  if (!redirectURL) {
    const { onJson } = fetchOptions;

    if (typeof onJson === 'function') {
      return onJson(statusCode, ok, json);
    }

    console.error('no fetchOptions.onJson, ignoring response');
    return '';
  }
  if (redirectURL.includes(AUTHORIZE_BASE_URL)) {
    window.location.href = redirectURL;
    return '';
  }

  // putting in a switch in case we want other routing options later.
  // If SLASH_LOGIN turns out to be the only option needed, this can refactor
  switch (redirectURL) {
    case SLASH_LOGIN:
      console.log('REDIRECTING TO', SLASH_LOGIN);
      console.log(`GO_TO_LOGIN ${GO_TO_LOGIN}`);
      return dispatch(GO_TO_LOGIN);
    default:
      console.log(`ignoring redirectURL value of ${redirectURL} in json response.`);
  }
  return '';
};

export const aFunction = () => ({});
