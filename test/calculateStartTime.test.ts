import calculateStartTime from '../src/calculateStartTime';
//import combineDateTime from '../src/combineDateTime';

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
      const earliestDateTime = new Date('2020-09-27T08:30:45.000Z');

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
      const earliestDateTime = new Date('2020-09-27T08:30:45.000Z');

      expect(startDateTime).toEqual(earliestDateTime);
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
