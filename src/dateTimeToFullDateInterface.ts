import combineDateTime, { FullDateInterface } from './combineDateTime';
import parseDA from './parseDA';
import parseTM from './parseTM';
import shiftDateTime from './shiftDateTime';

/**
 * An offset from UTC, &ZZXX, in seconds, or undefined if it is not one.
 *
 * @param {string} offset
 * @returns {number | undefined}
 */
function offsetInSec(offset?: string): number | undefined {
  const match =
    typeof offset === 'string'
      ? /^([+-])(\d{2})(\d{2})$/.exec(offset.trim())
      : null;
  if (!match) {
    return undefined;
  }
  const seconds = Number(match[2]) * 3600 + Number(match[3]) * 60;
  return match[1] === '-' ? -seconds : seconds;
}

/**
 * Utility to create a FullDateInterface object given a DICOM DT string,
 * YYYYMMDDHHMMSS.FFFFFF&ZZXX. A DT may end with its own offset from UTC
 * (&ZZXX). It is then converted to the time zone given by
 * timezoneOffsetFromUTC, the Timezone Offset From UTC (0008,0201) of the
 * instance, in which its DA and TM values are, so that they compare. Without
 * timezoneOffsetFromUTC, or with one that is not &ZZXX, the time zone of the
 * DA and TM values is not known, and the DT is kept as written.
 *
 * @export
 * @param {string} dateTime
 * @param {string} [timezoneOffsetFromUTC]
 * @returns {FullDateInterface}
 */
export default function dateTimeToFullDateInterface(
  dateTime: string,
  timezoneOffsetFromUTC?: string
): FullDateInterface {
  if (dateTime === undefined || dateTime === null) {
    throw new Error('dateTimeToFullDateInterface : dateTime not defined.');
  }

  const offset = /[+-]\d{4}$/.exec(dateTime);
  const local = offset ? dateTime.substring(0, offset.index) : dateTime;
  const date = parseDA(local.substring(0, 8));
  const time = parseTM(local.substring(8));
  const fullDate = combineDateTime(date, time);

  const from = offset ? offsetInSec(offset[0]) : undefined;
  const to = offsetInSec(timezoneOffsetFromUTC);
  if (from === undefined || to === undefined) {
    return fullDate;
  }
  return shiftDateTime(fullDate, to - from);
}

export { dateTimeToFullDateInterface };
