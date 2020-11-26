import { calculateSUVScalingFactor } from '../src';
import { SUVScalingFactorInput } from '../src/calculateSUVScalingFactor';

let input: SUVScalingFactorInput;

describe('calculateSUVScalingFactor', () => {
  beforeEach(() => {
    input = {
      CorrectedImage: ['ATTN', 'DECY'],
      Units: 'BQML',
      RadionuclideHalfLife: 10,
      RadiopharmaceuticalStartDateTime: 'some date?',
      TotalDose: 100,
      DecayCorrection: 'ADMIN',
      PatientWeight: 100,
      seriesDateTimeAndAcquisitionTimePerInstance: [
        {
          SeriesTime: '110010',
          SeriesDate: '110010',
          AcquisitionTime: '110010',
          AcquisitionDate: '110010',
        },
      ],
    };
  });

  it('returns 1.0 if Units are GML', () => {
    input.Units = 'GML';

    expect(calculateSUVScalingFactor(input)).toEqual(1.0);
  });
});

describe('calculateSUVScalingFactor Error Handling', () => {
  beforeEach(() => {
    input = {
      CorrectedImage: ['ATTN', 'DECY'],
      Units: 'BQML',
      RadionuclideHalfLife: 10,
      RadiopharmaceuticalStartDateTime: 'some date?',
      TotalDose: 100,
      DecayCorrection: 'ADMIN',
      PatientWeight: 100,
      seriesDateTimeAndAcquisitionTimePerInstance: [
        {
          SeriesTime: '110010',
          SeriesDate: '110010',
          AcquisitionTime: '110010',
          AcquisitionDate: '110010',
        },
      ],
    };
  });

  it("throws an Error if CorrectedImage value does not contain 'ATTN' and 'DECY'", () => {
    input.CorrectedImage = ['Blah'];

    expect(() => {
      calculateSUVScalingFactor(input);
    }).toThrowError(
      `CorrectedImage must contain "ATTN" and "DECY": ${input.CorrectedImage}`
    );
  });

  it('throws an Error if Units is not CNTS, BQML, or GML', () => {
    input.Units = 'Blah';

    expect(() => {
      calculateSUVScalingFactor(input);
    }).toThrowError(`Units has an invalid value: ${input.Units}`);
  });
});
