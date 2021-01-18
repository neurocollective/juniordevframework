/* eslint import/prefer-default-export: 0 */
const REGEX_REPLACEMENT_PAIRS = [
  {
    regex: /\. /g, // dot abbreviations, like 'Mt. Sinai', can be treated like spaces
    replacement: '_'
  },
  {
    regex: / +/g, // spaces become underscoes
    replacement: '_',
  },
  {
    regex: /,:;'/g, // wipe some special characters
    replacement: ''
  }
];

const DOT_REPLACEMENT = '(dot)';

const DOMAINS = [
  '.com',
  '.ai',
  '.app',
  '.io',
  '.net',
  '.org',
  '.biz'
];

const replaceDomainsInName = (name) => DOMAINS.reduce((accumulator, domainString) => {
  const index = name.indexOf(domainString);

  if (index > -1) {
    console.log('domain', domainString, 'found at', index);
    const { length } = domainString;
    const nameAsArray = name.split('');
    const before = nameAsArray.slice(0, index);
    const after = nameAsArray.slice(index + length);

    const replacementCharactersList = domainString.replace('.', DOT_REPLACEMENT).split('');

    // console.log('replacementCharactersList', replacementCharactersList);
    const rebuiltCharacterList = before.concat(replacementCharactersList).concat(after);
    // console.log('rebuiltCharacterList', rebuiltCharacterList);
    return rebuiltCharacterList.join('');
  }
  return accumulator;
}, name);

const formattingReducer = (str, { regex, replacement } = {}) => str.replace(regex, replacement);

export const getFormattedIdFromName = (name = '') => {
  const preparedName = name.trim().toLowerCase();
  const reduced = REGEX_REPLACEMENT_PAIRS.reduce(formattingReducer, preparedName);
  const domainsReplaced = replaceDomainsInName(reduced);

  // if any dots remain after replaceDomainsInName, wipe them
  return domainsReplaced.replace(/\./g, '');
};
