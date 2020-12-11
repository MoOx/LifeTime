open Belt
open ReactNative
open ReactMultiversal

@react.component
let make = (~navigation, ~route: ReactNavigation.Core.route<Navigators.RootStack.M.params>) => {
  let (_settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeAreaInsets()
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.))

  let (goal, setGoal) = React.useState(_ => None)

  let (isReadyToSave, disabled, onPress) = goal->Option.map(goal => (
    true,
    false,
    _ => {
      setSettings(settings => {
        ...settings,
        lastUpdated: Js.Date.now(),
        goals: settings.goals->Array.concat([goal]),
      })
      navigation->Navigators.RootStack.Navigation.goBack()
    },
  ))->Option.getWithDefault((false, true, _ => ()))

  let type_ =
    route.params
    ->Option.flatMap(params => params.newGoalType)
    ->Option.getWithDefault(Goal.Type.Goal->Goal.Type.toSerialized)
  <>
    <StatusBar barStyle=#lightContent backgroundColor=Theme.Colors.dark.backgroundDark />
    <NavigationBar backgroundColor=theme.namedColors.backgroundDark />
    <Animated.ScrollView
      style={
        open Style
        array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])
      }
      contentContainerStyle={
        open Style
        viewStyle(
          // no top, handled by modal
          // ~paddingTop=safeAreaInsets.top->dp,
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
        safeArea=false
        animateBackgroundOpacity=False
        backgroundElement={<StickyHeaderBackground />}
        color=theme.colors.blue
        color2=theme.colors.blue
        textStyle={theme.styles["text"]}
        title="New Goal"
        left={({color, defaultStyle}) =>
          <TouchableOpacity onPress={_ => navigation->Navigators.RootStack.Navigation.goBack()}>
            <Animated.Text
              style={
                open Style
                array([defaultStyle, textStyle(~color, ~fontWeight=Theme.fontWeights.regular, ())])
              }>
              {"Cancel"->React.string}
            </Animated.Text>
          </TouchableOpacity>}
        right={({color, defaultStyle}) =>
          <TouchableOpacity disabled onPress>
            <Animated.Text
              style={
                open Style
                array([
                  defaultStyle,
                  textStyle(~color=isReadyToSave ? color : theme.colors.gray3, ()),
                ])
              }>
              {"Add"->React.string}
            </Animated.Text>
          </TouchableOpacity>}
      />
      <Spacer size=XL />
      <GoalEdit
        initialGoal={...Goal.undefined, type_: type_} onChange={goal => setGoal(_ => goal)}
      />
    </Animated.ScrollView>
  </>
}
