/**
 * Javascript object with patient properties size, sez, weight
 *
 * @export
 * @interface SUVlbmScalingFactorInput
 */
export interface SUVlbmScalingFactorInput {
    PatientSize: number;
    PatientSex: string;
    PatientWeight: number;
}
export default function calculateSUVlbmScalingFactor(inputs: SUVlbmScalingFactorInput): number;
export { calculateSUVlbmScalingFactor };
