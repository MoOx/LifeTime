open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  // let themeColors = Theme.useColors();
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
  React.useEffect1(
    () => {
      open ReactNativePermissions;
      check(Ios.calendars)
      ->FutureJs.fromPromise(error => Js.log(error))
      ->Future.tapOk(status =>
          if (status != granted) {
            // lazy load just a bit to get a nicer visual effect
            // (otherwise navigation is kind of TOO QUICK)
            Js.Global.setTimeout(
              () =>
                navigation->Navigators.RootStackNavigator.Navigation.navigate(
                  "WelcomeModalScreen",
                ),
              100,
            )
            ->ignore;
            ();
          }
        )
      ->Future.tapError(_err =>
          Alert.alert(
            ~title="Ooops, something bad happened",
            ~message=
              "Please report us this error with informations about your device so we can improve LifeTime.",
            (),
          )
        )
      ->ignore;
      None;
    },
    [||],
  );

  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.));
  <>
    <StatusBar barStyle=`darkContent />
    <Animated.ScrollView
      style={Style.list([
        Predefined.styles##flexGrow,
        themeStyles##backgroundDark,
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
        safeArea=true
        animateBackgroundOpacity=`yes
        backgroundElement
        textStyle=themeStyles##textOnBackground
        title=Home.title
      />
      <ReactNativeSafeAreaContext.SafeAreaView
        style=Predefined.styles##flexGrow>
        <Home
          onFiltersPress={() =>
            navigation->Navigators.RootStackNavigator.Navigation.navigate(
              "FiltersModalScreen",
            )
          }
        />
      </ReactNativeSafeAreaContext.SafeAreaView>
    </Animated.ScrollView>
  </>;
};
