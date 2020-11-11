import * as Notfications from '../src/Notifications.bs.js';

test('notifications dates for 9am in various time of the day', () => {
  expect(
    Notfications.appropriateTimeForNextNotification(
      new Date('2000-01-01T01:25:00').getTime(),
      [0, 9],
    ).toISOString(),
  ).toBe(new Date('2000-01-01T09:00:00').toISOString());

  expect(
    Notfications.appropriateTimeForNextNotification(
      new Date('2000-01-01T07:25:00').getTime(),
      [0, 9],
    ).toISOString(),
  ).toBe(new Date('2000-01-01T09:00:00').toISOString());

  expect(
    Notfications.appropriateTimeForNextNotification(
      new Date('2000-01-01T08:25:00').getTime(),
      [0, 9],
    ).toISOString(),
  ).toBe(new Date('2000-01-01T09:00:00').toISOString());

  expect(
    Notfications.appropriateTimeForNextNotification(
      new Date('2000-01-01T08:31:00').getTime(),
      [0, 9],
    ).toISOString(),
  ).toBe(new Date('2000-01-02T09:00:00').toISOString());

  expect(
    Notfications.appropriateTimeForNextNotification(
      new Date('2000-01-01T08:45:00').getTime(),
      [0, 9],
    ).toISOString(),
  ).toBe(new Date('2000-01-02T09:00:00').toISOString());

  expect(
    Notfications.appropriateTimeForNextNotification(
      new Date('2000-01-01T08:59:00').getTime(),
      [0, 9],
    ).toISOString(),
  ).toBe(new Date('2000-01-02T09:00:00').toISOString());

  expect(
    Notfications.appropriateTimeForNextNotification(
      new Date('2000-01-01T12:25:00').getTime(),
      [0, 9],
    ).toISOString(),
  ).toBe(new Date('2000-01-02T09:00:00').toISOString());

  expect(
    Notfications.appropriateTimeForNextNotification(
      new Date('2000-01-01T22:12:00').getTime(),
      [0, 9],
    ).toISOString(),
  ).toBe(new Date('2000-01-02T09:00:00').toISOString());
});
