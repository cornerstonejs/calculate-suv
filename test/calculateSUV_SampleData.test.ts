import readDICOMFolder from './readDICOMFolder';
import readNifti from './readNifti';

import { calculateSUVScalingFactors } from '../src';

const sampleDataPaths = [
  /*'BQML_AC_DT_<_S_DT + SIEMENS', // todo: need to create the right typedarray (not just int16)
  'CPS_AND_BQML_AC_DT_-_S_DT',
  'GE_MEDICAL_AND_BQML', // currently totally wrong, total of scaled values is 1.25 times the ground truth
  'PHILIPS_BQML',
  'PHILIPS_CNTS_&_BQML_SUV',
  'PHILIPS_CNTS_AND_SUV',
  'RADIOPHARM_DATETIME_UNDEFINED',
  'SIEMENS', // need to change typedarray*/
];

// Note: sample data must be organized as
// folderName / dicom / all dicom files
// folderName / groundTruth.nii

// TODO: stop dcmjs from using console.error so much
jest.spyOn(global.console, 'error').mockImplementation(() => {});

function approximatelyEqual(
  arr1: Float64Array,
  arr2: Float64Array,
  epsilon = 1e-8
) {
  if (arr1.length !== arr2.length) {
    throw new Error('Arrays are not the same length?');
    //return false;
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

      console.log(instanceMetadata);
      console.log(instanceRescale);
      console.log(frameLength);
      console.log(numFrames);

      // Act
      // 2. Calculate scaleFactor from the metadata
      // 3. Scale original data and insert into an Arraybuffer
      const scalingFactors = calculateSUVScalingFactors(instanceMetadata);
      console.log(scalingFactors);
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
