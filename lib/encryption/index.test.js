const buildCryptr = require('.');
const crypto = require('crypto');

describe('buildCryptr', () => {
	describe('encrypt / decrypt flow', () => {
		test('behaves as expected with an arbitrary key', async () => {
			const { encrypt, decrypt } = await buildCryptr('password1');

			const encrypted = encrypt('test');

			expect(typeof encrypted === 'string').toBeTruthy();

			expect(decrypt(encrypted)).toEqual('test');
		});
		test('behaves as expected with a second arbitrary key', async () => {
			const { encrypt, decrypt } = await buildCryptr('password2');

			const encrypted = encrypt('test');

			expect(typeof encrypted === 'string').toBeTruthy();

			expect(decrypt(encrypted)).toEqual('test');
		});
	});
});