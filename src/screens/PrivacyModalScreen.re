open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme());

  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.));
  <>
    <StatusBar barStyle={Theme.statusBarStyle(theme.mode, `lightContent)} />
    <Animated.ScrollView
      style={Style.array([|
        Predefined.styles##flexGrow,
        theme.styles##background,
      |])}
      showsHorizontalScrollIndicator=false
      showsVerticalScrollIndicator=false
      scrollEventThrottle=16
      onScroll=Animated.(
        event1(
          [|
            {
              "nativeEvent": {
                "contentOffset": {
                  y: scrollYAnimatedValue.current,
                },
              },
            },
          |],
          eventOptions(~useNativeDriver=true, ()),
        )
      )>
      <StickyHeader
        scrollYAnimatedValue={scrollYAnimatedValue.current}
        scrollOffsetY=120.
        safeArea=false
        backgroundElement={<StickyHeaderBackground />}
        color={theme.colors.blue}
        color2={theme.colors.blue}
        textStyle=theme.styles##textOnBackground
        title=Privacy.title
        right={({color, defaultStyle}) =>
          <TouchableOpacity
            onPress={_ => navigation->Navigators.RootStack.Navigation.goBack()}>
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
