/**
 * Javascript object with patient properties size, sez, weight
 *
 * @export
 * @interface SUVlbmScalingFactorInput
 */
export interface SUVlbmScalingFactorInput {
  PatientSize: number; // m
  PatientSex: string; //'M' | 'F' | 'O';
  PatientWeight: number; // Kg
}

export default function calculateSUVlbmScalingFactor(
  inputs: SUVlbmScalingFactorInput
): number {
  const { PatientSex, PatientWeight, PatientSize } = inputs;

  let LBM;
  const bodyMassIndex =
    (PatientWeight * PatientWeight) / (PatientSize * PatientSize * 10000); // convert size in cm
  // reference: https://www.medicalconnections.co.uk/kb/calculating-suv-from-pet-images/
  if (PatientSex === 'F') {
    LBM = 1.07 * PatientWeight - 148 * bodyMassIndex;
  } else if (PatientSex === 'M') {
    LBM = 1.1 * PatientWeight - 120 * bodyMassIndex;
  } else {
    throw new Error(`PatientSex is an invalid value: ${PatientSex}`);
  }

  return LBM * 1000; // convert in gr
}

export { calculateSUVlbmScalingFactor };
