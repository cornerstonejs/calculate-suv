import {
  calculateScanTime,
  SeriesDateTimeAndAcquisitionTimePerInstance,
} from './calculateScanTime';

import { calculateStartTime } from './calculateStartTime';

import { DecayCorrectionValue, UnitsValue, CorrectedImageValue } from './types';

interface PhilipsPETPrivateGroup {
  SUVScaleFactor: number | undefined; // 0x7053,0x1000)
  ActivityConcentrationScaleFactor: number | undefined; // 0x7053,0x1009
}

export interface SUVScalingFactorInput {
  CorrectedImage: string[];
  Units: UnitsValue; // Units (0x0054,0x1001)
  RadionuclideHalfLife: number; // 	RadionuclideHalfLife(0x0018,0x1075)	in	Radiopharmaceutical	Information	Sequence(0x0054,0x0016)
  RadiopharmaceuticalStartTime?: string; // From the old version of the DICOM standard
  RadiopharmaceuticalStartDateTime?: string;
  TotalDose: number;
  DecayCorrection: DecayCorrectionValue;
  PatientWeight: number;
  PhilipsPETPrivateGroup?: PhilipsPETPrivateGroup;
  seriesDateTimeAndAcquisitionTimePerInstance: SeriesDateTimeAndAcquisitionTimePerInstance[];
}

function _calculateBQMLScaleFactor(inputs: SUVScalingFactorInput): number {
  const {
    TotalDose,
    RadionuclideHalfLife,
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    PatientWeight,
    seriesDateTimeAndAcquisitionTimePerInstance,
  } = inputs;

  const seriesDate: string =
    seriesDateTimeAndAcquisitionTimePerInstance[0].SeriesDate;
  const scanTime: Date = calculateScanTime(
    seriesDateTimeAndAcquisitionTimePerInstance
  );
  const startTime: Date = calculateStartTime({
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    SeriesDate: seriesDate,
  });

  const decayTimeInSec: number =
    (scanTime.getTime() - startTime.getTime()) / 1000;
  const decayedDose: number =
    TotalDose * Math.pow(2, -decayTimeInSec / RadionuclideHalfLife);
  const weightInGrams: number = PatientWeight * 1000;

  return weightInGrams / decayedDose;
}

/**
 *
 * Note: Rescale Slope / Intercept must still be applied. These must be applied
 *       on a per-Frame basis, since some scanners may have different values per Frame.
 * @param inputs
 */
export default function calculateSUVScalingFactor(
  inputs: SUVScalingFactorInput
): number {
  const { CorrectedImage, Units, PhilipsPETPrivateGroup } = inputs;

  if (
    !CorrectedImage.includes(CorrectedImageValue.ATTN) ||
    !CorrectedImage.includes(CorrectedImageValue.DECY)
  ) {
    throw new Error(
      `CorrectedImage must contain "ATTN" and "DECY": ${CorrectedImage}`
    );
  }

  if (Units === UnitsValue.BQML) {
    // Need to get the reference time from the metadata for all instances in the series
    return _calculateBQMLScaleFactor(inputs);
  } else if (Units === UnitsValue.CNTS) {
    if (
      PhilipsPETPrivateGroup?.SUVScaleFactor !== undefined &&
      PhilipsPETPrivateGroup?.SUVScaleFactor !== 0
    ) {
      return PhilipsPETPrivateGroup.SUVScaleFactor;
    } else if (
      !PhilipsPETPrivateGroup?.SUVScaleFactor &&
      PhilipsPETPrivateGroup?.ActivityConcentrationScaleFactor !== undefined &&
      PhilipsPETPrivateGroup?.ActivityConcentrationScaleFactor !== 0
    ) {
      // if (0x7053,0x1000) not present, but (0x7053,0x1009) is present, then (0x7053,0x1009) * Rescale Slope,
      // scales pixels to Bq/ml, and proceed as if Units are BQML
      return (
        PhilipsPETPrivateGroup?.ActivityConcentrationScaleFactor *
        _calculateBQMLScaleFactor(inputs)
      );
    } else {
      throw new Error(
        `Units are in CNTS, but PhilipsPETPrivateGroup has invalid values: ${PhilipsPETPrivateGroup}`
      );
    }
  } else if (Units === UnitsValue.GML) {
    // assumes that GML indicates SUVbw instead of SUVlbm
    return 1;
  } else {
    throw new Error(`Units has an invalid value: ${Units}`);
  }
}

export { calculateSUVScalingFactor };
