import { calculateSUVScalingFactors } from '../src';
import { InstanceMetadata } from '../src/types';

let input: InstanceMetadata[];
let inputPhilips: InstanceMetadata[];
let multiInput: InstanceMetadata[];
let inputlbmbsaFactor: InstanceMetadata[];

describe('calculateSUVScalingFactors', () => {
  beforeEach(() => {
    input = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
        PhilipsPETPrivateGroup: {
          SUVScaleFactor: 0.000551,
          ActivityConcentrationScaleFactor: 1.602563,
        },
      },
    ];
    inputlbmbsaFactor = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 75,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
        PatientSex: 'M',
        PatientSize: 1.85,
      },
    ];
    inputPhilips = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'CNTS',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
        PhilipsPETPrivateGroup: {
          SUVScaleFactor: 0,
          ActivityConcentrationScaleFactor: 1.602563,
        },
      },
    ];
  });

  it('returns suvbw 1.0 if Units are GML', () => {
    input[0].Units = 'GML';

    expect(calculateSUVScalingFactors(input)).toEqual([{ suvbw: 1.0 }]);
  });

  it('calculates suvbw if Units are CNTS (PhilipsPETPrivateGroup SUVScaleFactor available)', () => {
    input[0].Units = 'CNTS';

    expect(calculateSUVScalingFactors(input)).toEqual([{ suvbw: 0.000551 }]);
  });

  it('calculates suvbw if Units are CNTS (PhilipsPETPrivateGroup SUVScaleFactor not available)', () => {
    expect(calculateSUVScalingFactors(inputPhilips)).toEqual([
      { suvbw: 1602.5629999999999 },
    ]);
  });

  it('calculates suvbsa, suvlbm and suvFactor if weight, size and sex known', () => {
    expect(calculateSUVScalingFactors(inputlbmbsaFactor)).toEqual([
      { suvbw: 750, suvbsa: 198.13758427117767, suvlbm: 627.7757487216948, suvlbmJanma : 609.1533588651974 },
    ]);
  });
});

describe('calculateSUVScalingFactor Error Handling', () => {
  beforeEach(() => {
    input = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
      },
    ];
    multiInput = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
      },
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 11,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
      },
    ];
    inputPhilips = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'CNTS',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: '20201023095417',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '095417',
        SeriesDate: '20201023',
        AcquisitionTime: '095417',
        AcquisitionDate: '20201023',
        PhilipsPETPrivateGroup: {
          SUVScaleFactor: 0,
          ActivityConcentrationScaleFactor: 0,
        },
      },
    ];
  });

  it("throws an Error if CorrectedImage value does not contain 'ATTN' and 'DECY'", () => {
    input[0].CorrectedImage = ['Blah'];

    expect(() => {
      calculateSUVScalingFactors(input);
    }).toThrowError(
      `CorrectedImage must contain "ATTN" and "DECY": ${input[0].CorrectedImage}`
    );
  });

  it('throws an Error if Units is not CNTS, BQML, or GML', () => {
    input[0].Units = 'Blah';

    expect(() => {
      calculateSUVScalingFactors(input);
    }).toThrowError(`Units has an invalid value: ${input[0].Units}`);
  });

  it('throws an Error if Decay time is negative', () => {
    input[0].RadiopharmaceuticalStartDateTime = '20201023115417';

    expect(() => {
      calculateSUVScalingFactors(input);
    }).toThrowError('Decay time cannot be less than zero');
  });

  it('throws an Error if series-level metadata are different', () => {
    expect(() => {
      calculateSUVScalingFactors(multiInput);
    }).toThrowError(
      'The set of instances does not appear to come from one Series. Every instance must have identical values for series-level metadata properties'
    );
  });

  it('throws an Error if Philips has no ValidSUVScaleFactor and ValidActivityConcentrationScaleFactor', () => {
    expect(() => {
      calculateSUVScalingFactors(inputPhilips);
    }).toThrowError(
      `Units are in CNTS, but PhilipsPETPrivateGroup has invalid values: ${JSON.stringify(
        inputPhilips[0].PhilipsPETPrivateGroup
      )}`
    );
  });
});
