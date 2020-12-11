open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (
  ~onPress,
  ~icon=?,
  ~separator=false,
  ~children,
  ~color=?,
  ~iconRight=?,
  ~center=false,
) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <View style={theme.styles["background"]}>
    <TouchableWithoutFeedback onPress>
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
                      Some(theme.styles["textOnBackground"]),
                      center ? Some(textStyle(~textAlign=#center, ())) : None,
                      color->Option.map(c => textStyle(~color=c, ())),
                    ])
                  }>
                  {children}
                </Text>
              </View>
              {iconRight->Option.map(icon => {
                <View style={Predefined.styles["rowCenter"]}> <Spacer size=S /> {icon} </View>
              })->Option.getWithDefault(React.null)}
              <Spacer size=S />
            </View>
          </SpacedView>
          {separator ? <Separator style={theme.styles["separatorOnBackground"]} /> : React.null}
        </View>
      </View>
    </TouchableWithoutFeedback>
  </View>
}
