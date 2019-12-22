open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "container":
        viewStyle(
          //   ~justifyContent=`center,
          ~alignItems=`center,
          ~borderWidth=StyleSheet.hairlineWidth,
          ~borderColor=Predefined.Colors.Ios.light.gray,
          ~borderRadius=Theme.Radius.button,
          (),
        ),
      "text":
        textStyle(
          ~fontSize=6.,
          ~lineHeight=8.,
          ~fontWeight=`_400,
          ~textAlign=`center,
          ~color=Predefined.Colors.Ios.light.red,
          (),
        ),
      "number":
        textStyle(
          ~textAlign=`center,
          ~fontSize=30.,
          ~lineHeight=30.,
          ~fontWeight=`_300,
          ~paddingTop=2.->dp,
          (),
        ),
    })
  );

[@react.component]
let make = (~style as s=?) => {
  let today = Date.now();
  <SpacedView
    horizontal=XXS
    vertical=XXS
    style=Style.(arrayOption([|Some(styles##container), s|]))>
    <Text style=styles##text> {today->Date.dayLongString->React.string} </Text>
    <Text style=styles##number> {today->Date.dateString->React.string} </Text>
  </SpacedView>;
};
