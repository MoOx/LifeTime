open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (~navigation, ~route: ReactNavigation.Core.route<Navigators.StatsStack.M.params>) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let (refreshing, refreshing_set) = React.useState(() => false)
  let onRefresh = React.useCallback1(() => refreshing_set(_ => true), [refreshing_set])
  let onRefreshDone = React.useCallback1(() => refreshing_set(_ => false), [refreshing_set])
  <>
    <StatusBar
      barStyle={Theme.statusBarStyle(theme.mode, #darkContent)}
      backgroundColor={Theme.statusBarColor(theme.mode, #darkContent)}
    />
    <Animated.ScrollView
      style={Style.array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])}
      refreshControl={<RefreshControl
        refreshing
        onRefresh
        tintColor=theme.namedColors.textOnDarkLight
        colors=[theme.namedColors.textOnDarkLight]
      />}
      showsHorizontalScrollIndicator=false
      showsVerticalScrollIndicator=false>
      {route.params
      ->Option.flatMap(params =>
        params.currentActivityTitle->Option.map(currentActivityTitle =>
          <ActivityOptions
            refreshing
            onRefreshDone
            activityTitle=currentActivityTitle
            currentWeek=params.currentWeek
            onSkipActivity={() => navigation->Navigators.RootStack.Navigation.goBack()}
          />
        )
      )
      ->Option.getWithDefault(React.null)}
    </Animated.ScrollView>
  </>
}
