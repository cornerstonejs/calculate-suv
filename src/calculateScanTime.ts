export interface SeriesDateTimeAndAcquisitionTimePerInstance {
  SeriesDate: string;
  SeriesTime: string;
  AcquisitionDate: string;
  AcquisitionTime: string;
}

export default function calculateScanTime(
  inputs: SeriesDateTimeAndAcquisitionTimePerInstance[]
): Date {
  // TODO: Loop through each value and find the earliest DateTime that was used
  // This is used as the scan time in the decay calculation
  // TODO: Implement Siemens series with altered Date / time and GE private scan date/time
  console.log(inputs);

  return new Date();
}

export { calculateScanTime };
