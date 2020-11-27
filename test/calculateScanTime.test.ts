import calculateScanTime from '../src/calculateScanTime';
import combineDateTime from '../src/combineDateTime';

describe('calculateScanTime', () => {
  describe('when SeriesData and AcquisitionDate match and SeriesTime is later than AcquisitionTime', () => {
    it('should return the earliest DateTime among all series', () => {
      // Arrange
      const SeriesDate = '20201127';
      const SeriesTime = '095210.10001';
      let instances = [
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
      const scanDateTime = calculateScanTime(instances);

      // Assert
      const earliestDateTime = combineDateTime(
        {
          year: 2020,
          month: 11,
          day: 27,
        },
        {
          hours: 9,
          minutes: 47,
          seconds: 10,
          fractionalSeconds: 12004,
        }
      );

      expect(scanDateTime).toEqual(earliestDateTime);
    });
  });

  // TODO: Add test for when when SeriesData and AcquisitionDate do not match
  // (i.e. AcquisitionDate is the next day, due to acquiring near midnight or
  // long half-life tracers such as Iodine 124)
  // TODO: when SeriesData and AcquisitionDate do not match and SeriesTime is earlier than AcquisitionTime
  // TODO: when SeriesData and AcquisitionDate match and SeriesTime is earlier than AcquisitionTime
  // TODO: when SeriesData and AcquisitionDate do not match and SeriesTime is later than AcquisitionTime
  // TODO: Add test to verify error is thrown if input is invalid
});
