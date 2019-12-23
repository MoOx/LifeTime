open ReactNative;
open ReactMultiversal;

let backgroundElement =
  <>
    <View
      style=Style.(
        array([|
          StyleSheet.absoluteFill,
          style(~backgroundColor="rgba(255,255,255,0.8)", ()),
        |])
      )
    />
    <BlurView nativeBlurType=`light style=StyleSheet.absoluteFill />
  </>;

[@react.component]
let make = (~navigation, ~route) => {
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.));
  <>
    <StatusBar barStyle=`lightContent />
    <Animated.ScrollView
      style=Predefined.styles##flexGrow
      showsHorizontalScrollIndicator=false
      showsVerticalScrollIndicator=false
      scrollEventThrottle=16
      onScroll=Animated.(
        event1(
          [|
            {
              "nativeEvent": {
                "contentOffset": {
                  y: scrollYAnimatedValue->React.Ref.current,
                },
              },
            },
          |],
          eventOptions(~useNativeDriver=true, ()),
        )
      )>
      <StickyHeader
        scrollYAnimatedValue={scrollYAnimatedValue->React.Ref.current}
        // scrollOffsetY=0.
        safeArea=false
        backgroundElement
        // animateBackgroundOpacity=`yes
        color={Predefined.Colors.Ios.light.blue}
        color2={Predefined.Colors.Ios.light.blue}
        title=Filters.title
        right={({color, defaultStyle}) =>
          <TouchableOpacity
            onPress={_ =>
              navigation->Navigators.RootStackNavigator.Navigation.goBack()
            }>
            <Text style=Style.(array([|defaultStyle, style(~color, ())|]))>
              "Done"->React.string
            </Text>
          </TouchableOpacity>
        }
        // rightAlwaysVisible=true
      />
      <Spacer size=XL />
      <Filters />
    </Animated.ScrollView>
  </>;
};
