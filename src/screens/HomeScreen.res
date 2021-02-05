open ReactNative
open ReactMultiversal

@react.component
let make = (~navigation, ~route as _) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())
  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeAreaInsets()

  let (hasCalendarAccess, hasCalendarAccess_set) = React.useState(() => true)
  React.useEffect3(() => {
    open ReactNativeCalendarEvents
    checkPermissions(true)
    ->FutureJs.fromPromise(error => Js.log(("[LifeTime] HomeScreen: checkPermissions", error)))
    ->Future.tapOk(status => {
      // Js.log(("[LifeTime] HomeScreen: checkPermissions status", status))
      if status != #authorized {
        hasCalendarAccess_set(_ => false)
        if settings.lastUpdated === 0. {
          // lazy load just a bit to get a nicer visual effect
          // (otherwise navigation is kind of TOO QUICK)
          Js.Global.setTimeout(
            () => navigation->Navigators.RootStack.Navigation.navigate("WelcomeModalScreen"),
            100,
          )->ignore
        }
      }
    })
    ->Future.tapError(_err =>
      Alert.alert(
        ~title="Ooops, something bad happened",
        ~message="Please report us this error with informations about your device so we can improve LifeTime.",
        (),
      )
    )
    ->ignore
    None
  }, (hasCalendarAccess_set, navigation, settings.lastUpdated))

  let (refreshing, refreshing_set) = React.useState(() => false)
  let onRefresh = React.useCallback1(() => refreshing_set(_ => true), [refreshing_set])
  let onRefreshDone = React.useCallback1(() => refreshing_set(_ => false), [refreshing_set])

  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.))
  <>
    <StatusBar
      barStyle={Theme.statusBarStyle(theme.mode, #darkContent)}
      backgroundColor={Theme.statusBarColor(theme.mode, #darkContent)}
    />
    <View
      style={
        open Style
        array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])
      }>
      <StickyHeader
        scrollYAnimatedValue=scrollYAnimatedValue.current
        scrollOffsetY=80.
        safeArea=true
        animateTranslateY=false
        backgroundElement={<StickyHeaderBackground />}
        textStyle={theme.styles["text"]}
        title=Home.title
      />
      <Animated.ScrollView
        style={
          open Style
          array([
            Predefined.styles["flexGrow"],
            viewStyle(
              ~marginTop=safeAreaInsets.top->dp,
              // no bottom, handled by bottom tabs
              ~paddingLeft=safeAreaInsets.left->dp,
              ~paddingRight=safeAreaInsets.right->dp,
              (),
            ),
          ])
        }
        refreshControl={<RefreshControl
          refreshing
          onRefresh
          tintColor=theme.namedColors.textOnDarkLight
          colors=[theme.namedColors.textOnDarkLight]
        />}
        showsHorizontalScrollIndicator=false
        showsVerticalScrollIndicator=false
        scrollEventThrottle=16
        onScroll={
          open Animated
          event1(
            [
              {
                "nativeEvent": {
                  "contentOffset": {
                    y: scrollYAnimatedValue.current,
                  },
                },
              },
            ],
            eventOptions(~useNativeDriver=true, ()),
          )
        }>
        <Home
          refreshing
          onRefreshDone
          onGetStarted={() =>
            navigation->Navigators.RootStack.Navigation.navigate("HelpModalScreen")}
          onFiltersPress={() =>
            navigation->Navigators.RootStack.Navigation.navigate("FiltersModalScreen")}
          onActivityPress={activity =>
            navigation->Navigators.StatsStack.Navigation.navigateWithParams(
              "ActivityOptionsScreen",
              {currentActivityTitle: Some(activity)},
            )}
        />
      </Animated.ScrollView>
    </View>
    {hasCalendarAccess == false
      ? <View
          style={
            open Style
            style(
              ~paddingTop=safeAreaInsets.top->dp,
              ~position=#absolute,
              ~top=0.->dp,
              ~bottom=0.->dp,
              ~left=0.->dp,
              ~right=0.->dp,
              ~backgroundColor="rgba(0,0,0,0.2)",
              ~justifyContent=#flexEnd,
              (),
            )
          }>
          <SpacedView vertical=S horizontal=S style={Predefined.styles["flexShrink"]}>
            <CalendarsPermissions
              onAboutPrivacyPress={_ =>
                navigation->Navigators.RootStack.Navigation.navigate("PrivacyModalScreen")}
              onContinuePress={_ =>
                ReactNativeCalendarEvents.requestPermissions()->FutureJs.fromPromise(error => {
                  // @todo error!
                  Js.log(("[LifeTime] HomeScreen: onContinuePress", error))
                  error
                })->Future.tapOk(status => {
                  Js.log(("[LifeTime] HomeScreen: onContinuePress new status", status))
                  switch status {
                  | #authorized => hasCalendarAccess_set(_ => true)
                  | #denied
                  | #restricted
                  | #undetermined =>
                    Alert.alert(
                      ~title="You need to allow LifeTime to access your calendars",
                      ~message="LifeTime app cannot work without any source of activities. Please adjust app Settings & allow calendars access.",
                      ~buttons=[
                        Alert.button(~text="Cancel", ~style=#destructive, ()),
                        Alert.button(
                          ~text="Open Settings",
                          ~style=#default,
                          ~onPress=() => ReactNativePermissions.openSettings()->ignore,
                          (),
                        ),
                      ],
                      (),
                    )
                  }
                })->Future.tapError(_err =>
                  Alert.alert(
                    ~title="Ooops, something bad happened",
                    ~message="Please report us this error with informations about your device so we can improve LifeTime.",
                    (),
                  )
                )->ignore}
            />
          </SpacedView>
        </View>
      : React.null}
  </>
}
