open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "container":
        viewStyle(
          ~justifyContent=`center,
          ~alignItems=`center,
          ~borderRadius=Theme.Radius.button,
          (),
        ),
      "text":
        textStyle(~fontSize=18., ~lineHeight=18., ~fontWeight=`_600, ()),
    })
  );

[@react.component]
let make = (~onPress, ~text, ~styles as s=?) => {
  let themeStyles = Theme.useStyles();

  <TouchableOpacity onPress>
    <SpacedView
      vertical=S
      style=Style.(
        arrayOption([|
          Some(styles##container),
          Some(themeStyles##backgroundMain),
          s,
        |])
      )>
      <Text style=Style.(array([|styles##text, themeStyles##textOnMain|]))>
        text->React.string
      </Text>
    </SpacedView>
  </TouchableOpacity>;
};
