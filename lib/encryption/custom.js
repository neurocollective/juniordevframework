/* eslint-disable max-len */
/* eslint-disable max-classes-per-file */
const crypto = require('crypto'); // built in to node

const DEFAULT_PWORD = 'pw';
const DEFAULT_ALGO = 'aes-192-cbc';
const DEFAULT_IV = '529de17993006be060f5a35056365b0e';

// `crypto.randomBytes(16).toString('hex')` sample output => '4afc3e2e166152b45b706a474a06ed83'

// WARNING - the default initializationVector argument to constructor makes this class easier to use, but decryption less secure
// use `EncryptorDecryptor.getRandomInitializationVector()` and store the returned string value along with encryptionKeyPassword as guarded application secrets
class EasyEncryptorDecryptor {
  // sample output => '4afc3e2e166152b45b706a474a06ed83'
  static getRandomInitializationVector() {
    return crypto.randomBytes(16).toString('hex');
  }

  // encryptionKeyPassword: String, required
  // initializationVector: String | Buffer. note: string must be 'hex' encoded. use `crypto.randomBytes(16).toString('hex')` to generate such a string.
  // algorithm: String
  constructor(encryptionKeyPassword = DEFAULT_PWORD, initializationVector = DEFAULT_IV, algorithmString) {
    // if (!encryptionKeyPassword) {
    //   throw new Error('encryptionKeyPassword is required!');
    // }

    // if (!algorithmString) {
    //   throw new Error('valid algorithm string is required!');
    // }

    const HEX = 'hex';

    this.key = crypto.scryptSync(encryptionKeyPassword, 'salt', 24);
    this.iv = (initializationVector instanceof Buffer) ? initializationVector : Buffer.from(initializationVector, HEX);
    this.hex = HEX;
    this.encoding = 'utf8';
    this.algorithm = algorithmString;

    this.encrypt = this.encrypt.bind(this);
    this.decrypt = this.decrypt.bind(this);
  }

  // text: String
  encrypt(text) {
    const {
      key, iv, hex, encoding, algorithm
    } = this;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = cipher.update(text, encoding, hex) + cipher.final(hex); // encrypted text

    return encrypted;
  }

  // encrypted; String
  decrypt(encrypted) {
    const {
      key, iv, hex, encoding, algorithm
    } = this;

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = decipher.update(encrypted, hex, encoding) + decipher.final(encoding); // deciphered text

    return decrypted;
  }
}

class EncryptorDecryptor extends EasyEncryptorDecryptor {
  constructor(encryptionKeyPassword, initializationVector, algorithmString = DEFAULT_ALGO) {
    if (!encryptionKeyPassword) {
      throw new Error('encryptionKeyPassword is required!');
    }

    if (!algorithmString) {
      throw new Error('valid algorithm string is required!');
    }

    if (encryptionKeyPassword === DEFAULT_PWORD) {
      throw new Error('Do NOT use the insecure default password!');
    }

    if (initializationVector === DEFAULT_IV) {
      throw new Error('Do NOT use the insecure default iv!');
    }

    super(encryptionKeyPassword, initializationVector, algorithmString);
  }
}

module.exports = EncryptorDecryptor;
