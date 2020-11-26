import { parseDA, DateInterface } from './parseDA';
import { parseTM, TimeInterface } from './parseTM';
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
    const [datePart, timePart] = RadiopharmaceuticalStartDateTime.split('.');

    date = parseDA(datePart);
    time = parseTM(timePart);

    console.log(date);
    console.log(time);

    return combineDateTime(date, time);
  } else if (RadiopharmaceuticalStartTime && SeriesDate) {
    time = parseTM(RadiopharmaceuticalStartTime);
    date = parseDA(SeriesDate);

    return combineDateTime(date, time);
  }

  throw new Error(`Invalid input: ${input}`);
}

export { calculateStartTime };
