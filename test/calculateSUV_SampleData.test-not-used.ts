import readDICOMFolder from './readDICOMFolder';
import readNifti from './readNifti';

import { calculateSUVScalingFactors } from '../src';
import dcmjs from 'dcmjs';

// Temporarily diable dcmjs logging because it logs a lot of
// VR errors
dcmjs.log.disable();

// Note: Converted everything to Implicit Little Endian Transfer Syntax:
// find . -maxdepth 1 -type f -print0 | parallel -0 dcmconv +ti {1} {1}
const sampleDataPaths: string[] = [
  // Working:
  'PHILIPS_BQML', // Units = BQML. Philips Private Group present, but intentionally not used
  'PHILIPS_CNTS_&_BQML_SUV', // Units = CNTS (TBD: Not sure what & BQML refers to? includes private grp?)
  'PHILIPS_CNTS_AND_SUV', // Units = CNTS
  'SIEMENS', // TODO: Write down characteristics of this data
  'GE_MEDICAL_AND_BQML', // TODO: Write down characteristics of this data
  'BQML_AC_DT_<_S_DT + SIEMENS',
  'CPS_AND_BQML_AC_DT_-_S_DT',
  'RADIOPHARM_DATETIME_UNDEFINED',
  // last three do not match Salim's ground truth, because he truncates the time at seconds precision,
  // while we recover the time at microseconds precision. Lowering the precision replicates Salim's ground truth.
  // reference: https://github.com/wendyrvllr/Dicom-To-CNN/blob/wendy/library_dicom/dicom_processor/model/SeriesPT.py
];

// Note: sample data must be organized as
// folderName / dicom / all dicom files
// folderName / groundTruth.nii

function approximatelyEqual(
  arr1: Float64Array,
  arr2: Float64Array,
  epsilon = 1e-3 // Way too large
) {
  if (arr1.length !== arr2.length) {
    throw new Error('Arrays are not the same length?');
  }

  const len = arr1.length;

  for (let i = 0; i < len; i++) {
    const diff = Math.abs(arr1[i] - arr2[i]);
    if (diff > epsilon) {
      return false;
    }
  }

  return true;
}
sampleDataPaths.forEach(folder => {
  const groundTruthPath = `./test/data/${folder}/groundTruth.nii`;
  const dicomFolder = `./test/data/${folder}/dicom`;

  describe(`calculateSUVScalingFactors: ${folder}`, () => {
    it('matches the ground truth SUV values', () => {
      // Arrange
      // 1. Read underlying ground truth and input data
      const groundTruthSUV = readNifti(groundTruthPath);
      const {
        instanceMetadata,
        instanceRescale,
        pixelDataTypedArray,
        frameLength,
        numFrames,
      } = readDICOMFolder(dicomFolder);

      // Act
      // 2. Calculate scaleFactor from the metadata
      // 3. Scale original data and insert into an Arraybuffer
      const scalingFactors = calculateSUVScalingFactors(instanceMetadata);
      const scaledPixelData = new Float64Array(frameLength * numFrames);
      let groundTruthTotal = 0;
      let scaledTotal = 0;
      let diff = 0;

      for (let i = 0; i < numFrames; i++) {
        for (let j = 0; j < frameLength; j++) {
          const voxelIndex = i * frameLength + j;

          // Multiply by the per-frame scaling factor
          const rescaled =
            pixelDataTypedArray[voxelIndex] * instanceRescale[i].RescaleSlope +
            instanceRescale[i].RescaleIntercept;
          scaledPixelData[voxelIndex] = rescaled * scalingFactors[i].suvFactor;

          groundTruthTotal += groundTruthSUV[voxelIndex];
          scaledTotal += scaledPixelData[voxelIndex];
          diff += Math.abs(
            scaledPixelData[voxelIndex] - groundTruthSUV[voxelIndex]
          );
        }
      }

      console.log('avg diff across all voxels');
      console.log(diff / (frameLength * numFrames));

      console.log('total of scaled / total of ground truth voxels');
      console.log(scaledTotal / groundTruthTotal);

      // Assert
      // 4. Check approximate equality between ground truth SUV and our result
      expect(approximatelyEqual(groundTruthSUV, scaledPixelData)).toEqual(true);
    });
  });
});
