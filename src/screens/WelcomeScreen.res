open ReactNative
open ReactMultiversal

@react.component
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <>
    <StatusBar
      barStyle={Theme.formSheetStatusBarStyle(theme.mode, #darkContent)}
      translucent={true}
      backgroundColor={"transparent"}
    />
    <ScrollView
      style={theme.styles["background"]} contentContainerStyle={Predefined.styles["flexGrow"]}>
      <Welcome
        onAboutPrivacyPress={_ =>
          navigation->Navigators.RootStack.Navigation.navigate("PrivacyModalScreen")}
        onContinuePress={_ => navigation->Navigators.RootStack.Navigation.goBack()}
      />
    </ScrollView>
  </>
}
