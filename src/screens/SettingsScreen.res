open ReactNative
open ReactNative.Style
open ReactMultiversal

let title = "Settings"

@react.component
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeAreaInsets()
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.))
  <>
    <View style={array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])}>
      <StickyHeader
        scrollYAnimatedValue=scrollYAnimatedValue.current
        scrollOffsetY=80.
        safeArea=true
        animateTranslateY=false
        backgroundElement={<StickyHeaderBackground />}
        textStyle={theme.styles["text"]}
        title=SettingsView.title
      />
      <Animated.ScrollView
        testID="SettingsScreen_ScrollView"
        style={array([
          Predefined.styles["flexGrow"],
          viewStyle(
            ~marginTop=safeAreaInsets.top->dp,
            // no bottom, handled by bottom tabs
            ~paddingLeft=safeAreaInsets.left->dp,
            ~paddingRight=safeAreaInsets.right->dp,
            (),
          ),
        ])}
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
        <SettingsView navigation />
      </Animated.ScrollView>
    </View>
  </>
}
