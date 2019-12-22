open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "text": textStyle(~fontSize=12., ~lineHeight=12. *. 1.4, ()),
    })
  );

[@react.component]
let make = (~text, ~style as s=?) => {
  let dynamicStyles = Theme.useStyles();

  <SpacedView horizontal=XXS vertical=XXS>
    <Text
      style={Style.arrayOption([|
        Some(styles##text),
        Some(dynamicStyles##textGray),
        s,
      |])}>
      {text->Js.String.toUpperCase->React.string}
    </Text>
  </SpacedView>;
};
