import combineDateTime from './combineDateTime';
import parseDA, { DateInterface } from './parseDA';
import parseTM, { TimeInterface } from './parseTM';

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

  let earliestDateTime: Date | undefined;
  inputs.forEach(input => {
    const { SeriesDate, SeriesTime, AcquisitionDate, AcquisitionTime } = input;

    // TODO: Series date/time should not change per instance
    // not sure if we should check this outside of the loop or keep it here for safety
    const seriesDate: DateInterface = parseDA(SeriesDate);
    const seriesTime: TimeInterface = parseTM(SeriesTime);
    const seriesDateTime: Date = combineDateTime(seriesDate, seriesTime);

    const acquisitionDate: DateInterface = parseDA(AcquisitionDate);
    const acquisitionTime: TimeInterface = parseTM(AcquisitionTime);
    const acquisitionDateTime: Date = combineDateTime(
      acquisitionDate,
      acquisitionTime
    );

    if (!earliestDateTime) {
      earliestDateTime =
        seriesDateTime < acquisitionDateTime
          ? seriesDateTime
          : acquisitionDateTime;
    } else {
      earliestDateTime =
        acquisitionDateTime < earliestDateTime
          ? acquisitionDateTime
          : earliestDateTime;
    }
  });

  if (!earliestDateTime) {
    throw new Error('Scan time could not be calculated.');
  }

  return earliestDateTime;
}

export { calculateScanTime };
