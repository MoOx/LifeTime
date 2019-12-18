open ReactNative;
[@react.component]
let make = (~navigation, ~route) => {
  <>
    <StatusBar barStyle=`darkContent />
    <Welcome
      onAboutPrivacyPress={_ =>
        navigation->Navigators.RootStackNavigator.Navigation.navigate(
          "PrivacyModalScreen",
        )
      }
      onContinuePress={_ => ()}
    />
  </>;
};
