import { DateInterface } from './parseDA';
import { TimeInterface } from './parseTM';

export default function combineDateTime(
  date: DateInterface,
  time: TimeInterface
): Date {
  const hours = `${time.hours || '00'}`.padStart(2, '0');
  const minutes = `${time.minutes || '00'}`.padStart(2, '0');
  const seconds = `${time.seconds || '00'}`.padStart(2, '0');
  const month = `${date.month}`.padStart(2, '0');
  const day = `${date.day}`.padStart(2, '0');
  const fractionalSeconds = `${time.fractionalSeconds || '000'}`;
  const dateString = `${date.year}-${month}-${day}`;
  const timeString = `T${hours}:${minutes}:${seconds}.${fractionalSeconds}Z`;

  return new Date(`${dateString}${timeString}`);
}

export { combineDateTime };
