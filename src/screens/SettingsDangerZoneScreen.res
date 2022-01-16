open ReactNative
open ReactNative.Style
open ReactMultiversal

let title = "Reset"

@react.component
let make = (~navigation as _, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <ScrollView style={array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])}>
    <SettingsDangerZone />
  </ScrollView>
}
