import calculateStartTime from '../src/calculateStartTime';
import { FullDateInterface } from '../src/combineDateTime';

describe('calculateStartTime', () => {
  describe('when RadiopharmaceuticalStartDateTime is provided', () => {
    it('should return correct startDate', () => {
      // Arrange
      const data = {
        RadiopharmaceuticalStartDateTime: '20200927083045.000000',
        RadiopharmaceuticalStartTime: '083045.000000',
        SeriesDate: '20200927',
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert
      const earliestDateTime = new FullDateInterface(
        '2020-09-27T08:30:45.000000Z'
      );

      expect(startDateTime).toEqual(earliestDateTime);
    });
  });

  describe('when RadiopharmaceuticalStartDateTime is NOT provided', () => {
    it('should return correct startDate', () => {
      // Arrange
      const data = {
        RadiopharmaceuticalStartDateTime: undefined,
        RadiopharmaceuticalStartTime: '083045.000000',
        SeriesDate: '20200927',
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert
      const earliestDateTime = new FullDateInterface(
        '2020-09-27T08:30:45.000000Z'
      );

      expect(startDateTime).toEqual(earliestDateTime);
    });
  });

  describe('when RadiopharmaceuticalStartTime is later in the day than the scan', () => {
    it('should put the start on the day before the Series Date', () => {
      // Arrange: injected at 23:30, scanned at 00:30 the next day
      const data = {
        RadiopharmaceuticalStartTime: '233000',
        SeriesDate: '20200928',
        ScanDateTime: new FullDateInterface('2020-09-28T00:30:00.000000Z'),
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert
      expect(startDateTime).toEqual(
        new FullDateInterface('2020-09-27T23:30:00.000000Z')
      );
    });

    it('should keep the Series Date for a start before the scan', () => {
      // Arrange
      const data = {
        RadiopharmaceuticalStartTime: '233000',
        SeriesDate: '20200927',
        ScanDateTime: new FullDateInterface('2020-09-27T23:45:00.000000Z'),
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert
      expect(startDateTime).toEqual(
        new FullDateInterface('2020-09-27T23:30:00.000000Z')
      );
    });

    it('should keep the Series Date for a start a few minutes after the scan', () => {
      // Arrange: a wrong time, not a scan past midnight
      const data = {
        RadiopharmaceuticalStartTime: '100500',
        SeriesDate: '20200927',
        ScanDateTime: new FullDateInterface('2020-09-27T10:00:00.000000Z'),
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert: left after the scan, for the decay time to be refused
      expect(startDateTime).toEqual(
        new FullDateInterface('2020-09-27T10:05:00.000000Z')
      );
    });

    it('should put the start on the day before only when it is more than 12 hours after the scan', () => {
      // Arrange
      const ScanDateTime = new FullDateInterface('2020-09-28T08:00:00.000000Z');
      const SeriesDate = '20200928';

      // Act
      const twelveHours = calculateStartTime({
        RadiopharmaceuticalStartTime: '200000',
        SeriesDate,
        ScanDateTime,
      });
      const aSecondMore = calculateStartTime({
        RadiopharmaceuticalStartTime: '200001',
        SeriesDate,
        ScanDateTime,
      });

      // Assert
      expect(twelveHours).toEqual(
        new FullDateInterface('2020-09-28T20:00:00.000000Z')
      );
      expect(aSecondMore).toEqual(
        new FullDateInterface('2020-09-27T20:00:01.000000Z')
      );
    });
  });

  describe('when RadiopharmaceuticalStartDateTime has its offset from UTC', () => {
    it('should convert it to the time zone of TimezoneOffsetFromUTC', () => {
      // Arrange: 07:30:45 UTC is 08:30:45 at +0100
      const data = {
        RadiopharmaceuticalStartDateTime: '20200927073045+0000',
        TimezoneOffsetFromUTC: '+0100',
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert
      expect(startDateTime).toEqual(
        new FullDateInterface('2020-09-27T08:30:45.000000Z')
      );
    });

    it('should convert it across midnight, keeping its fraction of a second', () => {
      // Arrange: 23:30:45.5 at -0100 is 01:30:45.5 the next day at +0100
      const data = {
        RadiopharmaceuticalStartDateTime: '20200927233045.5-0100',
        TimezoneOffsetFromUTC: '+0100',
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert
      expect(startDateTime).toEqual(
        new FullDateInterface('2020-09-28T01:30:45.500000Z')
      );
    });

    it('should keep it as written without TimezoneOffsetFromUTC', () => {
      // Arrange
      const data = {
        RadiopharmaceuticalStartDateTime: '20200927083045+0200',
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert: the offset is not read as a fraction of a second either
      expect(startDateTime).toEqual(
        new FullDateInterface('2020-09-27T08:30:45.000000Z')
      );
    });

    it('should keep it as written with a TimezoneOffsetFromUTC that is not one', () => {
      ['0100', '+01:00', '', (100 as unknown) as string].forEach(
        TimezoneOffsetFromUTC => {
          // Arrange
          const data = {
            RadiopharmaceuticalStartDateTime: '20200927083045+0200',
            TimezoneOffsetFromUTC,
          };

          // Act
          const startDateTime = calculateStartTime(data);

          // Assert
          expect(startDateTime).toEqual(
            new FullDateInterface('2020-09-27T08:30:45.000000Z')
          );
        }
      );
    });
  });

  describe('when RadiopharmaceuticalStartDateTime has no offset from UTC', () => {
    it('should keep it as written, in the time zone of TimezoneOffsetFromUTC', () => {
      // Arrange
      const data = {
        RadiopharmaceuticalStartDateTime: '20200927083045.5',
        TimezoneOffsetFromUTC: '+0100',
      };

      // Act
      const startDateTime = calculateStartTime(data);

      // Assert
      expect(startDateTime).toEqual(
        new FullDateInterface('2020-09-27T08:30:45.500000Z')
      );
    });
  });

  describe('when input is invalid', () => {
    it('should throw an Error', () => {
      // Arrange
      const data = {
        RadiopharmaceuticalStartDateTime: undefined,
        RadiopharmaceuticalStartTime: undefined,
        SeriesDate: '20200927',
      };

      // Act
      const invoker = () => calculateStartTime(data);

      // Assert
      expect(invoker).toThrowError(`Invalid input: ${data}`);
    });
  });
});
