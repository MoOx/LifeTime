open ReactNative
open ReactMultiversal

@react.component
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <>
    <StatusBar barStyle=#lightContent backgroundColor=Theme.Colors.dark.backgroundDark />
    <ScrollView
      style={theme.styles["background"]} contentContainerStyle={Predefined.styles["flexGrow"]}>
      <ReactNativeSafeAreaContext.SafeAreaView style={Predefined.styles["flexGrow"]}>
        <Welcome
          onAboutPrivacyPress={_ =>
            navigation->Navigators.RootStack.Navigation.navigate("PrivacyModalScreen")}
          onContinuePress={_ => navigation->Navigators.RootStack.Navigation.goBack()}
        />
      </ReactNativeSafeAreaContext.SafeAreaView>
    </ScrollView>
  </>
}
