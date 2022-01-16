open ReactNative
open ReactNative.Style
open ReactMultiversal

let title = "Notifications"

@react.component
let make = (~navigation as _, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let onScrollBeginDrag = React.useCallback0(_ => {
    SwipeableRowEventEmitter.emitter->SwipeableRowEventEmitter.emit(#autoClose(None))
  })
  <ScrollView
    style={array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])}
    onScrollBeginDrag>
    <SettingsNotifications />
  </ScrollView>
}
