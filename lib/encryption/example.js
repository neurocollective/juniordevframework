// https://stackoverflow.com/questions/6953286/node-js-encrypting-data-that-needs-to-be-decrypted

import crypto from 'crypto';

const algorithm = 'aes-192-cbc'; // algorithm to use
const password = 'Hello darkness';
const key = crypto.scryptSync(password, 'salt', 24); // create key
const text = 'this is the text to be encrypted'; // text to be encrypted

const iv = crypto.randomBytes(16); // generate different ciphertext everytime
const cipher = crypto.createCipheriv(algorithm, key, iv);
const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex'); // encrypted text

const decipher = crypto.createDecipheriv(algorithm, key, iv);
const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8'); // deciphered text
console.log(decrypted);
