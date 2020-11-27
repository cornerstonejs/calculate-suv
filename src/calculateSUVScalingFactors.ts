import { calculateScanTimes } from './calculateScanTimes';
import calculateSULScalingFactor from './calculateSULScalingFactor';
import { calculateStartTime } from './calculateStartTime';
import { SULScalingFactorInput } from './calculateSULScalingFactor';
import { InstanceMetadata } from './types';

// TODO, the result property names may changes
interface ScalingFactorResult {
  suvFactor: number;
  sulFactor?: number;
}

function _calculateBQMLScaleFactor(instances: InstanceMetadata[]): number[] {
  const {
    TotalDose,
    RadionuclideHalfLife,
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    PatientWeight,
    SeriesDate,
  } = instances[0];

  const scanTimes: Date[] = calculateScanTimes(instances);
  const startTime: Date = calculateStartTime({
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    SeriesDate,
  });

  return instances.map((_, index) => {
    const scanTime = scanTimes[index];
    const decayTimeInSec: number =
      (scanTime.getTime() - startTime.getTime()) / 1000;
    const decayedDose: number =
      TotalDose * Math.pow(2, -decayTimeInSec / RadionuclideHalfLife);
    const weightInGrams: number = PatientWeight * 1000;

    return weightInGrams / decayedDose;
  });
}

/**
 *
 * Note: Rescale Slope / Intercept must still be applied. These must be applied
 *       on a per-Frame basis, since some scanners may have different values per Frame.
 * @param instances
 */
export default function calculateSUVScalingFactors(
  instances: InstanceMetadata[]
): ScalingFactorResult[] {
  const {
    CorrectedImage,
    Units,
    PhilipsPETPrivateGroup,
    PatientWeight,
    PatientSex,
    PatientSize,
  } = instances[0];

  if (!CorrectedImage.includes('ATTN') || !CorrectedImage.includes('DECY')) {
    throw new Error(
      `CorrectedImage must contain "ATTN" and "DECY": ${CorrectedImage}`
    );
  }

  // Sanity check that every instance provided has identical
  // values for series-level metadata. If not, the provided
  // data is invalid.
  const isSingleSeries = instances.every(instance => {
    return (
      instance.Units === Units &&
      instance.CorrectedImage === CorrectedImage &&
      instance.PatientWeight === PatientWeight &&
      instance.PatientSex === PatientSex &&
      instance.PatientSize === PatientSize &&
      instance.RadionuclideHalfLife === instances[0].RadionuclideHalfLife &&
      instance.TotalDose === instances[0].TotalDose &&
      instance.DecayCorrection === instances[0].DecayCorrection &&
      instance.SeriesDate === instances[0].SeriesDate &&
      instance.SeriesTime === instances[0].SeriesTime
    );
  });

  if (!isSingleSeries) {
    throw new Error(
      'The set of instances does not appear to come from one Series. Every instance must have identical values for series-level metadata properties'
    );
  }

  let results: number[] = new Array(instances.length);

  if (Units === 'BQML') {
    // Need to get the reference time from the metadata for all instances in the series
    results = _calculateBQMLScaleFactor(instances);
  } else if (Units === 'CNTS') {
    const hasValidSUVScaleFactor: boolean = instances.every(instance => {
      return (
        instance.PhilipsPETPrivateGroup &&
        instance.PhilipsPETPrivateGroup?.SUVScaleFactor !== undefined &&
        instance.PhilipsPETPrivateGroup?.SUVScaleFactor !== 0
      );
    });

    if (hasValidSUVScaleFactor) {
      results = instances.map(
        // Added ! to tell Typescript that this can't be undefined, since we are testing it
        // in the .every loop above.
        instance => instance.PhilipsPETPrivateGroup!.SUVScaleFactor!
      );
    }

    const hasValidActivityConcentrationScaleFactor: boolean = instances.every(
      instance => {
        return (
          instance.PhilipsPETPrivateGroup &&
          !instance.PhilipsPETPrivateGroup?.SUVScaleFactor &&
          instance.PhilipsPETPrivateGroup?.ActivityConcentrationScaleFactor !==
            undefined &&
          instance.PhilipsPETPrivateGroup?.ActivityConcentrationScaleFactor !==
            0
        );
      }
    );

    if (hasValidActivityConcentrationScaleFactor) {
      // Note that for the Philips case these are probably all identical,
      // but the function still returns an array.
      const bqmlScaleFactors: number[] = _calculateBQMLScaleFactor(instances);

      // if (0x7053,0x1000) not present, but (0x7053,0x1009) is present, then (0x7053,0x1009) * Rescale Slope,
      // scales pixels to Bq/ml, and proceed as if Units are BQML
      results = instances.map((instance, index) => {
        // Added ! to tell Typescript that this can't be undefined, since we are testing it
        // in the .every loop above.
        return (
          instance.PhilipsPETPrivateGroup!.ActivityConcentrationScaleFactor! *
          bqmlScaleFactors[index]
        );
      });
    }

    throw new Error(
      `Units are in CNTS, but PhilipsPETPrivateGroup has invalid values: ${PhilipsPETPrivateGroup}`
    );
  } else if (Units === 'GML') {
    // assumes that GML indicates SUVbw instead of SUVlbm
    results.fill(1);
  } else {
    throw new Error(`Units has an invalid value: ${Units}`);
  }

  let sulFactor: number | undefined;
  if (PatientWeight && PatientSex && PatientSize) {
    const sulInputs: SULScalingFactorInput = {
      PatientWeight,
      PatientSex,
      PatientSize,
    };

    // TODO: Determine which SUV values we want to return
    // e.g. lean body mass, body surface area...
    sulFactor = calculateSULScalingFactor(sulInputs);
  }

  return results.map(result => {
    const factors: ScalingFactorResult = {
      suvFactor: result,
    };

    if (sulFactor) {
      factors.sulFactor = sulFactor * result;
    }

    return factors;
  });
}

export { calculateSUVScalingFactors };
