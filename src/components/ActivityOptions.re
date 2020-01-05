open Belt;
open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    })
  );

[@react.component]
let make = (~activity, ~onIgnoreActivity) => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  let themeColors = Theme.useColors();
  let activitySlug = activity->Calendars.slugifyEventTitle;
  let isSkipped = Calendars.isEventSkipped(settings, activity);
  <SpacedView horizontal=None>
    <Row> <Spacer size=S /> <BlockHeading text="Category" /> </Row>
    <View style=themeStyles##background>
      {Calendars.Categories.defaults
       ->List.map(((id, name, colorName, iconName)) => {
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
                   "eventsSkippedOn": settings##eventsSkippedOn,
                   "eventsSkipped": settings##eventsSkipped,
                   "eventsCategories":
                     settings##eventsCategories
                     ->Array.keep(((eventSlug, _c)) =>
                         eventSlug != activitySlug
                       )
                     ->Array.concat([|(activitySlug, id)|]),
                 }
               )
             }>
             <Separator style=themeStyles##separatorOnBackground />
             <SpacedView vertical=XS>
               <View style=Predefined.styles##rowSpaceBetween>
                 <Row style=Predefined.styles##center>
                   <Calendars.Categories.Icon
                     name=iconName
                     width={32.->Style.dp}
                     height={32.->Style.dp}
                     fill=color
                   />
                   <Spacer size=XS />
                   <Text
                     style={Style.list([
                       styles##text,
                       themeStyles##textOnBackground,
                     ])}>
                     name->React.string
                   </Text>
                 </Row>
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
               </View>
             </SpacedView>
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
            "eventsSkippedOn": settings##eventsSkippedOn,
            "eventsSkipped":
              !isSkipped
                ? settings##eventsSkipped->Array.concat([|activitySlug|])
                : settings##eventsSkipped->Array.keep(e => e != activitySlug),
            "eventsCategories": settings##eventsCategories,
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
    <SpacedView horizontal=XS vertical=XXS>
      <Text
        style=Style.(
          list([
            themeStyles##textLightOnBackgroundDark,
            textStyle(~fontSize=12., ()),
          ])
        )>
        (
          !isSkipped
            ? "This will hide similar events from all reports."
            : "This will put back similar events in all reports."
        )
        ->React.string
      </Text>
    </SpacedView>
  </SpacedView>;
};
