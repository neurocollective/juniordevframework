const {
  buildInsertQueryFromJobListingResultObjects,
  buildInsertQueryFromListings
} = require('.');

const UNDERPAYR = 'underpayr';
const SKREWR = 'skrewr';
const LITTLE_SKREWR = 'Little Skrewr';
const SENIOR_LITTLE_SKREWR = 'Senior Little Skrewr';
const DOUCHETOWN = 'Douchetown';
const DOMAIN = 'http://skrewr.trash';

describe('lib/db', () => {
  describe('buildInsertQueryFromJobListingResultObjects', () => {
    test('buildInsertQueryFromJobListingResultObjects behaves as expected with one object in array', () => {
      const jobListingObjects = [
        {
          company: SKREWR,
          jobTitle: LITTLE_SKREWR,
          location: DOUCHETOWN,
          jobBoard: UNDERPAYR,
          url: DOMAIN
        }
      ];

      const expected = `BEGIN TRANSACTION;INSERT INTO job_listing VALUES(nextval('job_listing_id_seq'),'${SKREWR}','${LITTLE_SKREWR}','${DOUCHETOWN}',now(),'${UNDERPAYR}','${DOMAIN}',now());END TRANSACTION;`;
      const result = buildInsertQueryFromJobListingResultObjects(jobListingObjects);
      expect(result).toEqual(expected);
    });
    test('buildInsertQueryFromJobListingResultObjects behaves as expected with multiple objects in array', () => {
      const jobListingObjects = [
        {
          company: SKREWR,
          jobTitle: LITTLE_SKREWR,
          location: DOUCHETOWN,
          jobBoard: UNDERPAYR,
          url: DOMAIN
        },
        {
          company: SKREWR,
          jobTitle: SENIOR_LITTLE_SKREWR,
          location: DOUCHETOWN,
          jobBoard: UNDERPAYR,
          url: DOMAIN
        },
      ];

      const expected = `BEGIN TRANSACTION;INSERT INTO job_listing VALUES(nextval('job_listing_id_seq'),'${SKREWR}','${LITTLE_SKREWR}','${DOUCHETOWN}',now(),'${UNDERPAYR}','${DOMAIN}',now()),(nextval('job_listing_id_seq'),'${SKREWR}','${SENIOR_LITTLE_SKREWR}','${DOUCHETOWN}',now(),'${UNDERPAYR}','${DOMAIN}',now());END TRANSACTION;`;
      const result = buildInsertQueryFromJobListingResultObjects(jobListingObjects);
      expect(result).toEqual(expected);
    });
  });

  describe('buildInsertQueryFromListings', () => {
    test('behaves as expected', () => {
      const userListingsToAddMap = new Map([
        [1, new Set([3, 4, 5, 6, 7])],
        [2, new Set([3, 4, 5, 6, 7])]
      ]);

      const insertQuery = buildInsertQueryFromListings(userListingsToAddMap);
      const expectedQuery = 'BEGIN TRANSACTION;INSERT INTO user_job_listing VALUES (nextval(\'user_job_listing_id_seq\'),1,\'3\'),(nextval(\'user_job_listing_id_seq\'),1,\'4\'),(nextval(\'user_job_listing_id_seq\'),1,\'5\'),(nextval(\'user_job_listing_id_seq\'),1,\'6\'),(nextval(\'user_job_listing_id_seq\'),1,\'7\'),(nextval(\'user_job_listing_id_seq\'),2,\'3\'),(nextval(\'user_job_listing_id_seq\'),2,\'4\'),(nextval(\'user_job_listing_id_seq\'),2,\'5\'),(nextval(\'user_job_listing_id_seq\'),2,\'6\'),(nextval(\'user_job_listing_id_seq\'),2,\'7\');END TRANSACTION;';

      // console.log('expectedQuery', expectedQuery);
      expect(insertQuery).toEqual(expectedQuery);
    });
  });
});
