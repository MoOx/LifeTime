open ReactNative
open ReactMultiversal

@react.component
let make = (
  ~children=React.null,
  ~left=React.null,
  ~leftSpace: Spacer.size=Spacer.S,
  ~right=React.null,
  ~rightSpace: Spacer.size=Spacer.S,
  ~separator=false,
  ~style=?,
) => {
  // let theme = Theme.useTheme(AppSettings.useTheme())
  <View
    style={Style.arrayOption([
      Some(Predefined.styles["flexGrow"]),
      Some(Predefined.styles["rowCenter"]),
      // Some(theme.styles["background"]),
      style,
    ])}>
    <Spacer size=leftSpace />
    {left}
    <View style={Predefined.styles["flex"]}>
      <SpacedView vertical=XS horizontal=None style={Predefined.styles["flex"]}>
        <View style={Style.array([Predefined.styles["flexGrow"], Predefined.styles["row"]])}>
          <View
            style={
              open Style
              array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
            }>
            {children}
          </View>
          {right}
          <Spacer size=rightSpace />
        </View>
      </SpacedView>
      {separator ? <ListSeparator /> : React.null}
    </View>
  </View>
}
