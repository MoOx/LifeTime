open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (
  ~center=false,
  ~children,
  ~color=?,
  ~icon=?,
  ~right=?,
  ~onPress=?,
  ~separator=false,
) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let child =
    <View style={theme.styles["background"]}>
      <View style={Predefined.styles["rowCenter"]}>
        <Spacer size=S />
        {icon->Option.map(icon => {
          <View style={Predefined.styles["rowCenter"]}> {icon} <Spacer size=S /> </View>
        })->Option.getWithDefault(React.null)}
        <View style={Predefined.styles["flex"]}>
          <SpacedView vertical=XS horizontal=None>
            <View style={Predefined.styles["row"]}>
              <View
                style={
                  open Style
                  array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
                }>
                <Text
                  style={
                    open Style
                    arrayOption([
                      Some(Theme.text["body"]),
                      Some(theme.styles["text"]),
                      center ? Some(textStyle(~textAlign=#center, ())) : None,
                      color->Option.map(c => textStyle(~color=c, ())),
                    ])
                  }>
                  {children}
                </Text>
              </View>
              {right->Option.map(icon => {
                <View style={Predefined.styles["rowCenter"]}> <Spacer size=S /> {icon} </View>
              })->Option.getWithDefault(React.null)}
              <Spacer size=S />
            </View>
          </SpacedView>
          {separator ? <ListSeparator /> : React.null}
        </View>
      </View>
    </View>

  onPress->Option.map(onPress => {
    <TouchableWithoutFeedback onPress> {child} </TouchableWithoutFeedback>
  })->Option.getWithDefault(child)
}
