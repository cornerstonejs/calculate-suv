import fs from 'fs';
import niftijs from 'nifti-js';

export default function readNifti(path = './test/data/test.nii') {
  let rawData = fs.readFileSync(path);

  // TODO: May want to use nifti-reader-js instead so we can store gzipped data
  let data = niftijs.parse(rawData);

  return data.data;
}
