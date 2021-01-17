import { getFormattedIdFromName } from '.';

describe('lib/formatting', () => {
	describe('getFormattedIdFromName', () => {
		test('behaves as expected with common inputs', () => {
			let result = getFormattedIdFromName('St. Clair');
			expect(result).toEqual('st_clair');
			
			result = getFormattedIdFromName('ValueExtractor.com');
			expect(result).toEqual('valueextractor(dot)com');

			result = getFormattedIdFromName('Lazard Ltd.');
			expect(result).toEqual('lazard_ltd');
		});
	});
});