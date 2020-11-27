import combineDateTime from './combineDateTime';
import parseDA, { DateInterface } from './parseDA';
import parseTM, { TimeInterface } from './parseTM';
import dateTimeToJSDate from './dateTimeToJSDate';

export interface SeriesDateTimeAndAcquisitionTimePerInstance {
  SeriesDate: string;
  SeriesTime: string;
  AcquisitionDate: string;
  AcquisitionTime: string;
  GEPrivatePostInjectionDateTime?: string;
  FrameReferenceTime?: number;
  ActualFrameDuration?: number;
  RadionuclideHalfLife?: number;
}

export default function calculateScanTime(
  inputs: SeriesDateTimeAndAcquisitionTimePerInstance[]
): Date {
  const { SeriesDate, SeriesTime, GEPrivatePostInjectionDateTime } = inputs[0];
  // TODO: Series date/time should not change per instance
  // not sure if we should check this outside of the loop or keep it here for safety
  const seriesDate: DateInterface = parseDA(SeriesDate);
  const seriesTime: TimeInterface = parseTM(SeriesTime);
  const seriesDateTime: Date = combineDateTime(seriesDate, seriesTime);

  // TODO: Loop through each value and find the earliest DateTime that was used
  // This is used as the scan time in the decay calculation
  // TODO: Implement Siemens series with altered Date / time and GE private scan date/time

  let earliestAcquisitionDateTime: Date | undefined;
  inputs.forEach(input => {
    const { AcquisitionDate, AcquisitionTime } = input;

    const acquisitionDate: DateInterface = parseDA(AcquisitionDate);
    const acquisitionTime: TimeInterface = parseTM(AcquisitionTime);
    const acquisitionDateTime: Date = combineDateTime(
      acquisitionDate,
      acquisitionTime
    );

    if (!earliestAcquisitionDateTime) {
      earliestAcquisitionDateTime = acquisitionDateTime;
    } else {
      earliestAcquisitionDateTime =
        acquisitionDateTime < earliestAcquisitionDateTime
          ? acquisitionDateTime
          : earliestAcquisitionDateTime;
    }
  });

  if (!earliestAcquisitionDateTime) {
    throw new Error('Scan time could not be calculated.');
  }

  if (seriesDateTime < earliestAcquisitionDateTime) {
    return seriesDateTime;
  } else {
    if (GEPrivatePostInjectionDateTime) {
      // GE Private scan
      return dateTimeToJSDate(GEPrivatePostInjectionDateTime);
    } else {
      return earliestAcquisitionDateTime;
      /* Siemens-specific logic
      // Note: this is really annoying because it means each instance has its own
               scaling parameter. Should we switch the whole library to return an array
               of scaling parameters intead of just one?

      // TODO the above logic should be switched for the following
         PETsyngo	3.x	multi-injection logic

      - backcompute	from	center	(average	count	rate	)	of	time	window	for	bed	position	(frame)	in	series (reliable	in	all	cases)
      - Acquisition	Date	(0x0008,0x0022)	and	Time	(0x0008,0x0032) are	the	start	of	the	bed	position	(frame)
      - Frame	Reference	Time	(0x0054,0x1300) is	the	offset	(ms)	from	the	scan	Date	and	Time we	want	to	the	average	count	rate	time
      */
      /*inputs.forEach(input => {
      const { FrameReferenceTime, ActualFrameDuration, RadionuclideHalfLife, AcquisitionDate, AcquisitionTime } = input;

      const acquisitionDate: DateInterface = parseDA(AcquisitionDate);
      const acquisitionTime: TimeInterface = parseTM(AcquisitionTime);
      const acquisitionDateTime: Date = combineDateTime(
        acquisitionDate,
        acquisitionTime
      );

      if (FrameReferenceTime !== undefined &&
          FrameReferenceTime > 0 &&
          ActualFrameDuration &&
          ActualFrameDuration > 0) {
        const frameDurationInSec	=	ActualFrameDuration /	1000
        const decayConstant	=	Math.log(2)	/	RadionuclideHalfLife;
        const decayDuringFrame = decayConstant * frameDurationInSec;
        // TODO: double check this is correctly copied from QIBA pseudocode
        const averageCountRateTimeWithinFrameInSec = 1000 * (1 / decayConstant) * (Math.log(decayDuringFrame) / (1 - Math.exp(-decayConstant)));
        const scanDateTime = acquisitionDateTime - FrameReferenceTime + averageCountRateTimeWithinFrameInSec;
       }
     })*/
    }
  }
}

export { calculateScanTime };
