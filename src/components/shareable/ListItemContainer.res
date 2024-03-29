open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = (
  ~children=React.null,
  ~left=React.null,
  ~leftSpace: Spacer.size=Spacer.S,
  ~right=React.null,
  ~rightSpace: Spacer.size=Spacer.S,
  ~style=?,
) => {
  // let theme = Theme.useTheme(AppSettings.useTheme())
  <View
    style={arrayOption([
      Some(Predefined.styles["flexGrow"]),
      Some(Predefined.styles["rowCenter"]),
      // Some(theme.styles["background"]),
      style,
    ])}>
    <Spacer size=leftSpace />
    {left}
    <View style={Predefined.styles["flex"]}>
      <SpacedView vertical=XS horizontal=None style={Predefined.styles["flex"]}>
        <View style={array([Predefined.styles["flexGrow"], Predefined.styles["row"]])}>
          <View style={array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])}>
            {children}
          </View>
          {right}
          <Spacer size=rightSpace />
        </View>
      </SpacedView>
    </View>
  </View>
}
