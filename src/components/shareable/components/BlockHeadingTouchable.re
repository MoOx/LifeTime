open ReactNative;

[@react.component]
let make = (~onPress, ~text) => {
  let dynamicStyles = Theme.useStyles();

  <TouchableOpacity onPress>
    <BlockHeading text style=dynamicStyles##textButton />
  </TouchableOpacity>;
};
