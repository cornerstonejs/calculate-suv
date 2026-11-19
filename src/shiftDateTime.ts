import { FullDateInterface } from './combineDateTime';

/**
 * Moves a FullDateInterface by a whole number of seconds, keeping its
 * fraction of a second.
 *
 * @export
 * @param {FullDateInterface} dateTime formatted as yyyy-mm-ddTHH:MM:SS.FFFFFFZ
 * @param {number} seconds
 * @returns {FullDateInterface}
 */
export default function shiftDateTime(
  dateTime: FullDateInterface,
  seconds: number
): FullDateInterface {
  const { fullDate } = dateTime;
  const whole = Date.parse(`${fullDate.substring(0, 19)}Z`) + seconds * 1000;
  const shifted = new Date(whole).toISOString().substring(0, 19);
  return new FullDateInterface(`${shifted}${fullDate.substring(19)}`);
}

export { shiftDateTime };
