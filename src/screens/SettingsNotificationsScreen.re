open ReactNative;
open ReactMultiversal;

let title = "Notifications";

[@react.component]
let make = (~navigation as _, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme());
  <ScrollView
    style=Style.(
      array([|Predefined.styles##flexGrow, theme.styles##backgroundDark|])
    )>
    <SettingsNotifications />
  </ScrollView>;
};
