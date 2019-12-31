open Belt;
open ReactNative;
open ReactMultiversal;

[@react.component]
let make = (~navigation, ~route) => {
  let (_settings, setSettings) = React.useContext(AppSettings.context);
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
      {route##params
       ->Option.flatMap(params => params##currentActivity)
       ->Option.map(currentActivity =>
           <ActivityOptions
             activity=currentActivity
             onIgnoreActivity={activity => {
               setSettings(settings =>
                 {
                   "theme": settings##theme,
                   "lastUpdated": settings##lastUpdated,
                   "calendarsIdsSkipped": settings##calendarsIdsSkipped,
                   "eventsSkipped":
                     settings##eventsSkipped->Array.concat([|activity|]),
                 }
               );
               navigation->Navigators.RootStack.Navigation.goBack();
             }}
           />
         )
       ->Option.getWithDefault(React.null)}
    </Animated.ScrollView>
  </>;
};
