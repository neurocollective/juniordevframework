import fs from 'fs';
import { scanIndeedEmail } from '.';

const samplePath = `${__dirname}/sample_indeed_email.html`;
const SAMPLE_HTML = fs.readFileSync(samplePath).toString();

describe('email_scan/indeed_utils', () => {
  test('scanIndeedEmail', () => {
    const expected = {
    	jobTitle: 'software_engineer',
    	entity: 'tf_cornerstone',
    	location: 'new_york_ny',
    	error: null,
    };
    const result = scanIndeedEmail(SAMPLE_HTML);
    expect(result).toEqual(expected);
  });
});
