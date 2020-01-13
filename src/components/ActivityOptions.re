open Belt;
open ReactNative;
open ReactMultiversal;

let styles =
  Style.{"text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ())}
  ->StyleSheet.create;

[@react.component]
let make = (~activity, ~onIgnoreActivity) => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  let themeColors = Theme.useColors();
  let simplifiedActivityTitle =
    activity->Calendars.simplifyEventTitleForComparison;
  let isSkipped = Calendars.isEventSkipped(settings, activity);
  <SpacedView horizontal=None>
    <Row> <Spacer size=XS /> <BlockHeading text="Category" /> </Row>
    <Separator style=themeStyles##separatorOnBackground />
    <View style=themeStyles##background>
      {Calendars.Categories.defaults
       ->List.mapWithIndex((index, (id, name, colorName, iconName)) => {
           let color = theme->Calendars.Categories.getColor(colorName);
           <TouchableOpacity
             key=id
             onPress={_ =>
               setSettings(settings =>
                 {
                   // ...settings,
                   "theme": settings##theme,
                   "lastUpdated": Js.Date.now(),
                   "calendarsIdsSkipped": settings##calendarsIdsSkipped,
                   "activitiesSkippedFlag": settings##activitiesSkippedFlag,
                   "activitiesSkipped": settings##activitiesSkipped,
                   "activitiesCategories":
                     settings##activitiesCategories
                     ->Array.keep(((event, _c)) =>
                         event->Calendars.simplifyEventTitleForComparison
                         != simplifiedActivityTitle
                       )
                     ->Array.concat([|(simplifiedActivityTitle, id)|]),
                 }
               )
             }>
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
                           themeStyles##textOnBackground,
                         ])}>
                         name->React.string
                       </Text>
                     </View>
                     {if (id
                          != settings->Calendars.categoryIdFromEventTitle(
                               activity,
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
                 {index !== Calendars.Categories.defaults->List.length - 1
                    ? <Separator style=themeStyles##separatorOnBackground />
                    : React.null}
               </View>
             </View>
           </TouchableOpacity>;
         })
       //  <View> <Spacer /> </View>
       ->List.toArray
       ->React.array}
      <Separator style=themeStyles##separatorOnBackground />
    </View>
    <Spacer size=L />
    <TouchableOpacity
      onPress={_ => {
        setSettings(settings => {
          let isSkipped = Calendars.isEventSkipped(settings, activity);
          {
            "theme": settings##theme,
            "lastUpdated": Js.Date.now(),
            "calendarsIdsSkipped": settings##calendarsIdsSkipped,
            "activitiesSkippedFlag": settings##activitiesSkippedFlag,
            "activitiesSkipped":
              !isSkipped
                ? settings##activitiesSkipped->Array.concat([|activity|])
                : settings##activitiesSkipped->Array.keep(e => e != activity),
            "activitiesCategories": settings##activitiesCategories,
          };
        });
        onIgnoreActivity();
      }}>
      <Separator style=themeStyles##separatorOnBackground />
      <SpacedView vertical=XS style=themeStyles##background>
        <Center>
          <Text style=Style.(textStyle(~color=themeColors.red, ()))>
            (!isSkipped ? "Ignore" : "Stop Ignore")->React.string
          </Text>
        </Center>
      </SpacedView>
      <Separator style=themeStyles##separatorOnBackground />
    </TouchableOpacity>
    <BlockFootnote>
      (
        !isSkipped
          ? "This will hide similar events from all reports."
          : "This will put back similar events in all reports."
      )
      ->React.string
    </BlockFootnote>
  </SpacedView>;
};
