open ReactNative;

[@react.component]
let make = (~onPress, ~text) => {
  let themeStyles = Theme.useStyles();

  <TouchableOpacity onPress>
    <BlockHeading text style=themeStyles##textButton />
  </TouchableOpacity>;
};
