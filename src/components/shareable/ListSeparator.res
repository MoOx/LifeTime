open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = (~spaceStart=?) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <Separator
    style={arrayOption([
      Some(theme.styles["separatorOnBackground"]),
      Some(Style.viewStyle(~marginTop=-.StyleSheet.hairlineWidth->dp, ())),
      spaceStart->Option.map(space => Style.viewStyle(~marginStart=space->dp, ())),
    ])}
  />
}
