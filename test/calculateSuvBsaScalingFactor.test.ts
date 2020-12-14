import {
  calculateSUVbsaScalingFactor,
  SUVbsaScalingFactorInput,
} from '../src/calculateSUVbsaScalingFactor';

let input: SUVbsaScalingFactorInput = {
  PatientWeight: 75, // kg
  PatientSize: 1.85, // m
};

describe('calculateSUVbsaScalingFactor', () => {
  it('calculates ', () => {
    expect(calculateSUVbsaScalingFactor(input)).toEqual(19813.758427117766);
  });
});
