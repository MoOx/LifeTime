open Belt;
open ReactNative;
open ReactMultiversal;

[@react.component]
let make =
    (
      ~navigation,
      ~route: ReactNavigation.Core.route(Navigators.RootStack.M.params),
    ) => {
  let (_settings, setSettings) = AppSettings.useSettings();
  let theme = Theme.useTheme(AppSettings.useTheme());

  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeArea();
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.));

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
                goals: settings.goals->Array.concat([|goal|]),
              }
            );
            navigation->Navigators.RootStack.Navigation.goBack();
          },
        )
      )
    ->Option.getWithDefault((false, true, _ => ()));

  let type_ =
    route.params
    ->Option.flatMap(params =>
        params.newGoalType->Option.flatMap(t => t->Goal.Type.fromSerialized)
      );
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
        title=GoalNew.title
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
              "Add"->React.string
            </Animated.Text>
          </TouchableOpacity>
        }
      />
      <Spacer size=XL />
      <GoalNew ?type_ onChange={goal => setGoal(_ => goal)} />
    </Animated.ScrollView>
  </>;
};
