open Belt
open ReactNative
open ReactNative.Style

let styles = {
  "textCenter": Style.textStyle(~textAlign=#center, ()),
}->StyleSheet.create

@react.component
let make = (~center=false, ~children, ~color=?, ~style=?, ~numberOfLines=?) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <Text
    ?numberOfLines
    style={arrayOption([
      Some(Theme.text["body"]),
      Some(theme.styles["text"]),
      center ? Some(styles["textCenter"]) : None,
      color->Option.map(c => Style.textStyle(~color=c, ())),
      style,
    ])}>
    {children}
  </Text>
}
