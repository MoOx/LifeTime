open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~text, ~style as s=?) => {
  let themeStyles = Theme.useStyles();

  <SpacedView horizontal=XXS vertical=XXS>
    <Text
      style={Style.arrayOption([|
        Some(Theme.text##footnote),
        Some(themeStyles##textGray),
        s,
      |])}>
      {text->Js.String.toUpperCase->React.string}
    </Text>
  </SpacedView>;
};
