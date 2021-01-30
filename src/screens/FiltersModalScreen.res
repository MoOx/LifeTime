open ReactNative
open ReactMultiversal

@react.component
let make = (~navigation, ~route as _) => {
  let theme = Theme.useTheme(AppSettings.useTheme())

  let scrollYAnimatedValue = React.useRef(Animated.Value.create(0.))
  <>
    <StatusBar barStyle=#lightContent backgroundColor=Theme.Colors.dark.backgroundDark />
    <NavigationBar backgroundColor=theme.namedColors.backgroundDark />
    <Animated.ScrollView
      style={Style.array([Predefined.styles["flexGrow"], theme.styles["backgroundDark"]])}
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
        title=Filters.title
        right={({color}) =>
          <TouchableOpacity onPress={_ => navigation->Navigators.RootStack.Navigation.goBack()}>
            <Text
              allowFontScaling=false
              style={
                open Style
                array([Theme.text["body"], Theme.text["weight600"], style(~color, ())])
              }>
              {"Done"->React.string}
            </Text>
          </TouchableOpacity>}
      />
      <Spacer size=XL />
      <Filters />
    </Animated.ScrollView>
  </>
}
