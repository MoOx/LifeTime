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

type filters = {
  allDay: bool,
  calendars: array(ReactNativeCalendarEvents.calendar),
  minimumDurationInMin: float,
};

let eventDurationInMs = e =>
  e##endDate->Js.Date.fromString->Js.Date.valueOf
  -. e##startDate->Js.Date.fromString->Js.Date.valueOf;

let msToMin = duration => duration /. 1000. /. 60.;

let availableCalendars = (calendars, settings: AppSettings.settings) =>
  calendars
  ->Array.keep(c =>
      !settings.filters.calendarsIdsSkipped->Array.some(cs => cs == c##id)
    )
  ->Array.map(c => c##id);

[@react.component]
let make = (~onFiltersPress) => {
  let dynamicStyles = Theme.useStyles();

  let isFocus = ReactNavigation.Native.useIsFocused();
  let (settings, _setSettings) = AppSettings.useSettings(isFocus);

  let today = Date.now();
  let before = Date.now();
  before->Js.Date.setDate(before->Js.Date.getDate -. 7.)->ignore;

  let calendars = Calendars.useCalendars(isFocus);
  let (events, setEvents) = React.useState(() => None);

  React.useEffect3(
    () => {
      ReactNativeCalendarEvents.fetchAllEvents(
        before->Js.Date.toISOString,
        today->Js.Date.toISOString,
        // we filter calendar later cause if you UNSELECT ALL
        // this `fetchAllEvents` DEFAULT TO ALL
        None,
      )
      ->FutureJs.fromPromise(error => {
          // @todo ?
          Js.log(error);
          error;
        })
      ->Future.tapOk(res => setEvents(_ => Some(res)))
      ->ignore;
      None;
    },
    (setEvents, calendars, settings),
  );

  let durationPerTitle =
    events->Option.map(events =>
      events
      ->Array.keep(e
          // filters out all day events
          =>
            if (e##allDay->Option.getWithDefault(false)) {
              false;
                   // filters selected calendars
            } else if (settings.filters.calendarsIdsSkipped
                       ->Array.some(cid =>
                           cid
                           == e##calendar
                              ->Option.map(c => c##id)
                              ->Option.getWithDefault("")
                         )) {
              false;
            } else {
              true;
            }
          )
      ->Array.reduce(
          Map.String.empty,
          (map, e) => {
            let key = e##title->Js.String.toLowerCase;
            map->Map.String.set(
              key,
              map
              ->Map.String.get(key)
              ->Option.getWithDefault([||])
              ->Array.concat([|e|]),
            );
          },
        )
      ->Map.String.toArray
      ->Array.map(((_key, evts)) => {
          let totalDurationInMin =
            evts->Array.reduce(
              0.,
              (totalDurationInMin, e) => {
                let durationInMs = e->eventDurationInMs;
                totalDurationInMin
                +. durationInMs->Js.Date.fromFloat->Js.Date.valueOf->msToMin;
              },
            );
          (
            evts[0]->Option.map(e => e##title)->Option.getWithDefault(""),
            totalDurationInMin,
          );
        })
      ->SortArray.stableSortBy(((_, minA), (_, minB)) =>
          minA > minB ? (-1) : minA < minB ? 1 : 0
        )
    );

  let (_, maxDurationInMin) =
    durationPerTitle
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
      <Spacer />
      <Row>
        <BlockHeadingTouchable
          onPress={_ => onFiltersPress()}
          text="Customize report"
        />
        <Spacer size=S />
      </Row>
    </View>
    <View onLayout style=dynamicStyles##background>
      {calendars
       ->Option.map(calendars => availableCalendars(calendars, settings))
       ->Option.map(c =>
           if (c->Array.length === 0) {
             <>
               <Separator style=dynamicStyles##separatorOnBackground />
               <SpacedView>
                 <Center>
                   <Spacer size=XXL />
                   <Title> "No Events"->React.string </Title>
                   <Spacer />
                   <Text>
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
      {durationPerTitle
       ->Option.map(durationPerTitle =>
           durationPerTitle
           ->Array.map(((title, totalDurationInMin)) => {
               let durationInH = totalDurationInMin /. 60.;
               let durationH = durationInH->int_of_float;
               let durationM = (durationInH -. durationH->float_of_int) *. 60.;
               let durationString =
                 durationH->string_of_int
                 ++ "h"
                 ++ " "
                 ++ (durationM >= 1. ? durationM->Js.Float.toFixed ++ "m" : "");
               <TouchableOpacity onPress={_ => ()} key=title>
                 <Separator style=dynamicStyles##separatorOnBackground />
                 <SpacedView vertical=XS>
                   <View style=Predefined.styles##rowSpaceBetween>
                     <View>
                       <Text> title->React.string </Text>
                       <Spacer size=XXS />
                       <Row style=Style.(viewStyle(~alignItems=`center, ()))>
                         <View
                           style=Style.(
                             array([|
                               dynamicStyles##backgroundGray3,
                               viewStyle(
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
                               dynamicStyles##textLightOnBackground,
                             |])
                           )>
                           durationString->React.string
                         </Text>
                       </Row>
                     </View>
                     <SVGChevronRight
                       width={14.->ReactFromSvg.Size.dp}
                       height={14.->ReactFromSvg.Size.dp}
                       fill={Predefined.Colors.Ios.light.gray4}
                     />
                   </View>
                 </SpacedView>
               </TouchableOpacity>;
             })
           ->React.array
         )
       ->Option.getWithDefault(React.null)}
      <Separator />
    </View>
  </>;
};
