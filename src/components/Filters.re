open Belt;
open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "container": viewStyle(~flexGrow=1., ()),
      "options": viewStyle(~flexDirection=`row, ~justifyContent=`flexEnd, ()),
      "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
      "infoText": textStyle(~fontSize=12., ~lineHeight=12. *. 1.4, ()),
      "durationText":
        textStyle(~fontSize=12., ~lineHeight=12., ~fontWeight=`_700, ()),
    })
  );

let title = "Filters";

[@react.component]
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let themeStyles = Theme.useStyles();
  let calendars = Calendars.useCalendars();
  let isCalendarButtonHide = settings##calendarsIdsSkipped->Array.length === 0;
  <>
    <View style=Predefined.styles##rowSpaceBetween>
      <Row> <Spacer size=XS /> <BlockHeading text="Calendars" /> </Row>
      <Row>
        {isCalendarButtonHide
           ? <BlockHeadingTouchable
               onPress={_ =>
                 setSettings(_settings =>
                   {
                     // ...settings,
                     "theme": settings##theme,
                     "lastUpdated": Js.Date.now(),
                     "calendarsIdsSkipped":
                       calendars
                       ->Option.map(cs => cs->Array.map(c => c##id))
                       ->Option.getWithDefault([||]),
                     "eventsSkippedOn": settings##eventsSkippedOn,
                     "eventsSkipped": settings##eventsSkipped,
                     "eventsCategories": settings##eventsCategories,
                   }
                 )
               }
               text="Hide All"
             />
           : <BlockHeadingTouchable
               onPress={_ =>
                 setSettings(_settings =>
                   {
                     // ...settings,
                     "theme": settings##theme,
                     "lastUpdated": Js.Date.now(),
                     "calendarsIdsSkipped": [||],
                     "eventsSkippedOn": settings##eventsSkippedOn,
                     "eventsSkipped": settings##eventsSkipped,
                     "eventsCategories": settings##eventsCategories,
                   }
                 )
               }
               text="Show All"
             />}
        <Spacer size=XS />
      </Row>
    </View>
    <View style=themeStyles##background>
      {calendars
       ->Option.map(calendars =>
           calendars
           ->Array.map(calendar =>
               <TouchableOpacity
                 key=calendar##id
                 onPress={_ =>
                   setSettings(settings =>
                     {
                       // ...settings,
                       "theme": settings##theme,
                       "lastUpdated": Js.Date.now(),
                       "calendarsIdsSkipped":
                         {let ids = settings##calendarsIdsSkipped
                          if (ids->Array.some(id => id == calendar##id)) {
                            ids->Array.keep(id => id != calendar##id);
                          } else {
                            ids->Array.concat([|calendar##id|]);
                          }},
                       "eventsSkippedOn": settings##eventsSkippedOn,
                       "eventsSkipped": settings##eventsSkipped,
                       "eventsCategories": settings##eventsCategories,
                     }
                   )
                 }>
                 <Separator style=themeStyles##separatorOnBackground />
                 <SpacedView vertical=XS>
                   <View style=Predefined.styles##rowSpaceBetween>
                     <View>
                       <Text
                         style={Style.list([
                           styles##text,
                           themeStyles##textOnBackground,
                         ])}>
                         {calendar##title->React.string}
                       </Text>
                       <Text
                         style={Style.list([
                           styles##infoText,
                           themeStyles##textGray2,
                         ])}>
                         {calendar##source->React.string}
                       </Text>
                     </View>
                     {
                       let skipped =
                         settings##calendarsIdsSkipped
                         ->Array.some(id => id == calendar##id);
                       if (skipped) {
                         <SVGcircle
                           width={26.->ReactFromSvg.Size.dp}
                           height={26.->ReactFromSvg.Size.dp}
                           fill=calendar##color
                         />;
                       } else {
                         <SVGcheckmarkcircle
                           width={26.->ReactFromSvg.Size.dp}
                           height={26.->ReactFromSvg.Size.dp}
                           fill=calendar##color
                         />;
                       };
                     }
                   </View>
                 </SpacedView>
               </TouchableOpacity>
             )
           ->React.array
         )
       ->Option.getWithDefault(React.null)}
      <Separator style=themeStyles##separatorOnBackground />
    </View>
  </>;
};
