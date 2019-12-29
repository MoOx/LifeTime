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
let make = (~mapTitleDuration, ~onFiltersPress) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context);
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
  let availableWidthForBar = width -. 85. -. SpacedView.space *. 2.;

  <>
    <View style=Predefined.styles##rowSpaceBetween>
      <Row> <Spacer size=S /> <BlockHeading text="Top Activities" /> </Row>
      <Row>
        <BlockHeadingTouchable
          onPress={_ => onFiltersPress()}
          text="Customize report"
        />
        <Spacer size=S />
      </Row>
    </View>
    <View onLayout style=themeStyles##background>
      {calendars
       ->Option.map(calendars =>
           Calendars.availableCalendars(calendars, settings)
         )
       ->Option.map(c =>
           if (c->Array.length === 0) {
             <>
               <Separator style=themeStyles##separatorOnBackground />
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
               </SpacedView>
             </>;
           } else {
             React.null;
           }
         )
       ->Option.getWithDefault(React.null)}
      {mapTitleDuration
       ->Option.map(mapTitleDuration =>
           <>
             {mapTitleDuration
              ->Array.slice(~offset=0, ~len=eventsToShow)
              ->Array.map(((title, totalDurationInMin)) => {
                  let durationInH = totalDurationInMin /. 60.;
                  let durationH = durationInH->int_of_float;
                  let durationM =
                    (durationInH -. durationH->float_of_int) *. 60.;
                  let durationString =
                    durationH->string_of_int
                    ++ "h"
                    ++ " "
                    ++ (
                      durationM >= 1. ? durationM->Js.Float.toFixed ++ "m" : ""
                    );
                  <TouchableOpacity onPress={_ => ()} key=title>
                    <Separator style=themeStyles##separatorOnBackground />
                    <SpacedView vertical=XS>
                      <View style=Predefined.styles##rowSpaceBetween>
                        <View>
                          <Text style=themeStyles##textOnBackground>
                            title->React.string
                          </Text>
                          <Spacer size=XXS />
                          <Row
                            style=Style.(viewStyle(~alignItems=`center, ()))>
                            <View
                              style=Style.(
                                array([|
                                  themeStyles##backgroundGray3,
                                  viewStyle(
                                    // ~backgroundColor=Calendars.color(title),
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
                      </View>
                    </SpacedView>
                  </TouchableOpacity>;
                  // <SVGChevronRight
                  //   width={14.->ReactFromSvg.Size.dp}
                  //   height={14.->ReactFromSvg.Size.dp}
                  //   fill={Predefined.Colors.Ios.light.gray4}
                  // />
                })
              ->React.array}
             <Separator style=themeStyles##separatorOnBackground />
             {
               let showMore = mapTitleDuration->Array.length > eventsToShow;
               let showLess = eventsToShow > numberOfEventsToShow;
               showMore || showLess
                 ? <>
                     <View style=Predefined.styles##rowSpaceBetween>
                       {mapTitleDuration->Array.length > eventsToShow
                          ? <TouchableOpacity
                              onPress={_ =>
                                setEventsToShow(eventsToShow =>
                                  eventsToShow + numberOfEventsToShow
                                )
                              }>
                              <SpacedView vertical=XS>
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
                              <SpacedView vertical=XS>
                                <Text style=themeStyles##textBlue>
                                  "Show Less"->React.string
                                </Text>
                              </SpacedView>
                            </TouchableOpacity>
                          : React.null}
                     </View>
                     <Separator style=themeStyles##separatorOnBackground />
                   </>
                 : React.null;
             }
           </>
         )
       ->Option.getWithDefault(React.null)}
    </View>
  </>;
};
