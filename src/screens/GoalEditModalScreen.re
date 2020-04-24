open Belt;
open ReactNative;
open ReactMultiversal;

[@react.component]
let make =
    (
      ~navigation,
      ~route: ReactNavigation.Core.route(Navigators.RootStack.M.params),
    ) => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let theme = Theme.useTheme(AppSettings.useTheme());

  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeArea();
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.));

  let goalId =
    route.params
    ->Option.flatMap(params => params.goalId)
    // default to dumb string, as we this id only to filter existing goal when we edit it
    ->Option.getWithDefault("");
  let initialGoal =
    settings.goals->Array.keep(goal => goal.id == goalId)[0]
    ->Option.getWithDefault(Goal.undefined);
  Js.log2("settings.goals", settings.goals);
  Js.log2("goalId", goalId);
  Js.log2("initialGoal", initialGoal);

  let (goal, setGoal) = React.useState(_ => None);

  let (isReadyToSave, disabled, onPress) =
    goal
    ->Option.map(goal =>
        (
          true,
          false,
          _ => {
            setSettings(settings =>
              {
                ...settings,
                lastUpdated: Js.Date.now(),
                goals:
                  settings.goals
                  // we replace the goal at the same place
                  ->Array.map(existingGoal =>
                      existingGoal.id != goalId ? existingGoal : goal
                    ),
              }
            );
            navigation->Navigators.RootStack.Navigation.goBack();
          },
        )
      )
    ->Option.getWithDefault((false, true, _ => ()));

  <>
    <StatusBar barStyle=`lightContent />
    <Animated.ScrollView
      style=Style.(
        list([Predefined.styles##flexGrow, theme.styles##backgroundDark])
      )
      contentContainerStyle=Style.(
        viewStyle(
          // no top, handled by modal
          // ~paddingTop=safeAreaInsets##top->dp,
          ~paddingBottom=safeAreaInsets##bottom->dp,
          ~paddingLeft=safeAreaInsets##left->dp,
          ~paddingRight=safeAreaInsets##right->dp,
          (),
        )
      )
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
        safeArea=false
        backgroundElement={<StickyHeaderBackground />}
        color={theme.colors.blue}
        color2={theme.colors.blue}
        textStyle=theme.styles##textOnBackground
        title=GoalEdit.title
        left={({color, defaultStyle}) =>
          <TouchableOpacity
            onPress={_ => navigation->Navigators.RootStack.Navigation.goBack()}>
            <Animated.Text
              style=Style.(
                array([|
                  defaultStyle,
                  textStyle(
                    ~color,
                    ~fontWeight=Theme.fontWeights.regular,
                    (),
                  ),
                |])
              )>
              "Cancel"->React.string
            </Animated.Text>
          </TouchableOpacity>
        }
        right={({color, defaultStyle}) =>
          <TouchableOpacity disabled onPress>
            <Animated.Text
              style=Style.(
                array([|
                  defaultStyle,
                  textStyle(
                    ~color=isReadyToSave ? color : theme.colors.gray3,
                    (),
                  ),
                |])
              )>
              "Save"->React.string
            </Animated.Text>
          </TouchableOpacity>
        }
      />
      <Spacer size=XL />
      <GoalEdit initialGoal onChange={goal => setGoal(_ => goal)} />
    </Animated.ScrollView>
  </>;
};