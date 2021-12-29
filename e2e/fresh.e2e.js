const execSync = require('child_process').execSync;

describe('LifeTime', () => {
  it('should ask permissions if needed', async () => {
    await device.launchApp({permissions: {calendar: 'NO'}});

    await expect(element(by.id('WelcomeContinue'))).toBeVisible();
    await element(by.id('WelcomeContinue')).tap();

    await expect(element(by.id('AllowCalendarsAccess'))).toBeVisible();
  });

  it('should not ask permissions if not needed', async () => {
    await device.launchApp({permissions: {calendar: 'YES'}});

    await expect(element(by.id('WelcomeContinue'))).toBeVisible();
    await element(by.id('WelcomeContinue')).tap();

    await expect(element(by.id('AllowCalendarsAccess'))).not.toBeVisible();
  });
});
