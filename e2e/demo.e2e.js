export function systemDialog(label) {
  if (device.getPlatform() === 'ios') {
    return element(by.label(label)).atIndex(0);
  }
  return element(by.text(label));
}

describe('LifeTime', () => {
  beforeAll(async () => {
    await device.launchApp({permissions: {calendar: 'YES'}});
    await device.setStatusBar({
      time: '09:41',
      dataNetwork: 'wifi',
      wifiMode: 'active',
      wifiBars: '3',
      cellularMode: 'active',
      cellularBars: '4',
      batteryState: 'charged',
      batteryLevel: '80',
    });
  });

  // beforeEach(async () => {
  //   await device.reloadReactNative();
  // });

  it('should allow be demo ready', async () => {
    await expect(element(by.id('WelcomeContinue'))).toBeVisible();
    await element(by.id('WelcomeContinue')).tap();

    await expect(element(by.id('AllowCalendarsAccess'))).not.toBeVisible();

    await element(by.id('tabSettings')).tap();
    await element(by.id('SettingsScreen_ScrollView')).scrollTo('bottom');
    await element(by.id('DemoDataInject')).tap();
    await systemDialog('Inject').tap();

    await element(by.id('tabSummary')).tap();
    await device.takeScreenshot('01HomeScreen');

    await element(by.id('tabGoals')).tap();
    await device.takeScreenshot('02Goals');

    await element(by.id('Goals_Button_AddAGoal')).tap();
    await device.takeScreenshot('03Goal');
  });
});
