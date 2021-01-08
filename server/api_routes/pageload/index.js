import { Router } from 'express';

// const pageLoadRouter = Router();

// pageLoadRouter.get('/', (req, res) => {
//   const response = {};

//   return res.json(response);
// });

const getPageLoadRouter = () => {
  const pageLoadRouter = Router();

  pageLoadRouter.get('/', async (req, res) => {
    console.log('PAGE LOAD');

    // this is a schema v1 operation
    // const dbRes = await postgresFunctions.getListingsForUser(1);
    // console.log('dbRes.rows:', dbRes.rows);

    const dbRes = { rows: {} };

    const response = { message: 'pageload!', data: dbRes.rows };

    return res.json(response);
  });

  return pageLoadRouter;
};

export default getPageLoadRouter;
