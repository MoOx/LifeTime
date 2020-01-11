open ReactNative;

[@react.component]
let make = (~children) => {
  let themeStyles = Theme.useStyles();
  <BlockFootnoteContainer>
    <Text
      style=Style.(
        list([Theme.text##footnote, themeStyles##textLightOnBackgroundDark])
      )>
      children
    </Text>
  </BlockFootnoteContainer>;
};
