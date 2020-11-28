import readDICOMFolder from './readDICOMFolder';
import readNifti from './readNifti';

import { calculateSUVScalingFactors } from '../src';
import log from 'loglevelnext';

// TODO: stop dcmjs from using console.error so much
log.disable();

const sampleDataPaths: string[] = [
  // Working:
  'PHILIPS_BQML', // Units = BQML. Philips Private Group present, but intentionally not used
  'PHILIPS_CNTS_&_BQML_SUV', // Units = CNTS (TBD: Not sure what & BQML refers to? includes private grp?)
  'PHILIPS_CNTS_AND_SUV', // Units = CNTS
  'SIEMENS', // TODO: Write down characteristics of this data

  // ----- Not currently working ------
  //'RADIOPHARM_DATETIME_UNDEFINED',
  // pixelDataTypedArray.findIndex(a => a>0)
  // groundTruthSUV.findIndex(a => a>0)
  // give different indices? Indicates maybe a sorting problem for the DICOMs?

  //'CPS_AND_BQML_AC_DT_-_S_DT',
  // Rescale and SUV Scaling factor appear correct, but values appear incorrectly ordered
  // Possible same DICOM => Array ingestion issue as RADIOPHARM_DATETIME_UNDEFINED
  // Some values are very very close but not exact

  // 'GE_MEDICAL_AND_BQML', // currently totally wrong, total of scaled values is 1.25 times the ground truth
  // Stored pixel data is Big Endian, we should convert it to little or add proper decoding

  // 'BQML_AC_DT_<_S_DT + SIEMENS',
  // - If we use the QIBA logic with frame durations etc, it does not match Salim's ground truth
  // - If we use Salim's logic, taking earliest acquisition date time, the results are
  //   very very close, but for some reason it's not exactly right.
  //   Need to investigate further: https://github.com/wendyrvllr/Dicom-To-CNN/blob/wendy/library_dicom/dicom_processor/model/SeriesPT.py#L91
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
