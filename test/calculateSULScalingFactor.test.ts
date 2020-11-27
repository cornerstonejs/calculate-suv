import {
  calculateSULScalingFactor,
  SULScalingFactorInput,
} from '../src/calculateSULScalingFactor';

let input: SULScalingFactorInput = {
  PatientWeight: 100,
  PatientSize: 100,
  PatientSex: 'M',
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
