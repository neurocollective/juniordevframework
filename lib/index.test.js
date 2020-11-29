const {
  wipeHTMLTagsFromString,
  getNextPageUrlFromCurrentUrl,
  buildScrubberUtility,
  // isTokenExpired,
  refreshToken
} = require('.');

describe('lib', () => {
  describe('wipeHTMLTagsFromString', () => {
    test('behaves as expected when passed a simple html tag string', () => {
      const result = wipeHTMLTagsFromString('<b>hi</b>');
      expect(result).toEqual('hi');
    });
    test('behaves as expected when passed a multi tag html string', () => {
      const result = wipeHTMLTagsFromString('<div><h1><b>hi</b></h1></div>');
      expect(result).toEqual('hi');
    });
    test('behaves as expected when passed a multi tag html string with outlying text', () => {
      const result = wipeHTMLTagsFromString('yo <div><h1><b>hi</b></h1></div> bro');
      expect(result).toEqual('yo hi bro');
    });
    test('behaves as expected when passed a multi tag html string with outlying text', () => {
      const result = wipeHTMLTagsFromString('New York, NY 10002 <span style="font-size: smaller">(Lower East Side area)</span>');
      expect(result).toEqual('New York, NY 10002 (Lower East Side area)');
    });
    test('behaves as expected when passed a multi tag html string with outlying text', () => {
      const result = wipeHTMLTagsFromString('New York, NY');
      expect(result).toEqual('New York, NY');
    });
  });
  describe('getNextPageUrlFromCurrentUrl', () => {
    test('behaves as expected with a paged url', () => {
      const result = getNextPageUrlFromCurrentUrl('https://www.indeed.com/jobs?q=software+engineer&l=New+York%2C+NY&start=10');
      expect(result).toEqual('https://www.indeed.com/jobs?q=software+engineer&l=New+York%2C+NY&start=20');
    });
    test('behaves as expected with an un-paged url', () => {
      const result = getNextPageUrlFromCurrentUrl('https://www.indeed.com/jobs?q=software+engineer&l=New+York%2C+NY');
      expect(result).toEqual('https://www.indeed.com/jobs?q=software+engineer&l=New+York%2C+NY&start=10');
    });
  });
  describe('buildScrubberUtility', () => {
      const gigaFirm = 'giga_firm'
      const mockedDbRowsOne = [
        {
            company_name: gigaFirm,
            job_title: 'open source infiltrator',
            discover_date: '2020-08-02T06:04:39.490Z',
            last_posting_date: null,
            inactive_date: null         
        }
      ];    
    test('returns listing map as expected when built with representative data', () => {
      const scrubber = buildScrubberUtility(mockedDbRowsOne);
      const expected = { [gigaFirm]: new Set(['open source infiltrator']) };
      expect(scrubber.getExistingListingsMap()).toEqual(expected);
    });
    test('returns new listing objects as expected when duplicate data is appended via method', () => {
      const scrubber = buildScrubberUtility(mockedDbRowsOne);

      const results = [
        {
          company: mockedDbRowsOne[0]['company_name'],
          jobTitle: mockedDbRowsOne[0]['job_title'],
          location: mockedDbRowsOne[0]['location']
        }
      ];
      const title = 'software_engineer';
      scrubber.scrubResultsForJobTitle(title, results);
      expect(scrubber.getNewJobListingObjectArray()).toEqual([]);
    });
    test('returns new listing objects as expected when new data is appended via method', () => {
      const scrubber = buildScrubberUtility(mockedDbRowsOne);

      const company = 'NeverGonnaHireU';
      const results = [
        {
          company,
          jobTitle: 'Empty Shell',
          location: 'Libertarian Paradise Island'
        }
      ];
      const title = 'software_engineer';
      scrubber.scrubResultsForJobTitle(title, results);
      expect(scrubber.getNewJobListingObjectArray()).toEqual(results);
    });
  });
  // describe('isTokenExpired', () => {
  //   test('works as expected', () => {

  //     const received_time_log = new Date();
  //     received_time_log.setTime(1601896580106); // Mon Oct 05 2020 07:16:20 GMT-0400

  //     const mockToken = {
  //       expires_in: 3599, // 1 hour
  //       received_time_log
  //     };

  //     const aUnixTime = 1601900630314; // 2020-10-05T12:23:50.314Z

  //     const isExpired = isTokenExpired(mockToken, aUnixTime);
  //     expect(isExpired).toBeTruthy();
  //   });
  // });
  describe('refreshToken', () => {
    test('refreshToken works as expected', async () => {
      const result = await refreshToken();
      expect(result).ToBeFalsy();
    });
  });
});
