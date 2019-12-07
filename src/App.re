open ReactNative;

let styles =
  Style.(
    StyleSheet.create({
      "container": style(~flexGrow=1., ~backgroundColor="#fff", ()),
    })
  );

[@react.component]
let app = () => {
  <>
    // let windowDimensions = Dimensions.useWindowDimensions();
    <StatusBar barStyle=`darkContent />
    <SafeAreaView style=styles##container />
  </>;
};
