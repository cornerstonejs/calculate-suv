import parseDA from '../src/parseDA';

describe('parseDA', () => {
  describe('when parsing a valid DA', () => {
    it('should return the expected value', () => {
      // Arrange
      const daString = '20140329';

      // Act
      const val = parseDA(daString);

      // Assert
      expect(val.year).toEqual(2014);
      expect(val.month).toEqual(3);
      expect(val.day).toEqual(29);
    });
  });

  describe('when parsing a DA with a bad month', () => {
    it('should throw an exception', () => {
      // Arrange
      const daString = '20150001';
      const invoker = () => parseDA(daString);

      // Act / Asset
      expect(invoker).toThrow();
    });
  });

  describe('when parsing a DA with a bad day', () => {
    it('should throw an exception', () => {
      // Arrange
      const daString = '20150100';
      const invoker = () => parseDA(daString);

      // Act
      expect(invoker).toThrow();
    });
  });

  describe('when parsing a DA that is not a leap year', () => {
    it('should throw an exception', () => {
      // Arrange
      const daString = '20150229';
      const invoker = () => parseDA(daString);

      // Act / Asset
      expect(invoker).toThrow();
    });
  });

  describe('when parsing DA that is a leap year', () => {
    it('should return the expected value', () => {
      // Arrange
      const daString = '20160229';

      // Act
      const val = parseDA(daString);

      // Assert
      expect(val.year).toEqual(2016);
      expect(val.month).toEqual(2);
      expect(val.day).toEqual(29);
    });
  });

  describe('when parsing a DA with non-number characters on "day" positions', () => {
    it('should throw an exception', () => {
      // Arrange
      const daString = '201500AA';
      const invoker = () => parseDA(daString);

      // Act / Assert
      expect(invoker).toThrow();
    });
  });

  describe('when parsing a DA with non-number characters on "year" positions', () => {
    it('should throw an exception', () => {
      // Arrange
      const daString = 'AAAA0102';
      const invoker = () => parseDA(daString);

      // Act / Assert
      expect(invoker).toThrow();
    });
  });

  describe('when parsing a DA with non-number characters on "month" positions', () => {
    it('parseDA month not number', () => {
      // Arrange
      const daString = '2015AA02';
      const invoker = () => parseDA(daString);

      // Act / Assert
      expect(invoker).toThrow();
    });
  });

  describe('when parsing a date with invalid length', () => {
    it('should throw an exception', () => {
      // Arrange
      const daString = '201501';
      const invoker = () => parseDA(daString);

      // Act / Assert
      expect(invoker).toThrow();
    });
  });
});
