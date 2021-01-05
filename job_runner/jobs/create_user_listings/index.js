const {
  buildInsertQueryFromListings,
} = require('../../../lib/postgres');

// eslint-disable-next-line max-len
const buildExistingListingsForUserMap = (userListingObjects) => userListingObjects.reduce((map, userListingObject) => {
  // console.log('userListingObject:', userListingObject);
  const {
    userId,
    rows: userListings
  } = userListingObject;
    // console.log('userListings:', userListings);

  const listingIdSet = userListings.reduce((set, userListing) => {
    const { job_listing_id: listingId } = userListing;
    set.add(listingId);
    return set;
  }, new Set());

  map.set(userId, listingIdSet);
  return map;

  //   let listingIdSet;
  //   if (userListingMap.has(userId)) {
  //     listingIdSet = userListingMap.get(userId);
  //   } else {
  //     listingIdSet = new Set();
  //     userListingMap.add(userId, listingIdSet);
  //   }
  //   listingIdSet.add(row['job_listing_id']);
  // return map;
}, new Map());

const findUserListingsToAdd = (allListings, existingListingsForUserMap /* filtersByUser */) => {
  // TODO - filtersByUser should be consulted before listingIds are added to listingsToAddForUser
  // TODO - probably need the whole listing object available to check against the filter?

  const accumulator = { userListingsToAddMap: new Map(), existingListingsForUserMap };

  return allListings.reduce((accum, listing) => {
    // eslint-disable-next-line no-shadow
    const { existingListingsForUserMap, userListingsToAddMap } = accum;
    const { id: listingId } = listing;

    const entries = Array.from(existingListingsForUserMap.entries());

    entries.forEach(([userId, existingListingIdSet]) => {
      let listingsToAddForUser;

      if (!userListingsToAddMap.has(userId)) {
        listingsToAddForUser = new Set();
        userListingsToAddMap.set(userId, listingsToAddForUser);
      } else {
        listingsToAddForUser = userListingsToAddMap.get(userId);
      }

      if (!existingListingIdSet.has(listingId)) {
        listingsToAddForUser.add(listingId);
      }
    });
    return accum;
  }, accumulator);
};

const syncListingsToUsers = async (pgFunctions) => {
  const {
    getAllUserIds,
    getAllJobListings,
    getUserListings,
    insertUserListingsFromGeneratedQuery,
  } = pgFunctions;

  const { rows: userIds } = await getAllUserIds();
  const { rows: allListings } = await getAllJobListings();

  if (!allListings.length) {
    console.error('no job listings in database!');
    process.exit(1);
  }

  const indexToUserIdMap = new Map();
  const promises = userIds.map(({ id }, index) => {
    indexToUserIdMap.set(index, id);
    return getUserListings(id);
  });
  const allResults = await Promise.all(promises);

  const userListingsByUser = allResults.map(({ rows }, index) => {
    return { rows, userId: indexToUserIdMap.get(index) };
  });

  // get filters for user Ids here, use 'buildGetAllUserJobFiltersByIdQuery'

  const existingListingsForUserMap = buildExistingListingsForUserMap(userListingsByUser);

  // eslint-disable-next-line max-len
  const { userListingsToAddMap } = findUserListingsToAdd(allListings, existingListingsForUserMap/* , filtersByUser */);

  const query = buildInsertQueryFromListings(userListingsToAddMap);

  if (!query) {
    console.log('nothing to insert!');
    process.exit(0);
  }

  const result = await insertUserListingsFromGeneratedQuery(query);
  console.log('result of insert', result);

  process.exit(0);
};

// do we need this, or do we just rename syncListingsToUsers to createUserListings?
const createUserListings = (pgFunctions) => {
  return syncListingsToUsers(pgFunctions);
};

module.exports = {
  syncListingsToUsers,
  findUserListingsToAdd,
  buildExistingListingsForUserMap,
  createUserListings
};
