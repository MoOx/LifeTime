/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Converted from https://github.com/facebook/react-native/blob/724fe11472cb874ce89657b2c3e7842feff04205/template/App.js
 * With a few tweaks
 */
open ReactNative;

type reactNativeNewAppScreenColors = {
  .
  "primary": string,
  "white": string,
  "lighter": string,
  "light": string,
  "black": string,
  "dark": string,
};

[@bs.module "./NewAppScreen/Colors"]
external colors: reactNativeNewAppScreenColors = "default";

[@bs.module "./NewAppScreen/openURLInBrowser"]
external openURLInBrowser: string => unit = "default";

module Header = {
  [@react.component] [@bs.module "./NewAppScreen/Header"]
  external make: _ => React.element = "default";
};
module ReloadInstructions = {
  [@react.component] [@bs.module "./NewAppScreen/ReloadInstructions"]
  external make: _ => React.element = "default";
};
module LearnMoreLinks = {
  [@react.component] [@bs.module "./NewAppScreen/LearnMoreLinks"]
  external make: _ => React.element = "default";
};
module DebugInstructions = {
  [@react.component] [@bs.module "./NewAppScreen/DebugInstructions"]
  external make: _ => React.element = "default";
};

/*
 Here is StyleSheet that is using Style module to define styles for your components
 The main different with JavaScript components you may encounter in React Native
 is the fact that they **must** be defined before being referenced
 (so before actual component definitions)
 More at https://reasonml-community.github.io/reason-react-native/en/docs/apis/Style/
 */
let styles =
  Style.(
    StyleSheet.create({
      "scrollView": style(~backgroundColor=colors##lighter, ()),
      "engine": style(~position=`absolute, ~right=0.->dp, ()),
      "sectionContainer":
        style(~marginTop=32.->dp, ~paddingHorizontal=24.->dp, ()),
      "sectionTitle":
        style(~fontSize=24., ~fontWeight=`_600, ~color=colors##black, ()),
      "sectionDescription":
        style(
          ~marginTop=8.->dp,
          ~fontSize=18.,
          ~fontWeight=`_400,
          ~color=colors##dark,
          (),
        ),
      "highlight": style(~fontWeight=`_700, ()),
      "footer":
        style(
          ~color=colors##dark,
          ~fontSize=12.,
          ~fontWeight=`_600,
          ~padding=4.->dp,
          ~paddingRight=12.->dp,
          ~textAlign=`right,
          (),
        ),
    })
  );

[@react.component]
let app = () => {
  let windowDimensions = Dimensions.useWindowDimensions();
  <>
    <StatusBar barStyle=`darkContent />
    <SafeAreaView>
      <ScrollView
        horizontal=true
        pagingEnabled=true
        contentInsetAdjustmentBehavior=`automatic
        style={styles##scrollView}>
        <View
          style=Style.(
            array([|
              styles##sectionContainer,
              style(~width=windowDimensions##width->dp, ()),
            |])
          )>
          <Header />
        </View>
        <View
          style=Style.(
            array([|
              styles##sectionContainer,
              style(~width=windowDimensions##width->dp, ()),
            |])
          )>
          <Text style={styles##sectionTitle}> "Step One"->React.string </Text>
          <Text style={styles##sectionDescription}>
            "Edit "->React.string
            <Text style={styles##highlight}> "src/App.re"->React.string </Text>
            " to change this screen and then come back to see your edits."
            ->React.string
          </Text>
          <Text style={styles##sectionTitle}>
            "See Your Changes"->React.string
          </Text>
          <Text style={styles##sectionDescription}>
            <ReloadInstructions />
          </Text>
          <Text style={styles##sectionTitle}> "Debug"->React.string </Text>
          <Text style={styles##sectionDescription}>
            <DebugInstructions />
          </Text>
        </View>
        <View
          style=Style.(
            array([|
              styles##sectionContainer,
              style(~width=windowDimensions##width->dp, ()),
            |])
          )>
          <Text style={styles##sectionTitle}>
            "Learn More"->React.string
          </Text>
          <Text style={styles##sectionDescription}>
            "Read the docs to discover what to do next:"->React.string
          </Text>
          <Text style={styles##sectionDescription}>
            <Text style={styles##highlight}>
              "Reason React Native"->React.string
            </Text>
          </Text>
          <TouchableOpacity
            onPress={_ =>
              openURLInBrowser(
                "https://reasonml-community.github.io/reason-react-native/en/docs/",
              )
            }>
            <Text
              style=Style.(
                style(
                  ~marginTop=8.->dp,
                  ~fontSize=18.,
                  ~fontWeight=`_400,
                  ~color=colors##primary,
                  (),
                )
              )>
              "https://reasonml-community.github.io/\nreason-react-native/"
              ->React.string
            </Text>
          </TouchableOpacity>
          <Text style={styles##sectionDescription}>
            <Text style={styles##highlight}>
              "React Native"->React.string
            </Text>
          </Text>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
    //  )}
    //    </View>
    //      <Text style={styles##footer}>Engine: Hermes</Text>
    //    <View style={styles##engine}>
    //  {Global.hermesInternal == null ? null : (
  </>;
};
