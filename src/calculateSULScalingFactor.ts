import {
  calculateSUVScalingFactor,
  SUVScalingFactorInput,
} from './calculateSUVScalingFactor';

import { PatientSexValue } from './types';

interface SULScalingFactorInput extends SUVScalingFactorInput {
  PatientSize: number;
  PatientSex: PatientSexValue;
}

export default function calculateSULScalingFactor(
  inputs: SULScalingFactorInput
): number {
  const { PatientSex, PatientWeight, PatientSize } = inputs;

  let sulFactor;
  const bmi = PatientWeight / PatientSize ** 2;
  if (PatientSex === PatientSexValue.F) {
    sulFactor = 9270 / (8780 + 244 * bmi);
  } else if (PatientSex === PatientSexValue.M) {
    sulFactor = 9270 / (6680 + 216 * bmi);
  } else {
    throw new Error(`PatientSex is an invalid value: ${PatientSex}`);
  }

  const SUVScalingFactor = calculateSUVScalingFactor(inputs);

  return SUVScalingFactor * sulFactor;
}

export { calculateSULScalingFactor };
