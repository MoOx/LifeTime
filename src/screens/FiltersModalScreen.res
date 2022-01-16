open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let safeAreaInsets = ReactNativeSafeAreaContext.useSafeAreaInsets()
  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.))
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
        title=Filters.title
        right={({color}) =>
          <TouchableOpacity
            hitSlop=HitSlops.m onPress={_ => navigation->Navigators.RootStack.Navigation.goBack()}>
            <Text
              allowFontScaling=false
              style={array([Theme.text["body"], Theme.text["weight600"], style(~color, ())])}>
              {"Done"->React.string}
            </Text>
          </TouchableOpacity>}
      />
      <Spacer size=XL />
      <Filters />
    </Animated.ScrollView>
  </>
}
