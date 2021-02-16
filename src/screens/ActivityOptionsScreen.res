open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (~navigation, ~route: ReactNavigation.Core.route<Navigators.StatsStack.M.params>) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  <>
    <StatusBar
      barStyle={Theme.statusBarStyle(theme.mode, #darkContent)}
      translucent={true}
      backgroundColor="transparent"
    />
    <Animated.ScrollView
      style={Style.array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])}
      showsHorizontalScrollIndicator=false
      showsVerticalScrollIndicator=false>
      {route.params
      ->Option.flatMap(params => params.currentActivityTitle)
      ->Option.map(currentActivityTitle =>
        <ActivityOptions
          activityTitle=currentActivityTitle
          onSkipActivity={() => navigation->Navigators.RootStack.Navigation.goBack()}
        />
      )
      ->Option.getWithDefault(React.null)}
    </Animated.ScrollView>
  </>
}
