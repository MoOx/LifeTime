open ReactNative;
open ReactMultiversal;

let styles =
  Style.{
    "container":
      viewStyle(
        ~alignItems=`center,
        ~borderWidth=StyleSheet.hairlineWidth,
        ~borderColor=Predefined.Colors.Ios.light.gray,
        ~backgroundColor="#fff",
        ~borderRadius=Theme.Radius.button,
        (),
      ),
    "text":
      textStyle(
        ~fontSize=8.,
        ~lineHeight=8.,
        ~fontWeight=`_400,
        ~textAlign=`center,
        ~color=Predefined.Colors.Ios.light.red,
        (),
      ),
    "number":
      textStyle(
        ~textAlign=`center,
        ~fontSize=28.,
        ~lineHeight=28.,
        ~fontWeight=`_300,
        ~paddingTop=2.->dp,
        (),
      ),
  }
  ->StyleSheet.create;

[@react.component]
let make = (~style as s=?) => {
  let today = Date.now();
  <SpacedView
    horizontal=XXS
    vertical=XXS
    style=Style.(arrayOption([|Some(styles##container), s|]))>
    <Text style=styles##text numberOfLines=1 adjustsFontSizeToFit=true>
      {today->Js.Date.getDay->Date.dayLongString->React.string}
    </Text>
    <Text style=styles##number numberOfLines=1 adjustsFontSizeToFit=true>
      {today->Date.dateString->React.string}
    </Text>
  </SpacedView>;
};
