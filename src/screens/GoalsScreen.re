open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeArea();
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.));
  <>
    <StatusBar barStyle={theme->Theme.themedStatusBarStyle(`darkContent)} />
    <View
      style=Style.(
        list([Predefined.styles##flexGrow, themeStyles##backgroundDark])
      )>
      <StickyHeader
        scrollYAnimatedValue={scrollYAnimatedValue->React.Ref.current}
        scrollOffsetY=80.
        safeArea=true
        animateTranslateY=false
        animateBackgroundOpacity=`yes
        backgroundElement={<StickyHeaderBackground />}
        textStyle=themeStyles##textOnBackground
        title=Goals.title
      />
      <Animated.ScrollView
        style=Style.(
          list([
            Predefined.styles##flexGrow,
            viewStyle(
              ~marginTop=safeAreaInsets##top->dp,
              // no bottom, handled by bottom tabs
              // ~marginBottom=safeAreaInsets##bottom->dp,
              ~paddingLeft=safeAreaInsets##left->dp,
              ~paddingRight=safeAreaInsets##right->dp,
              (),
            ),
          ])
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
        <Goals
          onNewGoalPress={() =>
            navigation->Navigators.RootStack.Navigation.navigate(
              "GoalNewModalScreen",
            )
          }
          // onEditPress={activity =>
          //   navigation->Navigators.StatsStack.Navigation.navigateWithParams(
          //     "ActivityOptionsScreen",
          //     {"currentActivity": Some(activity)},
          //   )
          // }
        />
      </Animated.ScrollView>
    </View>
  </>;
};
