open Belt
open ReactNative
open ReactNative.Style
// open ReactMultiversal

open Navigators

module StatsStackScreen = {
  @react.component
  let make = (~navigation as _, ~route as _) => {
    let theme = Theme.useTheme(AppSettings.useTheme())
    <StatsStack.Navigator
      screenOptions={_ =>
        StatsStack.options(
          ~headerTintColor=theme.namedColors.text,
          ~headerStyle={
            backgroundColor: Some(theme.namedColors.background),
            // blurEffect: None,
          },
          (),
        )}>
      <StatsStack.Screen
        name="HomeScreen"
        component=HomeScreen.make
        options={_ => StatsStack.options(~headerShown=false, ())}
      />
      <StatsStack.Screen
        name="ActivityOptionsScreen"
        component=ActivityOptionsScreen.make
        options={screenOptions =>
          StatsStack.options(
            ~title=screenOptions.route.params
            ->Option.flatMap(params => params.currentActivityTitle)
            ->Option.getWithDefault("Activity"),
            (),
          )}
      />
    </StatsStack.Navigator>
  }
}

module GoalsStackScreen = {
  @react.component
  let make = (~navigation as _, ~route as _) => {
    <GoalsStack.Navigator>
      <GoalsStack.Screen
        name="GoalsScreen"
        component=GoalsScreen.make
        options={_ => GoalsStack.options(~headerShown=false, ())}
      />
    </GoalsStack.Navigator>
  }
}

module SettingsStackScreen = {
  @react.component
  let make = (~navigation as _, ~route as _) => {
    let theme = Theme.useTheme(AppSettings.useTheme())
    <SettingsStack.Navigator
      screenOptions={_ =>
        StatsStack.options(
          ~headerTintColor=theme.namedColors.text,
          ~headerStyle={
            backgroundColor: Some(theme.namedColors.background),
            // blurEffect: None,
          },
          (),
        )}>
      <SettingsStack.Screen
        name="SettingsScreen"
        component=SettingsScreen.make
        options={_ => StatsStack.options(~headerShown=false, ~title=SettingsScreen.title, ())}
      />
      <SettingsStack.Screen
        name="SettingsDangerZoneScreen"
        component=SettingsDangerZoneScreen.make
        options={_ => StatsStack.options(~title=SettingsDangerZoneScreen.title, ())}
      />
      <SettingsStack.Screen
        name="SettingsNotificationsScreen"
        component=SettingsNotificationsScreen.make
        options={_ => {
          open StatsStack
          options(~title=SettingsNotificationsScreen.title, ())
        }}
      />
    </SettingsStack.Navigator>
  }
}

module TabsScreen = {
  @react.component
  let make = (~navigation as _, ~route as _) => {
    let theme = Theme.useTheme(AppSettings.useTheme())
    <Tabs.Navigator
      initialRouteName="StatsStack"
      screenOptions={_ =>
        Tabs.options(
          ~tabBarActiveTintColor=theme.colors.blue,
          ~tabBarInactiveTintColor=theme.colors.gray,
          ~tabBarStyle={
            array([theme.styles["background"], viewStyle(~borderTopColor=theme.colors.gray4, ())])
          },
          (),
        )}>
      <Tabs.Screen
        name="StatsStack"
        component=StatsStackScreen.make
        options={_props =>
          Tabs.options(
            ~headerShown=false,
            ~tabBarTestID="tabSummary",
            ~title="Summary",
            ~tabBarIcon=tabBarIconProps =>
              <SVGTimeline
                width={tabBarIconProps.size->Style.dp}
                height={tabBarIconProps.size->Style.dp}
                fill=tabBarIconProps.color
              />,
            (),
          )}
      />
      <Tabs.Screen
        name="GoalsStack"
        component=GoalsStackScreen.make
        options={_props =>
          Tabs.options(
            ~headerShown=false,
            ~tabBarTestID="tabGoals",
            ~title="Goals",
            ~tabBarIcon=tabBarIconProps =>
              <SVGPennant
                width={tabBarIconProps.size->Style.dp}
                height={tabBarIconProps.size->Style.dp}
                fill=tabBarIconProps.color
              />,
            (),
          )}
      />
      <Tabs.Screen
        name="SettingsStack"
        component=SettingsStackScreen.make
        options={_props =>
          Tabs.options(
            ~headerShown=false,
            ~tabBarTestID="tabSettings",
            ~title=SettingsScreen.title,
            ~tabBarIcon=tabBarIconProps =>
              <SVGSettings
                width={tabBarIconProps.size->Style.dp}
                height={tabBarIconProps.size->Style.dp}
                fill=tabBarIconProps.color
              />,
            (),
          )}
      />
    </Tabs.Navigator>
  }
}

module SystemBars = {
  @module("react-native-bars") @react.component
  external make: (
    ~animated: bool=?,
    ~barStyle: [#"light-content" | #"dark-content"]=?,
  ) => React.element = "SystemBars"
}

module RootNavigator = {
  @react.component
  let make = () => {
    // React.useEffect1(() => {
    //   TransparentStatusAndNavigationBar.init()
    //   None
    // }, [])
    let mode = Theme.useTheme(AppSettings.useTheme()).mode
    // React.useEffect1(() => {
    //   // TransparentStatusAndNavigationBar.setBarsStyle(Theme.barsStyle(mode, #darkContent))
    //   None
    // }, [mode])
    let barStyle = Theme.barsStyle(mode, #darkContent)
    <>
      <SystemBars animated={true} barStyle />
      <RootStack.Navigator
        initialRouteName="Tabs"
        screenOptions={_ => RootStack.options(~presentation=#formSheet, ~headerShown=false, ())}>
        <RootStack.Screen name="Tabs" component=TabsScreen.make />
        <RootStack.Screen
          name="WelcomeModalScreen"
          component=WelcomeScreen.make
          options={_ => RootStack.options(~gestureEnabled=false, ())}
        />
        <RootStack.Screen name="PrivacyModalScreen" component=PrivacyModalScreen.make />
        <RootStack.Screen name="FiltersModalScreen" component=FiltersModalScreen.make />
        <RootStack.Screen name="GoalNewModalScreen" component=GoalNewModalScreen.make />
        <RootStack.Screen name="GoalEditModalScreen" component=GoalEditModalScreen.make />
        <RootStack.Screen name="HelpModalScreen" component=HelpModalScreen.make />
      </RootStack.Navigator>
    </>
  }
}
