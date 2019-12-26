open ReactNative;
open ReactNavigation;

let styles =
  Style.(
    StyleSheet.create({
      "container": viewStyle(~flexGrow=1., ~backgroundColor="#fff", ()),
    })
  );

module MainStackScreen = {
  open Navigators;

  [@react.component]
  let make = (~navigation as _, ~route as _) =>
    <MainStack.Navigator headerMode=`none mode=`modal>
      <MainStack.Screen name="HomeScreen" component=HomeScreen.make />
    </MainStack.Navigator>;
};

module RootNavigator = {
  open Navigators;

  [@react.component]
  let make = () => {
    <RootStackNavigator.Navigator
      initialRouteName="MainStack"
      mode=`modal
      headerMode=`none
      screenOptions={_ =>
        RootStackNavigator.options(
          ~gestureEnabled=true,
          ~cardOverlayEnabled=true,
          (),
        )
        ->Stack.mergeOptions(Stack.TransitionPresets.modalPresentationIOS)
      }>
      <RootStackNavigator.Screen
        name="MainStack"
        component=MainStackScreen.make
      />
      <RootStackNavigator.Screen
        name="WelcomeModalScreen"
        component=WelcomeScreen.make
        // disable gesture cause we don't allow people to bypass this screen
        options={_ => RootStackNavigator.options(~gestureEnabled=false, ())}
      />
      <RootStackNavigator.Screen
        name="PrivacyModalScreen"
        component=PrivacyModalScreen.make
      />
      <RootStackNavigator.Screen
        name="FiltersModalScreen"
        component=FiltersModalScreen.make
      />
    </RootStackNavigator.Navigator>;
  };
};

[@react.component]
let app = () => {
  let (settings, setSettings) = AppSettings.useSettings();
  <ReactNativeDarkMode.DarkModeProvider>
    <AppSettings.ContextProvider value=(settings, setSettings)>
      <Native.NavigationNativeContainer>
        <RootNavigator />
      </Native.NavigationNativeContainer>
      <Bootsplash />
      {Global.__DEV__ ? <Dev /> : React.null}
    </AppSettings.ContextProvider>
  </ReactNativeDarkMode.DarkModeProvider>;
};
