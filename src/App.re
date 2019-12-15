open ReactNative;

let styles =
  Style.(
    StyleSheet.create({
      "container": viewStyle(~flexGrow=1., ~backgroundColor="#fff", ()),
    })
  );

[@react.component]
let app = () => {
  <> <StatusBar barStyle=`darkContent /> <Welcome /> <Bootsplash /> </>;
};
