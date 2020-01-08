open Belt;
open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route) => {
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  <>
    <StatusBar barStyle={theme->Theme.themedStatusBarStyle(`darkContent)} />
    <Animated.ScrollView
      style={Style.list([
        Predefined.styles##flexGrow,
        themeStyles##backgroundDark,
      ])}
      showsHorizontalScrollIndicator=false
      showsVerticalScrollIndicator=false>
      <SettingsView />
    </Animated.ScrollView>
  </>;
};
