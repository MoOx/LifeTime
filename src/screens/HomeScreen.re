open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme());
  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeAreaInsets();

  let (hasCalendarAccess, hasCalendarAccess_set) = React.useState(() => true);
  React.useEffect1(
    () => {
      ReactNativePermissions.(
        check(Ios.calendars)
        ->FutureJs.fromPromise(error => Js.log(error))
        ->Future.tapOk(status =>
            if (status != granted) {
              hasCalendarAccess_set(_ => false);
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
        array([|Predefined.styles##flexGrow, theme.styles##backgroundDark|])
      )>
      <StickyHeader
        scrollYAnimatedValue={scrollYAnimatedValue.current}
        scrollOffsetY=80.
        safeArea=true
        animateTranslateY=false
        backgroundElement={<StickyHeaderBackground />}
        textStyle=theme.styles##textOnBackground
        title=Home.title
      />
      <Animated.ScrollView
        style=Style.(
          array([|
            Predefined.styles##flexGrow,
            viewStyle(
              ~marginTop=safeAreaInsets.top->dp,
              // no bottom, handled by bottom tabs
              ~paddingLeft=safeAreaInsets.left->dp,
              ~paddingRight=safeAreaInsets.right->dp,
              (),
            ),
          |])
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
                    y: scrollYAnimatedValue.current,
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
          onGetStarted={() =>
            navigation->Navigators.RootStack.Navigation.navigate(
              "HelpModalScreen",
            )
          }
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
    {hasCalendarAccess == false
       ? <View
           style=Style.(
             style(
               ~position=`absolute,
               ~top=0.->dp,
               ~bottom=0.->dp,
               ~left=0.->dp,
               ~right=0.->dp,
               ~backgroundColor="rgba(0,0,0,0.2)",
               ~justifyContent=`flexEnd,
               (),
             )
           )>
           <SpacedView>
             <CalendarsPermissions
               onAboutPrivacyPress={_ =>
                 navigation->Navigators.RootStack.Navigation.navigate(
                   "PrivacyModalScreen",
                 )
               }
               onContinuePress={_ => {
                 ReactNativeCalendarEvents.requestPermissions()
                 ->FutureJs.fromPromise(error => {
                     // @todo error!
                     Js.log(error);
                     error;
                   })
                 ->Future.tapOk(status =>
                     switch (
                       status->ReactNativeCalendarEvents.authorizationStatusFromJs
                     ) {
                     | `authorized => hasCalendarAccess_set(_ => true)
                     | `denied
                     | `restricted
                     | `undetermined =>
                       Alert.alert(
                         ~title=
                           "You need to allow LifeTime to access your calendars",
                         ~message=
                           "LifeTime app cannot work without any source of activities. Please adjust app Settings & allow calendars access.",
                         ~buttons=[|
                           Alert.button(
                             ~text="Cancel",
                             ~style=`destructive,
                             (),
                           ),
                           Alert.button(
                             ~text="Open Settings",
                             ~style=`default,
                             ~onPress=
                               () =>
                                 ReactNativePermissions.openSettings()->ignore,
                             (),
                           ),
                         |],
                         (),
                       )
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
                 ->ignore
               }}
             />
           </SpacedView>
         </View>
       : React.null}
  </>;
};
