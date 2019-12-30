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

let graphHeight = 100.;

[@react.component]
let make = (~events, ~mapTitleDuration, ~startDate, ~endDate) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context);
  let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();

  let numberOfDays = Date.durationInMs(startDate, endDate)->Date.msToDays;
  let dates =
    Array.range(0, numberOfDays->int_of_float)
    ->Array.map(n => startDate->Date.addDays(~numberOfDays=n));

  let durationPerDate =
    React.useMemo2(
      () =>
        events->Option.map(evts => {
          let events = evts->Calendars.filterEvents(settings);

          dates->Array.map(date => {
            let startOfDate = date->Date.startOfDay;
            let endOfDate = date->Date.endOfDay;
            (
              date,
              events->Array.reduce(
                Map.String.empty,
                (mapPerCategories, e) => {
                  // @todo real categories
                  let cat = e##title;
                  if (Date.hasOverlap(
                        e##startDate->Js.Date.fromString,
                        e##endDate->Js.Date.fromString,
                        date,
                      )) {
                    mapPerCategories->Map.String.set(
                      cat,
                      mapPerCategories
                      ->Map.String.get(cat)
                      ->Option.getWithDefault(0.)
                      +. Date.durationInMs(
                           e##startDate
                           ->Js.Date.fromString
                           ->Date.max(startOfDate),
                           e##endDate
                           ->Js.Date.fromString
                           ->Date.min(endOfDate),
                         )
                         ->Date.msToMin,
                    );
                  } else {
                    mapPerCategories;
                  };
                },
              ),
            );
          });
        }),
      (events, settings),
    );

  let maxDuration =
    durationPerDate->Option.flatMap(durationPerDate =>
      durationPerDate
      ->Array.map(((_date, mapPerCategories)) =>
          mapPerCategories
          ->Map.String.toArray
          ->Array.reduce(0., (mins, (_, min)) => mins +. min)
        )
      ->SortArray.stableSortBy((minA, minB) =>
          minA > minB ? (-1) : minA < minB ? 1 : 0
        )[0]
    );

  let (width, setWidth) = React.useState(() => 0.);
  let onLayout =
    React.useCallback0((layoutEvent: Event.layoutEvent) => {
      let width = layoutEvent##nativeEvent##layout##width;
      setWidth(_ => width);
    });

  let dash =
    <Dash
      style=Style.(style(~alignSelf=`stretch, ()))
      rowStyle=`column
      dashGap=3.
      dashLength=3.
      dashThickness=StyleSheet.hairlineWidth
      dashColor={Theme.themedColors(theme).gray4}
    />;

  <View
    onLayout
    style=Style.(
      array([|
        Predefined.styles##rowSpaceBetween,
        style(
          ~alignItems=`flexEnd,
          ~borderTopWidth=StyleSheet.hairlineWidth,
          ~borderTopColor=Theme.themedColors(theme).gray4,
          (),
        ),
      |])
    )>
    dash
    {durationPerDate
     ->Option.map(dpd =>
         dpd
         ->Array.map(((date, mapPerCategories)) =>
             <React.Fragment key={date->Js.Date.toISOString}>
               <SpacedView
                 horizontal=XS
                 vertical=None
                 style=Style.(
                   viewStyle(
                     ~width=(width /. dates->Array.length->float)->dp,
                     ~flexDirection=`columnReverse,
                     (),
                   )
                 )>
                 <Text
                   style=Style.(
                     list([
                       themeStyles##textLightOnBackground,
                       textStyle(~fontSize=10., ()),
                     ])
                   )>
                   {date->Date.dayLetterString->React.string}
                 </Text>
                 <Spacer size=XXS />
                 {mapTitleDuration
                  ->Option.map(mapTitleDuration =>
                      mapTitleDuration
                      ->Array.map(((title, _)) =>
                          mapPerCategories
                          ->Map.String.toArray
                          ->Array.map(((key, value)) =>
                              key !== title
                                ? React.null
                                : <View
                                    key
                                    style=Style.(
                                      array([|
                                        themeStyles##backgroundGray,
                                        viewStyle(
                                          // ~backgroundColor=Calendars.color(key),
                                          ~height=
                                            (
                                              graphHeight
                                              /. maxDuration->Option.getWithDefault(
                                                   0.,
                                                 )
                                              *. value
                                            )
                                            ->dp,
                                          (),
                                        ),
                                      |])
                                    )>
                                    {!Global.__DEV__
                                       ? React.null
                                       : <Text
                                           style=Style.(
                                             textStyle(~fontSize=6., ())
                                           )>
                                           key->React.string
                                         </Text>}
                                  </View>
                            )
                          ->React.array
                        )
                      ->React.array
                    )
                  ->Option.getWithDefault(React.null)}
               </SpacedView>
               dash
             </React.Fragment>
           )
         //  </Text>
         //    {date->Js.Date.getDay->Js.Float.toString->React.string}
         //  <Text key={date->Js.Date.toISOString}>
         ->React.array
       )
     ->Option.getWithDefault(React.null)}
  </View>;
};
