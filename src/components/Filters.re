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
  let dynamicStyles = Theme.useStyles();
  let calendars = Calendars.useCalendars();
  let (settings, setSettings) = AppSettings.useSettings(None);
  let isCalendarButtonHide =
    settings.filters.calendarsIdsSkipped->Array.length === 0;
  <>
    <View style=Predefined.styles##rowSpaceBetween>
      <Row> <Spacer size=S /> <BlockHeading text="Calendars" /> </Row>
      <Row>
        {isCalendarButtonHide
           ? <BlockHeadingTouchable
               onPress={_ =>
                 setSettings(_settings =>
                   {
                     // ...settings,
                     lastUpdated: Js.Date.now(),
                     filters:
                       // ...settings.filters,
                       {
                         calendarsIdsSkipped:
                           calendars
                           ->Option.map(cs => cs->Array.map(c => c##id))
                           ->Option.getWithDefault([||]),
                       },
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
                     lastUpdated: Js.Date.now(),
                     filters:
                       // ...settings.filters,
                       {
                         calendarsIdsSkipped: [||],
                       },
                   }
                 )
               }
               text="Show All"
             />}
        <Spacer size=S />
      </Row>
    </View>
    <View style=dynamicStyles##background>
      {calendars
       ->Option.map(calendars =>
           calendars
           ->Array.map(calendar =>
               <TouchableOpacity
                 key=calendar##id
                 onPress={_ =>
                   AppSettings.(
                     setSettings(settings =>
                       {
                         lastUpdated: Js.Date.now(),
                         filters: {
                           calendarsIdsSkipped:
                             {let ids = settings.filters.calendarsIdsSkipped
                              if (ids->Array.some(id => id == calendar##id)) {
                                ids->Array.keep(id => id != calendar##id);
                              } else {
                                ids->Array.concat([|calendar##id|]);
                              }},
                         },
                       }
                     )
                   )
                 }>
                 <Separator style=dynamicStyles##separatorOnBackground />
                 <SpacedView vertical=XS>
                   <View style=Predefined.styles##rowSpaceBetween>
                     <View>
                       <Text style=styles##text>
                         {calendar##title->React.string}
                       </Text>
                       <Text
                         style={S._2((
                           styles##infoText,
                           dynamicStyles##textGray2,
                         ))}>
                         {calendar##source->React.string}
                       </Text>
                     </View>
                     {
                       let skipped =
                         settings.filters.calendarsIdsSkipped
                         ->Array.some(id => id == calendar##id);
                       if (skipped) {
                         <SVGCircle
                           width={26.->ReactFromSvg.Size.dp}
                           height={26.->ReactFromSvg.Size.dp}
                           fill=calendar##color
                         />;
                       } else {
                         <SVGCheckmarkCircleFill
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
      <Separator />
    </View>
  </>;
};
