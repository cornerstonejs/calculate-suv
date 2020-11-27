import calculateScanTimes from '../src/calculateScanTimes';
import dateTimeToJSDate from '../src/dateTimeToJSDate';

describe('calculateScanTimes', () => {
  describe('when SeriesData and AcquisitionDate match and SeriesTime is earlier than AcquisitionTime', () => {
    it('should return the earliest DateTime among all series', () => {
      // Arrange
      const SeriesDate = '20201127';
      const SeriesTime = '093010.10001';
      const instances = [
        {
          SeriesDate,
          AcquisitionDate: SeriesDate,
          AcquisitionTime: '095010.12001',
          SeriesTime,
        },
        {
          SeriesDate,
          AcquisitionDate: SeriesDate,
          AcquisitionTime: '094710.12004', // This is the earliest value
          SeriesTime,
        },
        {
          SeriesDate,
          AcquisitionDate: SeriesDate,
          AcquisitionTime: '095340.12001',
          SeriesTime,
        },
      ];

      // Act
      const scanDateTimes = calculateScanTimes(instances);

      // Assert
      const earliestDateTime = dateTimeToJSDate(`${SeriesDate}${SeriesTime}`);

      scanDateTimes.forEach(scanDateTime => {
        expect(scanDateTime).toEqual(earliestDateTime);
      });
    });
  });

  // TODO: Add test for when when SeriesData and AcquisitionDate do not match
  // (i.e. AcquisitionDate is the next day, due to acquiring near midnight or
  // long half-life tracers such as Iodine 124)
  // TODO: when SeriesData and AcquisitionDate do not match and SeriesTime is later than AcquisitionTime
  // TODO: when SeriesData and AcquisitionDate match and SeriesTime is earlier than AcquisitionTime
  // TODO: when SeriesData and AcquisitionDate do not match and SeriesTime is later than AcquisitionTime
  // TODO: Add test to verify error is thrown if input is invalid
});
