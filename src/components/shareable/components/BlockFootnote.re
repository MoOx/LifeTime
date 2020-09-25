open ReactNative;

[@react.component]
let make = (~children) => {
  let theme = Theme.useTheme(AppSettings.useTheme());
  <BlockFootnoteContainer>
    <Text
      style=Style.(
        array([|
          Theme.text##footnote,
          theme.styles##textLightOnBackgroundDark,
        |])
      )>
      children
    </Text>
  </BlockFootnoteContainer>;
};
