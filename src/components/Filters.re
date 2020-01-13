open Belt;
open ReactNative;
open ReactMultiversal;

let styles =
  Style.{
    "container": viewStyle(~flexGrow=1., ()),
    "options": viewStyle(~flexDirection=`row, ~justifyContent=`flexEnd, ()),
    "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    "infoText": textStyle(~fontSize=12., ~lineHeight=12. *. 1.4, ()),
    "durationText":
      textStyle(~fontSize=12., ~lineHeight=12., ~fontWeight=`_700, ()),
  }
  ->StyleSheet.create;

let title = "Filters";

[@react.component]
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let theme = Theme.useTheme(AppSettings.useTheme());
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
                     "activitiesSkippedFlag": settings##activitiesSkippedFlag,
                     "activitiesSkipped": settings##activitiesSkipped,
                     "activities": settings##activities,
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
                     "activitiesSkippedFlag": settings##activitiesSkippedFlag,
                     "activitiesSkipped": settings##activitiesSkipped,
                     "activities": settings##activities,
                   }
                 )
               }
               text="Show All"
             />}
        <Spacer size=XS />
      </Row>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      {calendars
       ->Option.map(calendars =>
           calendars
           ->Array.mapWithIndex((index, calendar) =>
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
                       "activitiesSkippedFlag":
                         settings##activitiesSkippedFlag,
                       "activitiesSkipped": settings##activitiesSkipped,
                       "activities": settings##activities,
                     }
                   )
                 }>
                 <View style=Predefined.styles##row>
                   <Spacer size=S />
                   <View style=Predefined.styles##flexGrow>
                     <SpacedView
                       vertical=XS
                       horizontal=None
                       style=Predefined.styles##rowCenter>
                       <View style=Predefined.styles##flexGrow>
                         <Text
                           style={Style.list([
                             styles##text,
                             theme.styles##textOnBackground,
                           ])}>
                           {calendar##title->React.string}
                         </Text>
                         <Text
                           style={Style.list([
                             styles##infoText,
                             theme.styles##textGray2,
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
                       <Spacer size=S />
                     </SpacedView>
                     {index !== calendars->Array.length - 1
                        ? <Separator
                            style=theme.styles##separatorOnBackground
                          />
                        : React.null}
                   </View>
                 </View>
               </TouchableOpacity>
             )
           ->React.array
         )
       ->Option.getWithDefault(React.null)}
      <Separator style=theme.styles##separatorOnBackground />
    </View>
  </>;
};
