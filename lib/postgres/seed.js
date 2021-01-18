/* eslint-disable */
import { insertAndSeed } from './connector';

const seed = async () => {
  await insertAndSeed();
  process.exit(0);
};

seed();
