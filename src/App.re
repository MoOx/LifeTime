open Belt;
open ReactNative;
open ReactMultiversal;
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
  let make = (~navigation as _, ~route as _) => {
    let themedStyle = Theme.useStyles();
    let themedColors = Theme.useColors();
    <MainStack.Navigator
      screenOptions={_ => Stack.TransitionPresets.slideFromRightIOS}>
      <MainStack.Screen
        name="HomeScreen"
        component=HomeScreen.make
        options={_ => MainStack.options(~headerShown=false, ())}
      />
      <MainStack.Screen
        name="ActivityOptionsScreen"
        component=ActivityOptionsScreen.make
        options={screenOptions =>
          MainStack.options(
            ~title=
              screenOptions##route##params
              ->Option.flatMap(params => params##currentActivity)
              ->Option.getWithDefault("Activity"),
            ~headerBackTitle="Back",
            ~headerTitleContainerStyle=
              Style.(
                viewStyle(~paddingHorizontal=(Spacer.space *. 3.)->dp, ())
              ),
            ~headerStyle=
              Style.(
                list([
                  themedStyle##background,
                  viewStyle(
                    ~borderBottomColor=themedColors.gray4,
                    ~shadowColor=themedColors.gray4,
                    (),
                  ),
                ])
              ),
            ~headerTitleStyle=themedStyle##textOnBackground,
            ~headerTintColor=themedColors.blue,
            (),
          )
        }
      />
    </MainStack.Navigator>;
  };
};

module RootNavigator = {
  open Navigators;

  [@react.component]
  let make = () => {
    <RootStack.Navigator
      initialRouteName="MainStack"
      mode=`modal
      headerMode=`none
      screenOptions={_ =>
        RootStack.options(~gestureEnabled=true, ~cardOverlayEnabled=true, ())
        ->Stack.mergeOptions(Stack.TransitionPresets.modalPresentationIOS)
      }>
      <RootStack.Screen name="MainStack" component=MainStackScreen.make />
      <RootStack.Screen
        name="WelcomeModalScreen"
        component=WelcomeScreen.make
        // disable gesture cause we don't allow people to bypass this screen
        options={_ => RootStack.options(~gestureEnabled=false, ())}
      />
      <RootStack.Screen
        name="PrivacyModalScreen"
        component=PrivacyModalScreen.make
      />
      <RootStack.Screen
        name="FiltersModalScreen"
        component=FiltersModalScreen.make
      />
    </RootStack.Navigator>;
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
