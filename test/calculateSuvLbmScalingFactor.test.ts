import {
  calculateSUVlbmJanmahasatianScalingFactor,
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
    const inputData = {
      ...input,
      PatientSex : 'F'
    }
    expect(calculateSUVlbmScalingFactor(inputData)).toEqual(55925.67567567568);
  });

  it('ThrowError if gender is missing', () => {
    const inputData = {
      ...input,
      PatientSex : 'T'
    }
    expect(() => {
      calculateSUVlbmScalingFactor(inputData);
    }).toThrowError(`PatientSex is an invalid value: T`);
  });
});


describe('calculateSUVlbmScalingFactorJanmahasatian', () => {
  it('calculates SUVlbmJanmahasatian for M', () => {
    expect(calculateSUVlbmJanmahasatianScalingFactor(input)).toEqual(60.91533588651974);
  });

  it('calculates SUVlbmJanmahasatian for F', () => {
    const inputData = {
      ...input,
      PatientSex : 'F'
    }
    expect(calculateSUVlbmJanmahasatianScalingFactor(inputData)).toEqual(49.21437996837613);
  });

  it('ThrowError if gender is missing', () => {
    const inputData = {
      ...input,
      PatientSex : 'T'
    }
    expect(() => {
      calculateSUVlbmJanmahasatianScalingFactor(inputData);
    }).toThrowError(`PatientSex is an invalid value: T`);
  });
});