const execSync = require('child_process').execSync;

describe('LifeTime', () => {
  it('should ask permissions if needed', async () => {
    await device.launchApp({
      permissions: {calendar: 'NO', notifications: 'NO'},
    });

    await expect(element(by.id('WelcomeContinue'))).toBeVisible();
    await element(by.id('WelcomeContinue')).tap();

    await expect(element(by.id('AllowCalendarsAccess'))).toBeVisible();

    await element(by.id('tabGoals')).tap();
    await expect(
      element(by.id('NotificationsPermissionsPopin_Button_request')),
    ).not.toBeVisible();

    // add goal to get popin
    await element(by.id('Goals_Button_AddAGoal')).tap();
    await element(by.id('GoalEdit_quickDuration_30')).tap();
    await element(by.id('GoalNewModalScreen_ScrollView')).scrollTo('bottom');
    await element(by.id('GoalEdit_category_bullet_rest')).tap();
    await element(by.id('GoalNewModalScreen_Button_Add')).tap();

    await expect(
      element(by.id('NotificationsPermissionsPopin_Button_request')),
    ).toBeVisible();
  });

  it('should not ask permissions if not needed', async () => {
    await device.launchApp({
      delete: true,
      permissions: {calendar: 'YES', notifications: 'YES'},
    });

    await expect(element(by.id('WelcomeContinue'))).toBeVisible();
    await element(by.id('WelcomeContinue')).tap();

    await expect(element(by.id('AllowCalendarsAccess'))).not.toBeVisible();

    await element(by.id('tabGoals')).tap();

    // add goal to get popin
    await element(by.id('Goals_Button_AddAGoal')).tap();
    await element(by.id('GoalEdit_quickDuration_30')).tap();
    await element(by.id('GoalNewModalScreen_ScrollView')).scrollTo('bottom');
    await element(by.id('GoalEdit_category_bullet_rest')).tap();
    await element(by.id('GoalNewModalScreen_Button_Add')).tap();

    await expect(
      element(by.id('NotificationsPermissionsPopin_Button_request')),
    ).not.toBeVisible();
  });
});
