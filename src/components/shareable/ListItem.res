open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (~children, ~disabled=?, ~left=?, ~onPress=?, ~right=?, ~separator=false, ~style=?) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let child =
    <ListItemContainer
      ?style
      left=?{left->Option.map(left => {
        <Row.Center> {left} <Spacer size=S /> </Row.Center>
      })}
      right=?{right->Option.map(right => {
        <Row.Center> <Spacer size=S /> {right} </Row.Center>
      })}
      separator>
      {children}
    </ListItemContainer>

  onPress
  ->Option.map(onPress => {
    <Pressable_
      ?disabled
      onPress
      style={({pressed}) =>
        Platform.os === Platform.ios
          ? !pressed ? theme.styles["background"] : theme.styles["backgroundGray5"]
          : theme.styles["background"]}
      android_ripple={Pressable_.rippleConfig(~color=theme.colors.gray4, ())}>
      {_ => child}
    </Pressable_>
  })
  ->Option.getWithDefault(<View style={theme.styles["background"]}> {child} </View>)
}
