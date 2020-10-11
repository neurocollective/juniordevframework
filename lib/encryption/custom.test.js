const EncryptorDecryptor = require('./custom.js');
const crypto = require('crypto');

describe('EncryptorDecryptor', () => {
	describe('encrypt / decrypt flow', () => {
		test('behaves as expected with an arbitrary key', () => {
			const { encrypt, decrypt } = new EncryptorDecryptor('password1');

			const encrypted = encrypt('test');

			expect(typeof encrypted === 'string').toBeTruthy();

			expect(decrypt(encrypted)).toEqual('test');
		});
		test('behaves as expected with a second arbitrary key', () => {
			const { encrypt, decrypt } = new EncryptorDecryptor('password2');

			const encrypted = encrypt('test');

			expect(typeof encrypted === 'string').toBeTruthy();

			expect(decrypt(encrypted)).toEqual('test');
		});
		test('two different instances can encrypt and decrypt when initialized with same key and iv', () => {
			const bigSecret = 'test-a-giant-string-does-it-still-work?';

			const randomBytes = crypto.randomBytes(16);

			const one = new EncryptorDecryptor('password1', randomBytes);
			const two = new EncryptorDecryptor('password1', randomBytes);

			const encrypted = one.encrypt(bigSecret);
			expect(two.decrypt(encrypted)).toEqual(bigSecret);
		});
		test('i can create a desired iv', () => {
			const randomBuffer = crypto.randomBytes(16);

			const asHex = randomBuffer.toString('hex');

			expect(Buffer.from(asHex, 'hex').equals(randomBuffer)).toBeTruthy();
		});
	});
	// describe('encrypt', () => {
	// 	test('', () => {
			
	// 	});
	// });
	// describe('decrypt', () => {
	// 	test('', () => {
			
	// 	});
	// });
});