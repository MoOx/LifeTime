open Belt;
open ReactNative;
open ReactMultiversal;

let styles =
  Style.{"text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ())}
  ->StyleSheet.create;

[@react.component]
let make = (~activityTitle, ~onSkipActivity) => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let themeModeKey = AppSettings.useTheme();
  let theme = Theme.useTheme(themeModeKey);
  let isSkipped =
    settings##activitiesSkipped
    ->Array.some(skipped => Activities.isSimilar(skipped, activityTitle));
  <SpacedView horizontal=None>
    <Row> <Spacer size=XS /> <BlockHeading text="Category" /> </Row>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      {ActivityCategories.defaults
       ->List.mapWithIndex((index, (id, name, colorName, iconName)) => {
           let color = ActivityCategories.getColor(theme.mode, colorName);
           <TouchableOpacity
             key=id
             onPress={_ => {
               let createdAt = Js.Date.now();
               setSettings(settings =>
                 {
                   // ...settings,
                   "theme": settings##theme,
                   "lastUpdated": Js.Date.now(),
                   "calendarsIdsSkipped": settings##calendarsIdsSkipped,
                   "activitiesSkippedFlag": settings##activitiesSkippedFlag,
                   "activitiesSkipped": settings##activitiesSkipped,
                   "activities":
                     settings##activities
                     ->Array.keep(acti =>
                         !Activities.isSimilar(acti##title, activityTitle)
                       )
                     ->Array.concat([|
                         {
                           "id": Utils.makeId(activityTitle, createdAt),
                           "title": activityTitle,
                           "createdAt": createdAt,
                           "categoryId": id,
                         },
                       |]),
                   "goals": settings##goals,
                 }
               );
             }}>
             <View style=Predefined.styles##rowCenter>
               <Spacer size=S />
               <SpacedView vertical=XS horizontal=None>
                 <NamedIcon name=iconName fill=color />
               </SpacedView>
               <Spacer size=XS />
               <View style=Predefined.styles##flexGrow>
                 <SpacedView vertical=XS horizontal=None>
                   <View style=Predefined.styles##row>
                     <View style=Predefined.styles##flexGrow>
                       <Text
                         style={Style.list([
                           styles##text,
                           theme.styles##textOnBackground,
                         ])}>
                         name->React.string
                       </Text>
                     </View>
                     {if (id
                          != settings->Calendars.categoryIdFromActivityTitle(
                               activityTitle,
                             )) {
                        <SVGcircle
                          width={26.->ReactFromSvg.Size.dp}
                          height={26.->ReactFromSvg.Size.dp}
                          fill=color
                        />;
                      } else {
                        <SVGcheckmarkcircle
                          width={26.->ReactFromSvg.Size.dp}
                          height={26.->ReactFromSvg.Size.dp}
                          fill=color
                        />;
                      }}
                     <Spacer size=S />
                   </View>
                 </SpacedView>
                 {index !== ActivityCategories.defaults->List.length - 1
                    ? <Separator style=theme.styles##separatorOnBackground />
                    : React.null}
               </View>
             </View>
           </TouchableOpacity>;
         })
       //  <View> <Spacer /> </View>
       ->List.toArray
       ->React.array}
      <Separator style=theme.styles##separatorOnBackground />
    </View>
    <Spacer size=L />
    <TouchableOpacity
      onPress={_ => {
        setSettings(settings => {
          let isSkipped =
            settings##activitiesSkipped
            ->Array.some(skipped =>
                Activities.isSimilar(skipped, activityTitle)
              );
          {
            "theme": settings##theme,
            "lastUpdated": Js.Date.now(),
            "calendarsIdsSkipped": settings##calendarsIdsSkipped,
            "activitiesSkippedFlag": settings##activitiesSkippedFlag,
            "activitiesSkipped":
              !isSkipped
                ? settings##activitiesSkipped
                  ->Array.concat([|activityTitle|])
                : settings##activitiesSkipped
                  ->Array.keep(alreadySkipped =>
                      Activities.isSimilar(alreadySkipped, activityTitle)
                    ),
            "activities": settings##activities,
            "goals": settings##goals,
          };
        });
        onSkipActivity();
      }}>
      <Separator style=theme.styles##separatorOnBackground />
      <SpacedView vertical=XS style=theme.styles##background>
        <Center>
          <Text style=Style.(textStyle(~color=theme.colors.red, ()))>
            (!isSkipped ? "Hide Activity" : "Reveal Activity")->React.string
          </Text>
        </Center>
      </SpacedView>
      <Separator style=theme.styles##separatorOnBackground />
    </TouchableOpacity>
    <BlockFootnote>
      (
        !isSkipped
          ? "This will hide similar activities from all reports."
          : "This will reveal similar activities in all reports."
      )
      ->React.string
    </BlockFootnote>
  </SpacedView>;
};
