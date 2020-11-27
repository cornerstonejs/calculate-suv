import combineDateTime from './combineDateTime';
import parseDA from './parseDA';
import parseTM from './parseTM';

export default function dateTimeToJSDate(dateTime: string): Date {
  const date = parseDA(dateTime.substring(0, 8));
  const time = parseTM(dateTime.substring(8));
  return combineDateTime(date, time);
}

export { dateTimeToJSDate };
