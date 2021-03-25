open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (~spaceStart=?) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <Separator
    style={Style.arrayOption([
      Some(theme.styles["separatorOnBackground"]),
      Some(Style.viewStyle(~marginTop=-.StyleSheet.hairlineWidth->Style.dp, ())),
      spaceStart->Option.map(space => Style.viewStyle(~marginStart=space->Style.dp, ())),
    ])}
  />
}
