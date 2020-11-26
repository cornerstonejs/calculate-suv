import { calculateSUVScalingFactor } from '../src';
import { SUVScalingFactorInput } from '../src/calculateSUVScalingFactor';
import { DecayCorrectionValue, UnitsValue } from '../src/types';

describe('calculateSUVScalingFactor', () => {
  it("throws an Error if CorrectedImage value does not contain 'ATTN' and 'DECY'", () => {
    const input: SUVScalingFactorInput = {
      CorrectedImage: ['Blah'],
      Units: UnitsValue.BQML,
      RadionuclideHalfLife: 10,
      RadiopharmaceuticalStartDateTime: 'some date?',
      TotalDose: 100,
      DecayCorrection: DecayCorrectionValue.ADMIN,
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

    expect(() => {
      calculateSUVScalingFactor(input);
    }).toThrowError(
      `CorrectedImage must contain "ATTN" and "DECY": ${input.CorrectedImage}`
    );
  });
});
