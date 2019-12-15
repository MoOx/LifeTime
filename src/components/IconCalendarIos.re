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
          ~borderColor=Theme.Colors.Ios.light.gray,
          ~borderRadius=Theme.Radius.button,
          (),
        ),
      "text":
        textStyle(
          ~fontSize=9.,
          ~lineHeight=9.,
          ~fontWeight=`_400,
          ~color=Theme.Colors.Ios.light.red,
          (),
        ),
      "number":
        textStyle(
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
  let today = Js.Date.(fromFloat(now()));
  <SpacedView
    horizontal=XXS
    vertical=XXS
    style=Style.(arrayOption([|Some(styles##container), s|]))>
    <Text style=styles##text>
      {switch (today->Js.Date.getDay) {
       | 1. => "Monday"
       | 2. => "Tuesday"
       | 3. => "Wednesday"
       | 4. => "Thursday"
       | 5. => "Friday"
       | 6. => "Saturday"
       | _ => "Sunday"
       }}
      ->React.string
    </Text>
    <Text style=styles##number>
      {today->Js.Date.getDate->Js.Float.toString->React.string}
    </Text>
  </SpacedView>;
};
