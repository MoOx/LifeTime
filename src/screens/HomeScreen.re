open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme());
  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeArea();

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
                navigation->Navigators.RootStack.Navigation.navigate(
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

  let (refreshing, setRefreshing) = React.useState(() => false);

  let onRefresh =
    React.useCallback2(
      () => setRefreshing(_ => true),
      (refreshing, setRefreshing),
    );

  let onRefreshDone =
    React.useCallback2(
      () => setRefreshing(_ => false),
      (refreshing, setRefreshing),
    );

  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.));
  <>
    <StatusBar barStyle={Theme.statusBarStyle(theme.mode, `darkContent)} />
    <View
      style=Style.(
        list([Predefined.styles##flexGrow, theme.styles##backgroundDark])
      )>
      <StickyHeader
        scrollYAnimatedValue={scrollYAnimatedValue->React.Ref.current}
        scrollOffsetY=80.
        safeArea=true
        animateTranslateY=false
        animateBackgroundOpacity=`yes
        backgroundElement={<StickyHeaderBackground />}
        textStyle=theme.styles##textOnBackground
        title=Home.title
      />
      <Animated.ScrollView
        style=Style.(
          list([
            Predefined.styles##flexGrow,
            viewStyle(
              ~marginTop=safeAreaInsets##top->dp,
              // no bottom, handled by bottom tabs
              ~paddingLeft=safeAreaInsets##left->dp,
              ~paddingRight=safeAreaInsets##right->dp,
              (),
            ),
          ])
        )
        refreshControl={
          <RefreshControl
            refreshing
            onRefresh
            tintColor={theme.namedColors.textLightOnBackgroundDark}
            colors=[|theme.namedColors.textLightOnBackgroundDark|]
          />
        }
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
        <Home
          refreshing
          onRefreshDone
          onFiltersPress={() =>
            navigation->Navigators.RootStack.Navigation.navigate(
              "FiltersModalScreen",
            )
          }
          onActivityPress={activity =>
            navigation->Navigators.StatsStack.Navigation.navigateWithParams(
              "ActivityOptionsScreen",
              {currentActivityTitle: Some(activity)},
            )
          }
        />
      </Animated.ScrollView>
    </View>
  </>;
};
