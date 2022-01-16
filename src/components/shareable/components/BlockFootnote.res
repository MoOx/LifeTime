open ReactNative
open ReactNative.Style

@react.component
let make = (~children) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <BlockFootnoteContainer>
    <Text style={array([Theme.text["footnote"], theme.styles["textOnDarkLight"]])}> children </Text>
  </BlockFootnoteContainer>
}
