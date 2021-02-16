open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (~navigation, ~route: ReactNavigation.Core.route<Navigators.RootStack.M.params>) => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeAreaInsets()
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.))

  let goalId = route.params
  ->Option.flatMap(params => params.goalId)
  // default to dumb string, as we this id only to filter existing goal when we edit it
  ->Option.getWithDefault("")
  let initialGoal =
    (settings.goals->Array.keep(goal => goal.id == goalId))[0]->Option.getWithDefault(
      Goal.undefined,
    )

  let (goal, setGoal) = React.useState(_ => None)
  let handleChange = React.useCallback1(goal => setGoal(_ => goal), [setGoal])
  let handleDelete = React.useCallback3(() => {
    setSettings(settings => {
      ...settings,
      goals: settings.goals->Array.keep(goal => goal.id != initialGoal.id),
    })
    navigation->Navigators.RootStack.Navigation.goBack()
  }, (setSettings, navigation, initialGoal.id))

  let (isReadyToSave, disabled, onPress) = goal->Option.map(goal => (
    true,
    false,
    _ => {
      setSettings(settings => {
        ...settings,
        lastUpdated: Js.Date.now(),
        goals: settings.goals->Array.map(existingGoal =>
          // we replace the goal at the same place
          existingGoal.id != goalId ? existingGoal : goal
        ),
      })
      navigation->Navigators.RootStack.Navigation.goBack()
    },
  ))->Option.getWithDefault((false, true, _ => ()))

  <>
    <StatusBar
      barStyle={Theme.formSheetStatusBarStyle(theme.mode, #darkContent)}
      translucent={true}
      backgroundColor="transparent"
    />
    <NavigationBar backgroundColor=theme.namedColors.backgroundDark />
    <Animated.ScrollView
      style={
        open Style
        array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])
      }
      contentContainerStyle={
        open Style
        viewStyle(
          ~paddingTop=(Theme.isFormSheetSupported ? 0. : safeAreaInsets.top)->dp,
          ~paddingBottom=safeAreaInsets.bottom->dp,
          ~paddingLeft=safeAreaInsets.left->dp,
          ~paddingRight=safeAreaInsets.right->dp,
          (),
        )
      }
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
      <StickyHeader
        scrollYAnimatedValue=scrollYAnimatedValue.current
        safeArea={Theme.formSheetSafeArea}
        animateBackgroundOpacity=False
        backgroundElement={<StickyHeaderBackground />}
        color=theme.colors.blue
        color2=theme.colors.blue
        textStyle={theme.styles["text"]}
        title=GoalEdit.title
        left={({color}) =>
          <TouchableOpacity onPress={_ => navigation->Navigators.RootStack.Navigation.goBack()}>
            <Animated.Text
              style={
                open Style
                array([Theme.text["body"], Theme.text["weight400"], textStyle(~color, ())])
              }>
              {"Cancel"->React.string}
            </Animated.Text>
          </TouchableOpacity>}
        right={({color}) =>
          <TouchableOpacity disabled onPress>
            <Animated.Text
              allowFontScaling=false
              style={
                open Style
                array([
                  Theme.text["body"],
                  Theme.text["weight600"],
                  textStyle(~color=isReadyToSave ? color : theme.colors.gray3, ()),
                ])
              }>
              {"Save"->React.string}
            </Animated.Text>
          </TouchableOpacity>}
      />
      <Spacer size=XL />
      <GoalEdit initialGoal onChange={handleChange} onDelete={handleDelete} />
    </Animated.ScrollView>
  </>
}
