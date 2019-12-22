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

[@react.component]
let make = (~onFiltersPress) => {
  let dynamicStyles = Theme.useStyles();

  let today = Date.now();
  let before = Date.now();
  before->Js.Date.setDate(before->Js.Date.getDate -. 7.)->ignore;

  let (events, setEvents) = React.useState(() => [||]);
  React.useEffect1(
    () => {
      ReactNativeCalendarEvents.fetchAllEvents(
        before->Js.Date.toISOString,
        today->Js.Date.toISOString,
        None,
      )
      ->FutureJs.fromPromise(error => {
          // @todo ?
          Js.log(error);
          error;
        })
      ->Future.tapOk(evts => setEvents(_ => evts))
      ->ignore;
      None;
    },
    [|setEvents|],
  );

  let (filters, setFilters) =
    React.useState(() =>
      {allDay: true, calendars: [||], minimumDurationInMin: 120.}
    );

  let filteredEvents =
    events->Array.keep(e =>
      if (filters.allDay && e##allDay->Option.getWithDefault(false)) {
        false;
      } else if (filters.calendars
                 ->Array.some(cal =>
                     cal##id
                     != e##calendar
                        ->Option.map(c => c##id)
                        ->Option.getWithDefault("")
                   )) {
        false;
      } else {
        true;
      }
    );

  let eventsByName =
    filteredEvents
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
    ->Map.String.toArray;

  let durationPerTitle =
    eventsByName->Array.map(((_key, evts)) => {
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
    });

  durationPerTitle->SortArray.stableSortInPlaceBy(((_, minA), (_, minB)) =>
    minA > minB ? (-1) : minA < minB ? 1 : 0
  );

  let (_, maxDurationInMin) =
    durationPerTitle[0]->Option.getWithDefault(("", 50.));

  let (width, setWidth) = React.useState(() => 0.);
  let onLayout =
    React.useCallback0((layoutEvent: Event.layoutEvent) => {
      let width = layoutEvent##nativeEvent##layout##width;
      setWidth(_ => width);
    });

  let availableWidthForBar = width -. 85. -. SpacedView.space *. 2.;
  // keep some place for duration string

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
      {durationPerTitle
       ->Array.map(((title, totalDurationInMin)) =>
           totalDurationInMin < filters.minimumDurationInMin
             ? React.null
             : {
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
                   </View>
                 </SpacedView>
               </TouchableOpacity>;
             }
         )
       ->React.array}
      <Separator />
    </View>
  </>;
};
