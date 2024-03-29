open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (~children, ~disabled=?, ~left=?, ~onPress=?, ~right=?, ~style=?, ~testID=?) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let child =
    <ListItemContainer
      ?style
      left=?{left->Option.map(left => {
        <Row.Center> {left} <Spacer size=S /> </Row.Center>
      })}
      right=?{right->Option.map(right => {
        <Row.Center> <Spacer size=S /> {right} </Row.Center>
      })}>
      {children}
    </ListItemContainer>

  onPress
  ->Option.map(onPress => {
    <Pressable
      ?testID
      ?disabled
      onPress
      style={({pressed}) =>
        Platform.os === Platform.ios
          ? !pressed ? theme.styles["background"] : theme.styles["backgroundGray5"]
          : theme.styles["background"]}
      android_ripple={Pressable.rippleConfig(~color=theme.colors.gray4, ())}>
      {_ => child}
    </Pressable>
  })
  ->Option.getWithDefault(<View ?testID style={theme.styles["background"]}> {child} </View>)
}
