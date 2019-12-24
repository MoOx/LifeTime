open ReactNative;

[@react.component]
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let theme = settings##theme->AppSettings.themeStringToTheme;

  <View
    style=Style.(
      style(~position=`absolute, ~bottom=20.->dp, ~right=20.->dp, ())
    )>
    {switch (theme) {
     | `light =>
       <Text
         onPress={_ =>
           setSettings(settings =>
             {
               "theme": "dark",
               "lastUpdated": settings##lastUpdated,
               "calendarsIdsSkipped": settings##calendarsIdsSkipped,
             }
           )
         }>
         {j|🌕|j}->React.string
       </Text>
     | `dark =>
       <Text
         onPress={_ =>
           setSettings(settings =>
             {
               "theme": "auto",
               "lastUpdated": settings##lastUpdated,
               "calendarsIdsSkipped": settings##calendarsIdsSkipped,
             }
           )
         }>
         {j|🌑|j}->React.string
       </Text>
     | `auto =>
       <Text
         onPress={_ =>
           setSettings(settings =>
             {
               "theme": "light",
               "lastUpdated": settings##lastUpdated,
               "calendarsIdsSkipped": settings##calendarsIdsSkipped,
             }
           )
         }>
         {j|🌓|j}->React.string
       </Text>
     }}
  </View>;
};
