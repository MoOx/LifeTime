open ReactNative;

[@react.component]
let make = (~href, ~children) => {
  <Text onPress={_ => Linking.openURL(href)->ignore}> children </Text>;
};
