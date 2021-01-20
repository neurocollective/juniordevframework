/* eslint no-multi-spaces: 0 */
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

  let jobTitle, entityName, location;

  if (jobTitleNode && jobTitleNode.innerHTML) {
    ({ innerHTML: jobTitle } = jobTitleNode);
  }

  if (entityNameNode && entityNameNode.innerHTML) {
    ({ innerHTML: entityName } = entityNameNode);
  }

  if (locationNode && locationNode.innerHTML) {
    ({ innerHTML: location } = locationNode);
  }

  return {
    jobTitle: getFormattedIdFromName(jobTitle),
    entity: getFormattedIdFromName(entityName),
    location: getFormattedIdFromName(location),
    error: null
  };
};

// module.exports = {
//   scanIndeedEmail
// };
