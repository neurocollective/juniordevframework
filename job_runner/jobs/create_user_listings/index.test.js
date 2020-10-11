const {
  buildUserListingMap,
  syncListingsToUsers,
  findUserListingsToAdd
} = require('.');
const {
  RAW_LISTINGS
} = require('../../mocks');

describe('job_runner/jobs', () => {
  describe('findUserListingsToAdd', () => {
    test('behaves as expected', () => {
      const existingListingsForUserMap = new Map([
        [1, new Set([1, 2])],
        [2, new Set([1, 2])]
      ]);

      const { userListingsToAddMap } = findUserListingsToAdd(RAW_LISTINGS, existingListingsForUserMap);

      const expected = new Map([
        [1, new Set([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34])], 
        [2, new Set([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34])]
      ]);
      expect(userListingsToAddMap).toEqual(expected);
    });
  });

});