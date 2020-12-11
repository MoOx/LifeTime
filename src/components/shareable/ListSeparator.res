open ReactMultiversal

@react.component
let make = () => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <Separator style={theme.styles["separatorOnBackground"]} />
}
