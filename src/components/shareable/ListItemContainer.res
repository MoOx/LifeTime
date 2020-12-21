open ReactNative
open ReactMultiversal

@react.component
let make = (
  ~children=React.null,
  ~left=React.null,
  ~right=React.null,
  ~leftSpace: Spacer.size=Spacer.S,
  ~rightSpace: Spacer.size=Spacer.S,
  ~separator=false,
) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <View style={theme.styles["background"]}>
    <View style={Predefined.styles["rowCenter"]}>
      <Spacer size=leftSpace />
      {left}
      <View style={Predefined.styles["flex"]}>
        <SpacedView vertical=XS horizontal=None>
          <View style={Predefined.styles["row"]}>
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
  </View>
}
