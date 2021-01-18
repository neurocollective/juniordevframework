/* eslint-disable */
import Cryptr from 'cryptr';
import { readJSONFromFile } from '..';

const {
  env: {
    ENCRYPTION_KEY,
    LOCAL_MODE
  }
} = process;

const isLocalMode = LOCAL_MODE && LOCAL_MODE.toLowerCase() === 'true';

const buildCryptr = async (key) => {
  if (key) {
    return new Cryptr(key);
  }

  let keyToUse = ENCRYPTION_KEY;
  if (isLocalMode && !keyToUse) {
    try {
      const { encryptionKey } = await readJSONFromFile(`${process.cwd()}/server/encryption.json`);
      keyToUse = encryptionKey;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  return new Cryptr(keyToUse);
};

export default buildCryptr;
