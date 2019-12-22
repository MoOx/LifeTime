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
      // <StickyHeader
      //   scrollYAnimatedValue={scrollYAnimatedValue->React.Ref.current}
      //   scrollOffsetY=120.
      //   safeArea=false
      //   animateBackgroundOpacity=`yes
      //   backgroundElement
      //   color={Predefined.Colors.Ios.light.blue}
      //   color2={Predefined.Colors.Ios.light.blue}
      //   title=Home.title
      // />

        <Home
          onFiltersPress={() => ()}
        />
      </Animated.ScrollView>
  </>;
};
