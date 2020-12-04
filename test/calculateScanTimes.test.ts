import calculateScanTimes from '../src/calculateScanTimes';
import dateTimeToFullDateInterface from '../src/dateTimeToFullDateInterface';

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
      const earliestDateTime = dateTimeToFullDateInterface(
        `${SeriesDate}${SeriesTime}`
      );

      scanDateTimes.forEach(scanDateTime => {
        expect(scanDateTime).toEqual(earliestDateTime);
      });
    });
  });

  describe('when SeriesData and AcquisitionDate do not match', () => {
    // (i.e. AcquisitionDate is the next day, due to acquiring near midnight or
    // long half-life tracers such as Iodine 124)
    it('should return the earliest DateTime among all series', () => {
      // Arrange
      const SeriesDate = '20201127';
      const AcquisitionDate = '20201128';
      const SeriesTime = '113010';
      const instances = [
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '115010',
          SeriesTime,
        },
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '113010', // This is the earliest value
          SeriesTime,
        },
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '123010',
          SeriesTime,
        },
      ];

      // Act
      const scanDateTimes = calculateScanTimes(instances);

      // Assert
      const earliestDateTime = dateTimeToFullDateInterface(
        `${SeriesDate}${SeriesTime}`
      );

      scanDateTimes.forEach(scanDateTime => {
        expect(scanDateTime).toEqual(earliestDateTime);
      });
    });
  });

  describe('SeriesData and AcquisitionDate do not match and SeriesTime is later than AcquisitionTime', () => {
    it('should return the earliest DateTime among all series', () => {
      // Arrange
      const SeriesDate = '20201127';
      const AcquisitionDate = '20201128';
      const SeriesTime = '173010';
      const instances = [
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '115010',
          SeriesTime,
        },
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '113010', // This is the earliest value
          SeriesTime,
        },
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '123010',
          SeriesTime,
        },
      ];

      // Act
      const scanDateTimes = calculateScanTimes(instances);

      // Assert
      const earliestDateTime = dateTimeToFullDateInterface(
        `${SeriesDate}${SeriesTime}`
      );

      scanDateTimes.forEach(scanDateTime => {
        expect(scanDateTime).toEqual(earliestDateTime);
      });
    });
  });

  describe('SeriesData and AcquisitionDate match and SeriesTime is earlier than AcquisitionTime', () => {
    it('should return the earliest DateTime among all series', () => {
      // Arrange
      const SeriesDate = '20201127';
      const AcquisitionDate = SeriesDate;
      const SeriesTime = '113010';
      const instances = [
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '115010',
          SeriesTime,
        },
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '113010', // This is the earliest value
          SeriesTime,
        },
        {
          SeriesDate,
          AcquisitionDate,
          AcquisitionTime: '123010',
          SeriesTime,
        },
      ];

      // Act
      const scanDateTimes = calculateScanTimes(instances);

      // Assert
      const earliestDateTime = dateTimeToFullDateInterface(
        `${SeriesDate}${SeriesTime}`
      );

      scanDateTimes.forEach(scanDateTime => {
        expect(scanDateTime).toEqual(earliestDateTime);
      });
    });
  });

  describe('GEPrivatePostInjectionDateTime', () => {
    it('should return the GEPrivatePostInjection DateTime', () => {
      // Arrange
      const SeriesDate = '20201127';
      const AcquisitionDate = SeriesDate;
      const SeriesTime = '133010';
      const GEPrivatePostInjectionDateTime = '20201128183010';
      const instances = [
        {
          SeriesDate,
          SeriesTime,
          AcquisitionDate,
          AcquisitionTime: '123010',
          GEPrivatePostInjectionDateTime,
        },
      ];

      // Act
      const scanDateTimes = calculateScanTimes(instances);

      // Assert
      const GEDateTime = dateTimeToFullDateInterface(
        GEPrivatePostInjectionDateTime
      );

      scanDateTimes.forEach(scanDateTime => {
        expect(scanDateTime).toEqual(GEDateTime);
      });
    });
  });
});

describe('calculateScanTimes Error Handling', () => {
  it('throws an Error if earliest acquisition scan time could not be calculated', () => {
    // Arrange
    const instances = [
      {
        SeriesDate: '20201127',
        SeriesTime: '133010',
        AcquisitionDate: '30001127',
        AcquisitionTime: '133010',
      },
    ];

    // Act
    expect(() => {
      calculateScanTimes(instances);
    }).toThrowError('Earliest acquisition time or date could not be parsed.');
  });
});
