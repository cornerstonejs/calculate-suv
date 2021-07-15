// import readDICOMFolder from './readDICOMFolder';
import fs from 'fs';
import { calculateSUVScalingFactors } from '../src';
import dcmjs from 'dcmjs';

// Temporarily diable dcmjs logging because it logs a lot of
// VR errors
dcmjs.log.disable();

// Note: Converted everything to Implicit Little Endian Transfer Syntax:
// find . -maxdepth 1 -type f -print0 | parallel -0 dcmconv +ti {1} {1}
const sampleDataPaths: string[] = [
  // Standard, "Units": "BQML", contains RadiopharmaceuticalStartDateTime
  'SIEMENS',
  'GE_MEDICAL_AND_BQML',

  // Units: BQML, contains Philips private tag group (which should not be used)
  'PHILIPS_BQML',

  // Units: CNTS, Philips private tag group with both SUVScaleFactor and ActivityConcentrationScaleFactor
  'PHILIPS_CNTS_AND_BQML_SUV',

  // Units: CNTS, Philips private tag group with valid SUVScaleFactor
  'PHILIPS_CNTS_AND_SUV',

  // Acqusition Date Time is earlier than Series Date Time
<<<<<<< HEAD
  'BQML_AC_DT_lessThan_S_DT_SIEMENS',
=======
  'BQML_AC_DT_BEFORE_S_DT_SIEMENS',
>>>>>>> rename bad file to something more clear

  // Missing RadiopharmaceuticalStartDateTime, only uses RadiopharmaceuticalStartTime
  'CPS_AND_BQML_AC_DT_-_S_DT',

  // Missing RadiopharmaceuticalStartDateTime, only uses RadiopharmaceuticalStartTime
  'RADIOPHARM_DATETIME_UNDEFINED',

  // Need to find: Real-world dataset that requires Syngo3.x multi-inject pathway
  //               Real-world dataset with GEPrivatePostInjectionDateTime
];

// Note: sample data must be organized as
// folderName / dicom / all dicom files

sampleDataPaths.forEach(folder => {
  //const dicomFolder = `./test/data/${folder}/dicom`;
  const precomputedSUVFactors = new Map();
  precomputedSUVFactors.set('PHILIPS_BQML', 0.0007463747013889488);
  precomputedSUVFactors.set('PHILIPS_CNTS_AND_BQML_SUV', 0.000551);
  precomputedSUVFactors.set('PHILIPS_CNTS_AND_SUV', 0.000728);
  precomputedSUVFactors.set('SIEMENS', 0.00042748316187197236);
  precomputedSUVFactors.set('GE_MEDICAL_AND_BQML', 0.0005367387681819742);
  precomputedSUVFactors.set(
<<<<<<< HEAD
    'BQML_AC_DT_lessThan_S_DT_SIEMENS',
=======
    'BQML_AC_DT_BEFORE_S_DT_SIEMENS',
>>>>>>> rename bad file to something more clear
    0.0004069156854009332
  );
  precomputedSUVFactors.set(
    'CPS_AND_BQML_AC_DT_-_S_DT',
    0.00026503312764157046
  );
  precomputedSUVFactors.set(
    'RADIOPHARM_DATETIME_UNDEFINED',
    0.0003721089202818729
  );
  /// at the moment for a dataset, each frame has always the same SUV factor.
  /// 'BQML_AC_DT_BEFORE_S_DT_SIEMENS' will have eventually a SUV factor value for each frame,
  /// in that case this test will need to be update by comparing the SUV factors of the frames with precomputed ones.

  describe(`calculateSUVScalingFactors from dicom: ${folder}`, () => {
    it('matches the known, precomputed, SUV values', () => {
      // Arrange
      // 1. Read underlying input dicom data
      //let { instanceMetadata } = readDICOMFolder(dicomFolder);
      /*instanceMetadata = instanceMetadata.slice(0,3);

      console.log(`./metadata/${folder}.json`)
      fs.writeFileSync(`./metadata/${folder}-instances.json`, JSON.stringify(instanceMetadata, null, 2));*/

      // TODO: Make this async?
      const filename = `${folder}-instances`;
      const instanceMetadata = JSON.parse(
        fs.readFileSync(`./test/metadata/${filename}.json`, 'utf8')
      );

      // Act
      // 2. Calculate scaleFactor from the metadata
      const scalingFactors = calculateSUVScalingFactors(instanceMetadata);

      // Assert
      // 3. Check approximate equality between ground truth SUV and our result
      expect(
        Math.abs(
          scalingFactors[0].suvbw - precomputedSUVFactors.get(`${folder}`)
        ) < 1e-6
      ).toEqual(true);
    });
  });
});
