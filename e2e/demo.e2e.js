export function systemDialog(label) {
  if (device.getPlatform() === 'ios') {
    return element(by.label(label)).atIndex(0);
  }
  return element(by.text(label));
}

export const goBack = async () => {
  // await element(by.id("header-back")).tap();

  if (device.getPlatform() === 'android') {
    await device.pressBack();
  } else {
    await element(by.traits(['button']))
      .atIndex(0)
      .tap();
    // await element(by.id('containerView')).swipe('right', 'fast', 0.1);
  }
};

const categoriseActivity = async (activity, cat) => {
  const id = 'TopActivities_' + activity;
  await waitFor(element(by.id(id)))
    .toBeVisible()
    .whileElement(by.id('HomeScreen_ScrollView'))
    .scroll(50, 'down');
  await element(by.id(id)).tap();
  await element(by.id('ActivityOption_Category_' + cat)).tap();
  await goBack();
};

describe('LifeTime', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: {
        calendar: 'YES',
        notifications: 'YES',
      },
    });
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

  it('should be demo ready', async () => {
    await expect(element(by.id('WelcomeContinue'))).toBeVisible();
    await element(by.id('WelcomeContinue')).tap();

    await expect(element(by.id('AllowCalendarsAccess'))).not.toBeVisible();

    // or use "Home_DemoFullRefresh" ?
    await element(by.id('tabSettings')).tap();
    await element(by.id('SettingsScreen_ScrollView')).scrollTo('bottom');
    await element(by.id('Settings_To_SettingsDangerZoneScreen')).tap();
    await element(by.id('SettingsDangerZone_CalendarInject')).tap();
    await systemDialog('Inject').tap();
    await goBack();

    await element(by.id('tabSummary')).tap();

    await element(by.id('HomeScreen_ScrollView')).swipe('down', 'slow');

    await waitFor(element(by.id('TopActivities_Sleep')))
      .toBeVisible()
      .withTimeout(4000);

    // prepare categories
    await element(by.id('Home_ScrollView_WeeklyGraph')).swipe('right', 'slow');

    await categoriseActivity('Sleep', 'rest');
    await categoriseActivity('Work', 'work');
    await categoriseActivity('Dinner', 'food');
    await categoriseActivity('Lunch', 'food');
    await categoriseActivity('Meditation', 'self');
    await categoriseActivity('Appointment with dentist', 'self');
    await categoriseActivity('Evening with Jane & John', 'social');
    await categoriseActivity('CrossFit', 'exercise');

    // doesn't work because of the custom sticky header
    // await element(by.id('HomeScreen_ScrollView')).scrollTo('top');
    await waitFor(element(by.id('Home_TitlePre')))
      .toBeVisible()
      .whileElement(by.id('HomeScreen_ScrollView'))
      .scroll(100, 'up', NaN, 0.5);
    // await element(by.id('HomeScreen_ScrollView')).scroll(1000, 'up', NaN, 0.5);

    await device.takeScreenshot('01HomeScreen');

    await element(by.id('tabGoals')).tap();

    await element(by.id('Goals_Button_AddAGoal')).tap();
    await element(by.id('GoalEdit_title')).typeText('Sleep');
    await element(by.id('GoalEdit_title')).tapReturnKey();
    // https://github.com/callstack/react-native-slider/issues/351
    // await element(by.id('GoalEdit_durationSlider')).adjustSliderToPosition(
    //   1 / 3,
    // );
    await element(by.id('GoalEdit_durationSlider')).swipe(
      'right',
      'slow',
      0.25,
      0,
    );
    await element(by.id('GoalNewModalScreen_ScrollView')).scrollTo('bottom');
    await element(by.id('GoalEdit_category_bullet_rest')).tap();
    await element(by.id('GoalNewModalScreen_Button_Add')).tap();

    await element(by.id('Goals_Button_AddAGoal')).tap();
    await element(by.id('GoalEdit_title')).typeText('Workout');
    await element(by.id('GoalEdit_title')).tapReturnKey();
    await element(by.id('GoalEdit_quickDuration_30')).tap();
    await element(by.id('GoalNewModalScreen_ScrollView')).scrollTo('bottom');
    await element(by.id('GoalEdit_category_bullet_exercise')).tap();
    await element(by.id('GoalNewModalScreen_Button_Add')).tap();

    await element(by.id('Goals_Button_AddAGoal')).tap();
    await element(by.id('GoalEdit_title')).typeText("Don't Play Too Much");
    await element(by.id('GoalEdit_title')).tapReturnKey();
    await element(by.id('GoalEdit_type_limit')).tap();
    await element(by.id('GoalEdit_quickDuration_60')).tap();
    await element(by.id('GoalNewModalScreen_ScrollView')).scrollTo('bottom');
    await element(by.id('GoalEdit_category_bullet_fun')).tap();
    await element(by.id('GoalNewModalScreen_Button_Add')).tap();

    await device.takeScreenshot('02Goals');

    await element(by.id('Goals_Button_AddAGoal')).tap();
    await device.takeScreenshot('03Goal');
  });
});
