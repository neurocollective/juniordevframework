const fs = require('fs');

const { cwd } = process;
const { scanIndeedEmail } = require('.');

const samplePath = `${cwd()}/job_runner/jobs/email_scan/indeed_utils/sample_indeed_email.html`;
const SAMPLE_HTML = fs.readFileSync(samplePath);

describe('email_scan/indeed_utils', () => {
  test('scanIndeedEmail', () => {
    const expected = {

    };
    const result = scanIndeedEmail(SAMPLE_HTML);
    expect(result).toEqual(expected);
  });
});
