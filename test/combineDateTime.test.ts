import combineDateTime, { FullDateInterface } from '../src/combineDateTime';

describe('combineDateTime', () => {
  it('should properly combine date and time objects into a JS Date', () => {
    // Arrange
    const date = {
      year: 2020,
      month: 2,
      day: 27,
    };

    const time = {
      hours: 9,
      minutes: 47,
      seconds: 10,
      fractionalSeconds: 12004,
    };

    // Act
    const combinedDateTime = combineDateTime(date, time);

    // Assert
    const expected = new FullDateInterface('2020-02-27T09:47:10.120040Z');
    expect(combinedDateTime).toEqual(expected);
  });

  it('should properly combine date and time, even if some time values are missing', () => {
    // Arrange
    const date = {
      year: 2020,
      month: 11,
      day: 27,
    };

    const time = {};

    // Act
    const combinedDateTime = combineDateTime(date, time);

    // Assert
    const expected = new FullDateInterface('2020-11-27T00:00:00.000000Z');
    expect(combinedDateTime).toEqual(expected);
  });

  it('should properly return the time in sec', () => {
    // Arrange
    const date = {
      year: 2020,
      month: 2,
      day: 27,
    };

    const time = {
      hours: 9,
      minutes: 47,
      seconds: 10,
      fractionalSeconds: 12004,
    };

    // Act
    const combinedDateTime = combineDateTime(date, time);
    const timeInSec = combinedDateTime.getTimeInSec();
    const dateJS = new Date(`2020-02-27T00:00:00.000000Z`);

    // Assert
    const expected =
      dateJS.getTime() / 1000 + 9 * 3600 + 47 * 60 + 10 + 0.12004;
    expect(timeInSec).toEqual(expected);
  });

  it('should properly return the time in microsec', () => {
    // Arrange
    const date = {
      year: 2020,
      month: 2,
      day: 27,
    };

    const time = {
      hours: 9,
      minutes: 47,
      seconds: 10,
      fractionalSeconds: 12004,
    };

    // Act
    const combinedDateTime = combineDateTime(date, time);
    const timeInMicroSec = combinedDateTime.getTimeInMicroSec();
    const dateJS = new Date(`2020-02-27T00:00:00.000000Z`);

    // Assert
    const expected =
      (dateJS.getTime() / 1000 + 9 * 3600 + 47 * 60 + 10 + 0.12004) * 1e6;
    expect(timeInMicroSec).toEqual(expected);
  });

  it('should return error for invalid date', () => {
    // Arrange
    const date = {
      year: 4000,
      month: 31,
      day: -2,
    };

    const time = {
      hours: 9,
      minutes: 47,
      seconds: 10,
      fractionalSeconds: 12004,
    };

    // Act
    const combinedDateTime = combineDateTime(date, time);

    // Assert
    expect(() => {
      combinedDateTime.getTimeInSec();
    }).toThrowError(`invalid date`);
  });

  it('should return error for invalid time', () => {
    // Arrange
    const date = {
      year: 2020,
      month: 2,
      day: 27,
    };

    const time = {
      hours: 58,
      minutes: -32,
      seconds: 100,
      fractionalSeconds: 12004,
    };

    // Act
    const combinedDateTime = combineDateTime(date, time);

    // Assert
    expect(() => {
      combinedDateTime.getTimeInMicroSec();
    }).toThrowError(`invalid time`);
  });

  it('FullDateInterface should return error for bad date formatting', () => {
    // Arrange
    const string = '2TZ';

    // Act
    const date = new FullDateInterface(string);

    // Assert
    expect(() => {
      date.getTimeInSec();
    }).toThrowError(`invalid date`);
  });

  it('FullDateInterface should return error for bad time formatting', () => {
    // Arrange
    const string = '2020-02-27TZ';

    // Act
    const date = new FullDateInterface(string);

    // Assert
    expect(() => {
      date.getTimeInSec();
    }).toThrowError(`invalid time`);
  });
});
