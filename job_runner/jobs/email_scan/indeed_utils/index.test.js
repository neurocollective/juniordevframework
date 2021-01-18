import fs from 'fs';
import { scanIndeedEmail } from '.';

const samplePath = `${__dirname}/sample_indeed_email.html`;
const SAMPLE_HTML = fs.readFileSync(samplePath);

describe('email_scan/indeed_utils', () => {
  test('scanIndeedEmail', () => {
    const expected = {

    };
    const result = scanIndeedEmail(SAMPLE_HTML);
    expect(result).toEqual(expected);
  });
});
