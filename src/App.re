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
  let make = (~navigation, ~route) =>
    <MainStack.Navigator headerMode=`none>
      <MainStack.Screen name="WelcomeScreen" component=WelcomeScreen.make />
    </MainStack.Navigator>;
};

module RootNavigator = {
  open Navigators;

  [@react.component]
  let make = () =>
    <RootStackNavigator.Navigator
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
        name="PrivacyModalScreen"
        component=PrivacyModalScreen.make
      />
    </RootStackNavigator.Navigator>;
};

[@react.component]
let app = () => {
  <>
    <Native.NavigationNativeContainer>
      <RootNavigator />
    </Native.NavigationNativeContainer>
    <Bootsplash />
  </>;
};
