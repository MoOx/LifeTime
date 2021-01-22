open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {
    "container": viewStyle(
      ~paddingTop=4.->dp,
      ~justifyContent=#center,
      ~alignItems=#center,
      ~borderWidth=StyleSheet.hairlineWidth,
      ~borderColor=Predefined.Colors.Ios.light.gray,
      ~backgroundColor="#fff",
      ~borderRadius=Theme.Radius.button,
      (),
    ),
    "text": textStyle(
      ~fontSize=9.,
      ~lineHeight=9.,
      ~fontWeight=#_700,
      ~textAlign=#center,
      ~paddingBottom=2.->dp,
      ~color=Predefined.Colors.Ios.light.red,
      (),
    ),
    "number": textStyle(~textAlign=#center, ~fontSize=28., ~lineHeight=28., ~fontWeight=#_300, ()),
  }
}->StyleSheet.create

@react.component
let make = (~style as s=?) => {
  let today = Date.now()
  <View
    style={
      open Style
      arrayOption([Some(styles["container"]), s])
    }>
    <Text style={styles["text"]} numberOfLines=1 adjustsFontSizeToFit=true>
      {today->Js.Date.getDay->Date.dayShortString->Js.String2.toUpperCase->React.string}
    </Text>
    <Text style={styles["number"]} numberOfLines=1 adjustsFontSizeToFit=true>
      {today->Date.dateString->React.string}
    </Text>
  </View>
}
