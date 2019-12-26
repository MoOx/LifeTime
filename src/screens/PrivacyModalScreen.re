open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  let themeColors = Theme.useColors();
  let backgroundElement =
    <>
      <View
        style=Style.(
          list([
            StyleSheet.absoluteFill,
            themeStyles##background,
            style(~opacity=0.8, ()),
          ])
        )
      />
      <BlurView
        nativeBlurType={
          switch (theme) {
          | `dark => `dark
          | `light => `light
          }
        }
        style=StyleSheet.absoluteFill
      />
    </>;

  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.));
  <>
    <StatusBar barStyle=`lightContent />
    <Animated.ScrollView
      style={Style.list([
        Predefined.styles##flexGrow,
        themeStyles##background,
      ])}
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
        scrollOffsetY=120.
        safeArea=false
        animateBackgroundOpacity=`yes
        backgroundElement
        color={themeColors.blue}
        color2={themeColors.blue}
        textStyle=themeStyles##textOnBackground
        title=Privacy.title
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
        rightAlwaysVisible=true
      />
      <Privacy />
    </Animated.ScrollView>
  </>;
};
