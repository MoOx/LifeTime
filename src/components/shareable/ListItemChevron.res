open ReactNative.Style

@react.component
let make = () => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <SVGChevronright width={14.->dp} height={14.->dp} fill=theme.colors.gray2 />
}
