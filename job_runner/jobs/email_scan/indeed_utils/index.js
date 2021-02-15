/* eslint no-multi-spaces: 0 import/prefer-default-export: 0 */
import { JSDOM } from 'jsdom';
import { getFormattedIdFromName } from '../../../../lib';

const DOC_TYPE_HTML = '<!DOCTYPE html';

const JOB_TITLE_SELECTOR =    `.corner > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) >
  table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) >
  tbody:nth-child(1) > tr:nth-child(6) > td:nth-child(1) > a:nth-child(1)`;

const ENTITIY_NAME_SELECTOR = `.corner > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) >
  table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) >
  tbody:nth-child(1) > tr:nth-child(7) > td:nth-child(1) > p:nth-child(1) > span:nth-child(1) > a:nth-child(1)`;

const LOCATION_SELECTOR =     `.corner > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) >
  table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) >
  tbody:nth-child(1) > tr:nth-child(7) > td:nth-child(1) > p:nth-child(1) > span:nth-child(2)`;

const USE_THIS_CODE = 'Use this code to continue applying for Software Engineer';

export const INDEED_ERROR_STAMP = 'ERROR_PARSING_INDEED_EMAIL';
export const INVALID_EMAIL = 'INVALID EMAIL - CONTINUE APPLYING EMAIL';

const HERES_WHAT_WE_KNOW = 'Here’s what we know about the';

export const scanIndeedEmail = (rawEmailString = '', index) => {
  if (rawEmailString.includes(USE_THIS_CODE)) {
    const errors = [];
    errors.push(INVALID_EMAIL);
    return { errors };
  }

  const indexOfDocType = rawEmailString.indexOf(DOC_TYPE_HTML);
  const indexOfHTML = rawEmailString.indexOf('<html');

  let htmlStartIndex = indexOfDocType;
  if (indexOfDocType < 0) {
    htmlStartIndex = indexOfHTML;
  }
  if (htmlStartIndex < 0) {
    const msg = 'WARNING: indeed email has no html and is not recognized';
    console.log('email body with no html:', rawEmailString);
    return { error: msg };
  }

  if (rawEmailString.includes(HERES_WHAT_WE_KNOW)) {
    return { error: 'ignoring a HERES_WHAT_WE_KNOW email' };
  }

  const htmlOnly = rawEmailString.slice(htmlStartIndex); // was `.slice(indexOfDocType)`

  const { window: { document } } = new JSDOM(htmlOnly);

  const jobTitleNode = document.querySelector(JOB_TITLE_SELECTOR);
  const entityNameNode = document.querySelector(ENTITIY_NAME_SELECTOR);
  const locationNode = document.querySelector(LOCATION_SELECTOR);

  let jobTitle;
  let entityName;
  let location;

  const errors = [];
  if (jobTitleNode) {
    ({ innerHTML: jobTitle } = jobTitleNode);
  } else {
    const error = `${INDEED_ERROR_STAMP} jobTitleNode is falsy! Check JOB_TITLE_SELECTOR?`;
    errors.push(error);
  }

  if (entityNameNode) {
    ({ innerHTML: entityName } = entityNameNode);
  } else {
    const error = `${INDEED_ERROR_STAMP} entityNameNode is falsy! Check ENTITIY_NAME_SELECTOR?`;
    errors.push(error);
  }

  if (locationNode) {
    ({ innerHTML: location } = locationNode);
  } else {
    const error = `${INDEED_ERROR_STAMP} locationNode is falsy! Check LOCATION_SELECTOR?`;
    errors.push(error);
  }
  const thereAreErrors = Boolean(errors.length);

  if (thereAreErrors) {
    console.error('errors at index', index, '->');
    console.error(errors);

    console.log('RAW STRING:');
    console.log(rawEmailString);
  }

  return {
    jobTitle: getFormattedIdFromName(jobTitle),
    entity: getFormattedIdFromName(entityName),
    location: getFormattedIdFromName(location),
    errors: thereAreErrors ? errors : null,
  };
};
