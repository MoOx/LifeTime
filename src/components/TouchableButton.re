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

open Theme;
let themedStyles =
  Style.{
    light:
      StyleSheet.create({
        "container": viewStyle(~backgroundColor=Theme.Colors.light.main, ()),
        "text": textStyle(~color=Theme.Colors.light.textOnMain, ()),
      }),
    dark:
      StyleSheet.create({
        "container": viewStyle(~backgroundColor=Theme.Colors.dark.main, ()),
        "text": textStyle(~color=Theme.Colors.dark.textOnMain, ()),
      }),
  };

[@react.component]
let make = (~onPress, ~text, ~styles as s=?) => {
  let dynamicStyles = Hooks.useStyles(themedStyles);
  <TouchableOpacity onPress>
    <SpacedView
      vertical=S
      style=Style.(
        arrayOption([|
          Some(styles##container),
          Some(dynamicStyles##container),
          s,
        |])
      )>
      <Text style=Style.(array([|styles##text, dynamicStyles##text|]))>
        text->React.string
      </Text>
    </SpacedView>
  </TouchableOpacity>;
};
