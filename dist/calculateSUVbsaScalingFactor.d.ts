/**
 * Javascript object with patient properties size, sez, weight
 *
 * @export
 * @interface SUVbsaScalingFactorInput
 */
export interface SUVbsaScalingFactorInput {
    PatientSize: number;
    PatientWeight: number;
}
export default function calculateSUVbsaScalingFactor(inputs: SUVbsaScalingFactorInput): number;
export { calculateSUVbsaScalingFactor };
