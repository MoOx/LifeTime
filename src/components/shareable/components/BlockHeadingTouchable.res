open ReactNative

@react.component
let make = (~onPress, ~text) => {
  let theme = Theme.useTheme(AppSettings.useTheme())

  <TouchableOpacity onPress>
    <BlockHeading text style={theme.styles["textButton"]} />
  </TouchableOpacity>
}
