import {
  calculateSUVlbmScalingFactor,
  SUVlbmScalingFactorInput,
} from '../src/calculateSUVlbmScalingFactor';

let input: SUVlbmScalingFactorInput = {
  PatientWeight: 75, // kg
  PatientSize: 1.85, // m
  PatientSex: 'M',
};

describe('calculateSUVlbmScalingFactor', () => {
  it('calculates SUVlbm for M', () => {
    expect(calculateSUVlbmScalingFactor(input)).toEqual(62777.57487216947);
  });

  it('calculates SUVlbm for F', () => {
    input.PatientSex = 'F';
    expect(calculateSUVlbmScalingFactor(input)).toEqual(55925.67567567568);
  });

  it('ThrowError if gender is missing', () => {
    input.PatientSex = 'T';

    expect(() => {
      calculateSUVlbmScalingFactor(input);
    }).toThrowError(`PatientSex is an invalid value: T`);
  });
});
