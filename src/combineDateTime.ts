import { DateInterface } from './parseDA';
import { TimeInterface } from './parseTM';

export class FullDateInterface {
  fullDate: string;

  constructor(date: string) {
    this.fullDate = date;
  }

  getTimeInSec(): number {
    // returns time as seconds since the first day of the month
    // ideally one would return the time in sec from a precise date (e.g. 1 january 1970),
    // but this would involve much more complicated logic and
    // it is unrealistic that a scanning last more than a month.

    // yyyy-mm-ddTHH:MM:SS.FFFFFFZ
    const dateString = this.fullDate.substring(0, 10);
    const timeString = this.fullDate.substring(11, 28);

    // yyyy-mm-dd
    const yyyy = parseInt(dateString.substring(0, 4), 10);
    const mm =
      dateString.length >= 7
        ? parseInt(dateString.substring(5, 7), 10)
        : undefined;
    const dd =
      dateString.length >= 10
        ? parseInt(dateString.substring(8, 10), 10)
        : undefined;

    if (
      isNaN(yyyy) ||
      (mm !== undefined && isNaN(mm)) ||
      (dd !== undefined && isNaN(dd)) ||
      yyyy < 1970 ||
      yyyy > 3000 ||
      (mm && (mm < 1 || mm > 12)) ||
      (dd && (dd < 1 || dd > 31))
    ) {
      throw new Error(`invalid date '${dateString}'`);
    }

    // HHMMSS.FFFFFF
    const HH = parseInt(timeString.substring(0, 2), 10);
    const MM =
      timeString.length >= 5
        ? parseInt(timeString.substring(3, 5), 10)
        : undefined;
    const SS =
      timeString.length >= 8
        ? parseInt(timeString.substring(6, 8), 10)
        : undefined;
    const fractionalStr = timeString.substring(9, 15);
    const FFFFFF = fractionalStr
      ? parseInt(fractionalStr, 10) * Math.pow(10, -fractionalStr.length)
      : undefined;

    if (
      isNaN(HH) ||
      (MM !== undefined && isNaN(MM)) ||
      (SS !== undefined && isNaN(SS)) ||
      (FFFFFF !== undefined && isNaN(FFFFFF)) ||
      HH < 0 ||
      HH > 23 ||
      (MM && (MM < 0 || MM > 59)) ||
      (SS && (SS < 0 || SS > 59)) ||
      (FFFFFF && (FFFFFF < 0 || FFFFFF > 999999))
    ) {
      throw new Error(`invalid time '${timeString}'`);
    }

    let timeInSec = 0;
    if (dd !== undefined) {
      timeInSec += dd * 86400;
    }

    timeInSec += HH * 3600;
    if (MM !== undefined) {
      timeInSec += MM * 60;
    }
    if (SS !== undefined) {
      timeInSec += SS;
    }
    if (FFFFFF !== undefined) {
      timeInSec += FFFFFF;
    }

    return timeInSec;
  }

  getTimeInMicroSec(): number {
    const timeInMicroSec = this.getTimeInSec() * 1e6;
    return timeInMicroSec;
  }
}

export interface FullDateInterface {
  date: string;
}

export default function combineDateTime(
  date: DateInterface,
  time: TimeInterface
): FullDateInterface {
  const hours = `${time.hours || '00'}`.padStart(2, '0');
  const minutes = `${time.minutes || '00'}`.padStart(2, '0');
  const seconds = `${time.seconds || '00'}`.padStart(2, '0');
  const month = `${date.month}`.padStart(2, '0');
  const day = `${date.day}`.padStart(2, '0');
  const fractionalSeconds = `${time.fractionalSeconds || '000000'}`.padEnd(
    6,
    '0'
  );
  const dateString = `${date.year}-${month}-${day}`;
  const timeString = `T${hours}:${minutes}:${seconds}.${fractionalSeconds}Z`;
  const fullDateString = `${dateString}${timeString}`;

  return new FullDateInterface(fullDateString);
}

export { combineDateTime };
