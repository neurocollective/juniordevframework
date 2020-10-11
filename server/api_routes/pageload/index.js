const { Router } = require('express');

// const pageLoadRouter = Router();

// pageLoadRouter.get('/', (req, res) => {
//   const response = {};  

//   return res.json(response);
// });

const getPageLoadRouter = (postgresFunctions, redisFunctions, credentialsObject) => {
  const pageLoadRouter = Router();

  pageLoadRouter.get('/', async (req, res) => {

  	const dbRes = await postgresFunctions.getListingsForUser(1);
  	console.log('dbRes.rows:', dbRes.rows);
    const response = { message: 'pageload!', data: dbRes.rows };

    return res.json(response);
  });

  return pageLoadRouter;
};

// module.exports = pageLoadRouter;
module.exports = getPageLoadRouter;
