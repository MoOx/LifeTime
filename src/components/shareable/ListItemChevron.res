open ReactNative

@react.component
let make = () => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <SVGChevronright width={14.->Style.dp} height={14.->Style.dp} fill=theme.colors.gray2 />
}
