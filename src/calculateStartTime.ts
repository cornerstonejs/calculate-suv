import { parseDA, DateInterface } from './parseDA';
import { parseTM, TimeInterface } from './parseTM';
import dateTimeToJSDate from './dateTimeToJSDate';
import combineDateTime from './combineDateTime';

export default function calculateStartTime(input: {
  RadiopharmaceuticalStartDateTime?: string;
  RadiopharmaceuticalStartTime?: string;
  SeriesDate?: string;
}): Date {
  const {
    RadiopharmaceuticalStartDateTime,
    RadiopharmaceuticalStartTime,
    SeriesDate,
  } = input;

  let time: TimeInterface;
  let date: DateInterface;
  if (RadiopharmaceuticalStartDateTime) {
    return dateTimeToJSDate(RadiopharmaceuticalStartDateTime);
  } else if (RadiopharmaceuticalStartTime && SeriesDate) {
    // start Date	is not explicit - assume	same as	Series Date;
    // but consider	spanning midnight
    // TODO: do we need some logic to check if the scan went over midnight?
    time = parseTM(RadiopharmaceuticalStartTime);
    date = parseDA(SeriesDate);

    return combineDateTime(date, time);
  }

  throw new Error(`Invalid input: ${input}`);
}

export { calculateStartTime };
