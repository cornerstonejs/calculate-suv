import combineDateTime, { FullDateInterface } from './combineDateTime';
import { parseDA, DateInterface } from './parseDA';
import { parseTM, TimeInterface } from './parseTM';
import dateTimeToFullDateInterface from './dateTimeToFullDateInterface';
import shiftDateTime from './shiftDateTime';

// A start given by its time alone is taken for one before midnight when the
// Series Date puts it more than this after the scan
const HALF_A_DAY_IN_SEC = 12 * 3600;

/**
 * Calculate start time. A start given by its time alone is on the Series
 * Date, or on the day before when that would put it more than 12 hours after
 * the scan, given by ScanDateTime: the scan then went over midnight. A start
 * after the scan by less is taken for a wrong time, not for a midnight, and
 * is left after the scan, where the decay time is refused as negative.
 *
 * @export
 * @param {{
 *   RadiopharmaceuticalStartDateTime?: string;
 *   RadiopharmaceuticalStartTime?: string;
 *   SeriesDate?: string;
 *   TimezoneOffsetFromUTC?: string;
 *   ScanDateTime?: FullDateInterface;
 * }} input
 * @returns {FullDateInterface}
 */
export default function calculateStartTime(input: {
  RadiopharmaceuticalStartDateTime?: string;
  RadiopharmaceuticalStartTime?: string;
  SeriesDate?: string;
  TimezoneOffsetFromUTC?: string;
  ScanDateTime?: FullDateInterface;
}): FullDateInterface {
  const {
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    SeriesDate,
    TimezoneOffsetFromUTC,
    ScanDateTime,
  } = input;

  let time: TimeInterface;
  let date: DateInterface;
  if (RadiopharmaceuticalStartDateTime) {
    return dateTimeToFullDateInterface(
      RadiopharmaceuticalStartDateTime,
      TimezoneOffsetFromUTC
    );
  } else if (RadiopharmaceuticalStartTime && SeriesDate) {
    // start Date is not explicit - assume same as Series Date;
    // but consider spanning midnight
    time = parseTM(RadiopharmaceuticalStartTime);
    date = parseDA(SeriesDate);
    const startDateTime = combineDateTime(date, time);

    if (
      ScanDateTime &&
      startDateTime.getTimeInSec() - ScanDateTime.getTimeInSec() >
        HALF_A_DAY_IN_SEC
    ) {
      return shiftDateTime(startDateTime, -24 * 3600);
    }
    return startDateTime;
  }

  throw new Error(`Invalid input: ${input}`);
}

export { calculateStartTime };
