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
  console.log(RadiopharmaceuticalStartDateTime);
  console.log(RadiopharmaceuticalStartTime);
  console.log(SeriesDate);
  return new Date();
}

export { calculateStartTime };
