import { parseTM, TimeInterface } from '../src/parseTM';

describe('parseTM', () => {
  describe('when parsing a full TM', () => {
    let val: TimeInterface;

    beforeEach(() => {
      // Arrange
      const tmString = '081236.531000';

      // Act
      val = parseTM(tmString);
    });

    it('should return the right hours', () => {
      // Assert
      expect(val.hours).toEqual(8);
    });

    it('should return the right minutes', () => {
      // Assert
      expect(val.minutes).toEqual(12);
    });

    it('should return the right seconds', () => {
      // Assert
      expect(val.seconds).toEqual(36);
    });

    it('should return the right fractionalSeconds', () => {
      // Assert
      expect(val.fractionalSeconds).toEqual(531000);
    });
  });

  describe('when parsing a partial TM', () => {
    let val: TimeInterface;

    beforeEach(() => {
      // Arrange
      const tmString = '08';

      // Act
      val = parseTM(tmString);
    });

    it('should return the right hours', () => {
      // Assert
      expect(val.hours).toEqual(8);
    });

    it('should return the right minutes', () => {
      // Assert
      expect(val.minutes).toBeUndefined();
    });

    it('should return the right seconds', () => {
      // Assert
      expect(val.seconds).toBeUndefined();
    });

    it('should return the right fractionalSeconds', () => {
      // Assert
      expect(val.fractionalSeconds).toBeUndefined();
    });
  });

  describe('when parsing a partial fractional TM', () => {
    it('should return the expected value for no zeros', () => {
      // Arrange
      const tmString = '081236.5';

      // Act
      const val = parseTM(tmString);

      // Assert
      expect(val.hours).toEqual(8);
      expect(val.minutes).toEqual(12);
      expect(val.seconds).toEqual(36);
      expect(val.fractionalSeconds).toEqual(500000);
    });

    it('should return the expected value for leading and following zeros', () => {
      // Arrange
      const tmString = '081236.00500';

      // Act
      const val = parseTM(tmString);

      // Assert
      expect(val.hours).toEqual(8);
      expect(val.minutes).toEqual(12);
      expect(val.seconds).toEqual(36);
      expect(val.fractionalSeconds).toEqual(5000);
    });
  });

  describe('when parsing a invalid TM', () => {
    it('should throw an exception', () => {
      // Arrange
      const tmString = '241236.531000';
      const invoker = () => parseTM(tmString);

      // Act / Asset
      expect(invoker).toThrow();
    });
  });

  describe('when parsing a TM with bad seconds', () => {
    it('shoud throw an exception', () => {
      // Arrange
      const tmString = '236036.531000';
      const invoker = () => parseTM(tmString);

      // Act / Asset
      expect(invoker).toThrow();
    });
  });

  describe('when parsing a TM with bad seconds', () => {
    it('should throw an exception', () => {
      // Arrange
      const tmString = '232260.531000';
      const invoker = () => parseTM(tmString);

      // Act
      expect(invoker).toThrow();
    });
  });

  describe('when parsing a TM with bad fractional', () => {
    it('should throw an exception', () => {
      // Arrange
      const tmString = '232259.AA';
      const invoker = () => parseTM(tmString);

      // Act / Asset
      expect(invoker).toThrow();
    });
  });
});
