open Belt;
open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
      "durationText":
        textStyle(~fontSize=12., ~lineHeight=12., ~fontWeight=`_700, ()),
    })
  );

let numberOfEventsToShow = 8;

[@react.component]
let make = (~mapTitleDuration, ~onFiltersPress, ~onActivityPress) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context);

  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  let calendars = Calendars.useCalendars(None);
  let (eventsToShow, setEventsToShow) =
    React.useState(() => numberOfEventsToShow);

  let (_, maxDurationInMin) =
    mapTitleDuration
    ->Option.flatMap(dpt => dpt[0])
    ->Option.getWithDefault(("", 50.));

  let (width, setWidth) = React.useState(() => 0.);
  let onLayout =
    React.useCallback0((layoutEvent: Event.layoutEvent) => {
      let width = layoutEvent##nativeEvent##layout##width;
      setWidth(_ => width);
    });
  // keep some place for duration string
  let availableWidthForBar = width -. 85. -. SpacedView.space *. 4.;

  <>
    <View style=Predefined.styles##rowSpaceBetween>
      <Row> <Spacer size=XS /> <BlockHeading text="Top Activities" /> </Row>
      <Row>
        <BlockHeadingTouchable
          onPress={_ => onFiltersPress()}
          text="Customize report"
        />
        <Spacer size=XS />
      </Row>
    </View>
    <Separator style=themeStyles##separatorOnBackground />
    <View onLayout style=themeStyles##background>
      {calendars
       ->Option.map(calendars =>
           Calendars.availableCalendars(calendars, settings)
         )
       ->Option.map(c =>
           if (c->Array.length === 0) {
             <SpacedView>
               <Center>
                 <Spacer size=XXL />
                 <Title style=themeStyles##textOnBackground>
                   "No Events"->React.string
                 </Title>
                 <Spacer />
                 <Text style=themeStyles##textLightOnBackground>
                   "You should select at least a calendar"->React.string
                 </Text>
                 <Spacer size=XXL />
               </Center>
             </SpacedView>;
           } else {
             React.null;
           }
         )
       ->Option.getWithDefault(React.null)}
      {mapTitleDuration
       ->Option.map(mapTitleDuration =>
           <>
             {switch (mapTitleDuration) {
              | [||] =>
                <SpacedView>
                  <Center>
                    <Spacer size=XXL />
                    <Title style=themeStyles##textOnBackground>
                      "No Events"->React.string
                    </Title>
                    <Spacer />
                    <Text style=themeStyles##textLightOnBackground>
                      "That's unexpected. Try filling the blanks!"
                      ->React.string
                    </Text>
                    <Spacer size=XXL />
                  </Center>
                </SpacedView>
              | _ =>
                <>
                  {mapTitleDuration
                   ->Array.slice(~offset=0, ~len=eventsToShow)
                   ->Array.map(((title, totalDurationInMin)) => {
                       let durationString =
                         totalDurationInMin->Date.minToString;
                       let (_, _, colorName, iconName) =
                         settings
                         ->Calendars.categoryIdFromEventTitle(title)
                         ->Calendars.Categories.getFromId;
                       let color =
                         theme->Calendars.Categories.getColor(colorName);
                       <TouchableOpacity
                         onPress={_ => onActivityPress(title)} key=title>
                         <View style=Predefined.styles##rowCenter>
                           <Spacer size=S />
                           <SpacedView vertical=XS horizontal=None>
                             <NamedIcon
                               name=iconName
                               fill=color
                             />
                           </SpacedView>
                           <Spacer size=XS />
                           <View style=Predefined.styles##flexGrow>
                             <SpacedView
                               vertical=XS
                               horizontal=None
                               style=Style.(
                                 list([
                                   Predefined.styles##rowCenter,
                                   Predefined.styles##flexShrink,
                                 ])
                               )>
                               <View
                                 style=Style.(
                                   list([
                                     Predefined.styles##flexGrow,
                                     Predefined.styles##flexShrink,
                                   ])
                                 )>
                                 <Text
                                   style=themeStyles##textOnBackground
                                   numberOfLines=1>
                                   title->React.string
                                 </Text>
                                 <Spacer size=XXS />
                                 <Row
                                   style=Style.(
                                     viewStyle(~alignItems=`center, ())
                                   )>
                                   <View
                                     style=Style.(
                                       array([|
                                         themeStyles##backgroundGray3,
                                         viewStyle(
                                           // ~backgroundColor=color,
                                           ~width=
                                             (
                                               totalDurationInMin
                                               /. maxDurationInMin
                                               *. availableWidthForBar
                                             )
                                             ->dp,
                                           ~height=6.->dp,
                                           ~borderRadius=6.,
                                           ~overflow=`hidden,
                                           (),
                                         ),
                                       |])
                                     )
                                   />
                                   <Spacer size=XXS />
                                   <Text
                                     style=Style.(
                                       array([|
                                         styles##durationText,
                                         themeStyles##textLightOnBackground,
                                       |])
                                     )>
                                     durationString->React.string
                                   </Text>
                                 </Row>
                               </View>
                               <Spacer size=XS />
                               <SVGchevronright
                                 width={14.->ReactFromSvg.Size.dp}
                                 height={14.->ReactFromSvg.Size.dp}
                                 fill={Predefined.Colors.Ios.light.gray4}
                               />
                               <Spacer size=S />
                             </SpacedView>
                             <Separator
                               style=themeStyles##separatorOnBackground
                             />
                           </View>
                         </View>
                       </TouchableOpacity>;
                     })
                   ->React.array}
                  {
                    let showMore =
                      mapTitleDuration->Array.length > eventsToShow;
                    let showLess = eventsToShow > numberOfEventsToShow;
                    showMore || showLess
                      ? <Row>
                          <Spacer size=L />
                          <View
                            style=Style.(
                              list([
                                Predefined.styles##rowSpaceBetween,
                                Predefined.styles##flexGrow,
                              ])
                            )>
                            {mapTitleDuration->Array.length > eventsToShow
                               ? <TouchableOpacity
                                   onPress={_ =>
                                     setEventsToShow(eventsToShow =>
                                       eventsToShow + numberOfEventsToShow
                                     )
                                   }>
                                   <SpacedView vertical=XS horizontal=S>
                                     <Text style=themeStyles##textBlue>
                                       "Show More"->React.string
                                     </Text>
                                   </SpacedView>
                                 </TouchableOpacity>
                               : React.null}
                            <Spacer />
                            {eventsToShow > numberOfEventsToShow
                               ? <TouchableOpacity
                                   onPress={_ =>
                                     setEventsToShow(eventsToShow =>
                                       eventsToShow - numberOfEventsToShow
                                     )
                                   }>
                                   <SpacedView vertical=XS horizontal=S>
                                     <Text style=themeStyles##textBlue>
                                       "Show Less"->React.string
                                     </Text>
                                   </SpacedView>
                                 </TouchableOpacity>
                               : React.null}
                          </View>
                          <Separator
                            style=themeStyles##separatorOnBackground
                          />
                        </Row>
                      : React.null;
                  }
                </>
              }}
             <Separator style=themeStyles##separatorOnBackground />
           </>
         )
       ->Option.getWithDefault(React.null)}
    </View>
  </>;
};
