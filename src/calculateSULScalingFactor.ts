/**
 * Javascript object with patient properties size, sez, weight
 *
 * @export
 * @interface SULScalingFactorInput
 */
export interface SULScalingFactorInput {
  PatientSize: number;
  PatientSex: string; //'M' | 'F';
  PatientWeight: number;
}

export default function calculateSULScalingFactor(
  inputs: SULScalingFactorInput
): number {
  const { PatientSex, PatientWeight, PatientSize } = inputs;

  let sulFactor;
  const bodyMassIndex = PatientWeight / (PatientSize * PatientSize);
  if (PatientSex === 'F') {
    sulFactor = 9270 / (8780 + 244 * bodyMassIndex);
  } else if (PatientSex === 'M') {
    sulFactor = 9270 / (6680 + 216 * bodyMassIndex);
  } else {
    throw new Error(`PatientSex is an invalid value: ${PatientSex}`);
  }

  return sulFactor;
}

export { calculateSULScalingFactor };
