import { calculateSULScalingFactor } from '../src';
import { SULScalingFactorInput } from '../src/calculateSULScalingFactor';

let input: SULScalingFactorInput = {
  CorrectedImage: ['ATTN', 'DECY'],
  Units: 'GML',
  RadionuclideHalfLife: 10,
  RadiopharmaceuticalStartDateTime: 'some date?',
  TotalDose: 100,
  DecayCorrection: 'ADMIN',
  PatientWeight: 100,
  PatientSize: 100,
  PatientSex: 'M',
  seriesDateTimeAndAcquisitionTimePerInstance: [
    {
      SeriesTime: '110010',
      SeriesDate: '110010',
      AcquisitionTime: '110010',
      AcquisitionDate: '110010',
    },
  ],
};

describe('calculateSULScalingFactor', () => {
  it('calculates SUL properly for M', () => {
    expect(calculateSULScalingFactor(input)).toEqual(1.3872759706442228);
  });

  it('calculates SUL properly for F', () => {
    input.PatientSex = 'F';

    expect(calculateSULScalingFactor(input)).toEqual(1.055515323759684);
  });
});

describe('calculateSULScalingFactor Error Handling', () => {
  it("throws an Error if CorrectedImage value does not contain 'ATTN' and 'DECY'", () => {
    const input: SULScalingFactorInput = {
      CorrectedImage: ['Blah'],
      Units: 'BQML',
      RadionuclideHalfLife: 10,
      RadiopharmaceuticalStartDateTime: 'some date?',
      TotalDose: 100,
      DecayCorrection: 'ADMIN',
      PatientWeight: 100,
      PatientSize: 100,
      PatientSex: 'M',
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
      calculateSULScalingFactor(input);
    }).toThrowError(
      `CorrectedImage must contain "ATTN" and "DECY": ${input.CorrectedImage}`
    );
  });
});
