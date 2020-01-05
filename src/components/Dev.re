open ReactNative;
open ReactMultiversal;

[@react.component]
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let theme = settings##theme->AppSettings.themeStringToTheme;
  let themeStyles = Theme.useStyles();

  <View
    style=Style.(
      viewStyle(
        ~position=`absolute,
        ~bottom=10.->dp,
        ~right=10.->dp,
        ~flexDirection=`row,
        (),
      )
    )>
    <TouchableOpacity
      onPress={_ => ReactNativePermissions.openSettings()->ignore}>
      <SpacedView horizontal=S>
        <Text style=themeStyles##textOnBackground>
          {j|⚙️|j}->React.string
        </Text>
      </SpacedView>
    </TouchableOpacity>
    {switch (theme) {
     | `light =>
       <TouchableOpacity
         onPress={_ =>
           setSettings(settings =>
             {
               "theme": "dark",
               "lastUpdated": Js.Date.now(),
               "calendarsIdsSkipped": settings##calendarsIdsSkipped,
               "eventsSkippedOn": settings##eventsSkippedOn,
               "eventsSkipped": settings##eventsSkipped,
               "eventsCategories": settings##eventsCategories,
             }
           )
         }>
         <SpacedView horizontal=S>
           <Text> {j|🌕|j}->React.string </Text>
         </SpacedView>
       </TouchableOpacity>
     | `dark =>
       <TouchableOpacity
         onPress={_ =>
           setSettings(settings =>
             {
               "theme": "auto",
               "lastUpdated": Js.Date.now(),
               "calendarsIdsSkipped": settings##calendarsIdsSkipped,
               "eventsSkippedOn": settings##eventsSkippedOn,
               "eventsSkipped": settings##eventsSkipped,
               "eventsCategories": settings##eventsCategories,
             }
           )
         }>
         <SpacedView horizontal=S>
           <Text> {j|🌑|j}->React.string </Text>
         </SpacedView>
       </TouchableOpacity>
     | `auto =>
       <TouchableOpacity
         onPress={_ =>
           setSettings(settings =>
             {
               "theme": "light",
               "lastUpdated": Js.Date.now(),
               "calendarsIdsSkipped": settings##calendarsIdsSkipped,
               "eventsSkippedOn": settings##eventsSkippedOn,
               "eventsSkipped": settings##eventsSkipped,
               "eventsCategories": settings##eventsCategories,
             }
           )
         }>
         <SpacedView horizontal=S>
           <Text> {j|🌓|j}->React.string </Text>
         </SpacedView>
       </TouchableOpacity>
     }}
  </View>;
};
