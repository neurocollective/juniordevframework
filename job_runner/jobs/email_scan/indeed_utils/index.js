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

export const INDEED_ERROR_STAMP = 'ERROR_PARSING_INDEED_EMAIL';

export const scanIndeedEmail = (rawEmailString = '') => {
  const indexOfDocType = rawEmailString.indexOf(DOC_TYPE_HTML);

  if (indexOfDocType < 0) {
    const msg = `WARNING: indeed email did not start with ${DOC_TYPE_HTML} or has no html`;
    console.log(msg);
    return { error: msg };
  }

  const htmlOnly = rawEmailString.slice(indexOfDocType);

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
    console.error(error);
    errors.push(error);
  }

  if (entityNameNode) {
    ({ innerHTML: entityName } = entityNameNode);
  } else {
    const error = `${INDEED_ERROR_STAMP} 'entityNameNode is falsy! Check ENTITIY_NAME_SELECTOR?'`;
    console.error(error);
    errors.push(error);
  }

  if (locationNode) {
    ({ innerHTML: location } = locationNode);
  } else {
    const error = `${INDEED_ERROR_STAMP} locationNode is falsy! Check LOCATION_SELECTOR?`;
    console.error(error);
    errors.push(error);
  }

  return {
    jobTitle: getFormattedIdFromName(jobTitle),
    entity: getFormattedIdFromName(entityName),
    location: getFormattedIdFromName(location),
    errors: errors.length ? errors : null,
  };
};

// module.exports = {
//   scanIndeedEmail
// };
