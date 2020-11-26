import { DateInterface } from './parseDA';
import { TimeInterface } from './parseTM';

export default function combineDateTime(
  date: DateInterface,
  time: TimeInterface
): Date {
  const result: Date = new Date();
  result.setFullYear(date.year);
  result.setMonth(date.month);
  result.setDate(date.day);
  result.setHours(
    time.hours,
    time.minutes,
    time.seconds,
    time.fractionalSeconds
  );

  return result;
}

export { combineDateTime };
