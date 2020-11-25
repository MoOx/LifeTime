open ReactNative
open ReactMultiversal

@react.component
let make = (~text, ~style as s=?) => {
  let theme = Theme.useTheme(AppSettings.useTheme())

  <SpacedView horizontal=XXS vertical=XXS>
    <Text
      style={Style.arrayOption([Some(Theme.text["footnote"]), Some(theme.styles["textGray"]), s])}>
      {text->Js.String.toUpperCase->React.string}
    </Text>
  </SpacedView>
}
