import { calculateSUVScalingFactors } from '../src';
import { InstanceMetadata } from '../src/types';

let input: InstanceMetadata[];

describe('calculateSUVScalingFactors', () => {
  beforeEach(() => {
    input = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: 'some date?',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '110010',
        SeriesDate: '110010',
        AcquisitionTime: '110010',
        AcquisitionDate: '110010',
      },
    ];
  });

  it('returns 1.0 if Units are GML', () => {
    input[0].Units = 'GML';

    expect(calculateSUVScalingFactors(input)).toEqual([{ suvFactor: 1.0 }]);
  });
});

describe('calculateSUVScalingFactor Error Handling', () => {
  beforeEach(() => {
    input = [
      {
        CorrectedImage: ['ATTN', 'DECY'],
        Units: 'BQML',
        RadionuclideHalfLife: 10,
        RadiopharmaceuticalStartDateTime: 'some date?',
        RadionuclideTotalDose: 100,
        DecayCorrection: 'ADMIN',
        PatientWeight: 100,
        SeriesTime: '110010',
        SeriesDate: '110010',
        AcquisitionTime: '110010',
        AcquisitionDate: '110010',
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
});
