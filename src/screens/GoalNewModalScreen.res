open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = (~navigation, ~route: ReactNavigation.Core.route<Navigators.RootStack.M.params>) => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeAreaInsets()
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.))

  let (goal, setGoal) = React.useState(_ => None)
  let handleChange = React.useCallback1(goal => setGoal(_ => goal), [setGoal])

  let (isReadyToSave, disabled, onPress) =
    goal
    ->Option.map(goal => (
      true,
      false,
      _ => {
        navigation->Navigators.RootStack.Navigation.goBack()
        setSettings(settings => {
          ...settings,
          lastUpdated: Js.Date.now(),
          goals: settings.goals->Array.concat([goal]),
        })
      },
    ))
    ->Option.getWithDefault((false, true, _ => ()))

  let mode =
    route.params
    ->Option.flatMap(params => params.newGoalType)
    ->Option.getWithDefault(Goal.Type.Goal->Goal.Type.toSerialized)
  <>
    <StatusBarFormSheet />
    <Animated.ScrollView
      style={array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])}
      contentContainerStyle={viewStyle(
        ~paddingTop=(Theme.isFormSheetSupported ? 0. : safeAreaInsets.top)->dp,
        ~paddingBottom=safeAreaInsets.bottom->dp,
        ~paddingLeft=safeAreaInsets.left->dp,
        ~paddingRight=safeAreaInsets.right->dp,
        (),
      )}
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
                  "y": scrollYAnimatedValue.current,
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
        title="New Goal"
        left={({color}) =>
          <TouchableOpacity
            hitSlop=HitSlops.m onPress={_ => navigation->Navigators.RootStack.Navigation.goBack()}>
            <Text
              allowFontScaling=false
              style={array([Theme.text["body"], Theme.text["weight400"], textStyle(~color, ())])}>
              {"Cancel"->React.string}
            </Text>
          </TouchableOpacity>}
        right={({color}) =>
          <TouchableOpacity hitSlop=HitSlops.m disabled onPress>
            <Text
              allowFontScaling=false
              style={array([
                Theme.text["body"],
                Theme.text["weight600"],
                textStyle(~color=isReadyToSave ? color : theme.colors.gray3, ()),
              ])}>
              {"Add"->React.string}
            </Text>
          </TouchableOpacity>}
      />
      <Spacer size=XL />
      <GoalEdit
        activities=settings.activities
        initialGoal={...Goal.undefined, mode: mode}
        onChange={handleChange}
      />
    </Animated.ScrollView>
  </>
}
