open Belt
open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {
    "dash": style(~alignSelf=#stretch, ()),
  }
}->StyleSheet.create

let slices = 4
let graphHeight = 140.
let graphLetterHeight = 16.

@react.component
let make = (~events, ~mapCategoryDuration, ~startDate, ~supposedEndDate) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context)

  let theme = Theme.useTheme(AppSettings.useTheme())

  let supposedNumberOfDays = Date.durationInMs(startDate, supposedEndDate)->Date.msToDays
  let dates =
    Array.range(0, supposedNumberOfDays->int_of_float)->Array.map(n =>
      startDate->DateFns.addDays(n->Js.Int.toFloat)
    )

  let durationPerDate = React.useMemo3(() => events->Option.map(evts => {
      let events = evts->Calendars.filterEvents(settings)

      dates->Array.map(date => {
        let startOfDate = date->Date.startOfDay
        let endOfDate = date->Date.endOfDay
        (date, events->Array.reduce(Map.String.empty, (mapPerCategories, evt) => {
            let cat = settings->Calendars.categoryIdFromActivityTitle(evt.title)
            if (
              Date.hasOverlap(
                evt.startDate->Js.Date.fromString,
                evt.endDate->Js.Date.fromString,
                date,
              )
            ) {
              mapPerCategories->Map.String.set(
                cat,
                mapPerCategories->Map.String.get(cat)->Option.getWithDefault(0.) +.
                  Date.durationInMs(
                    evt.startDate->Js.Date.fromString->Date.max(startOfDate),
                    evt.endDate->Js.Date.fromString->Date.min(endOfDate),
                  )->Date.msToMin,
              )
            } else {
              mapPerCategories
            }
          }))
      })
    }), (events, settings, dates))

  let maxDuration =
    durationPerDate
    ->Option.flatMap(durationPerDate =>
      (
        durationPerDate
        ->Array.map(((_date, mapPerCategories)) =>
          mapPerCategories->Map.String.toArray->Array.reduce(0., (mins, (_, min)) => mins +. min)
        )
        ->SortArray.stableSortBy((minA, minB) =>
          minA > minB
            ? -1
            : switch minA < minB {
              | true => 1
              | false => 0
              }
        )
      )[0]
    )
    ->Option.map(max => (max /. 60. /. 4.)->ceil *. 4. *. 60.)

  let (width, setWidth) = React.useState(() => 0.)
  let onLayout = React.useCallback1((layoutEvent: Event.layoutEvent) => {
    let width = layoutEvent.nativeEvent.layout.width
    setWidth(_ => width)
  }, [setWidth])

  let boxStyle = {
    open Style
    viewStyle(
      ~alignItems=#flexEnd,
      ~borderTopWidth=StyleSheet.hairlineWidth,
      ~borderTopColor=theme.colors.gray4,
      ~height=(graphHeight +. graphLetterHeight)->dp,
      (),
    )
  }

  <Row>
    <View onLayout style={Predefined.styles["flexGrow"]}>
      <View
        style={
          open Style
          array([StyleSheet.absoluteFill, Predefined.styles["rowSpaceBetween"], boxStyle])
        }>
        {Array.range(0, supposedNumberOfDays->int_of_float)->Array.map(i =>
          <React.Fragment key={i->string_of_int}>
            <Dash
              style={
                open Style
                array([
                  styles["dash"],
                  viewStyle(
                    ~position=#absolute,
                    ~top=0.->dp,
                    ~bottom=0.->dp,
                    ~left=(100. /. supposedNumberOfDays *. i->float)->pct,
                    (),
                  ),
                ])
              }
              dashColor=theme.colors.gray4
            />
            <SpacedView
              horizontal=XXS
              vertical=None
              style={
                open Style
                viewStyle(
                  ~position=#absolute,
                  ~bottom=0.->dp,
                  ~left=(100. /. supposedNumberOfDays *. i->float)->pct,
                  //  ~height=graphHeight->dp,
                  (),
                )
              }>
              <Text
                style={
                  open Style
                  array([theme.styles["textLight2"], textStyle(~fontSize=10., ())])
                }>
                {startDate
                ->DateFns.addDays(i->Js.Int.toFloat)
                ->Js.Date.getDay
                ->Date.dayLetterString
                ->React.string}
              </Text>
            </SpacedView>
          </React.Fragment>
        )->React.array}
        <Dash
          style={
            open Style
            array([
              styles["dash"],
              viewStyle(~position=#absolute, ~top=0.->dp, ~bottom=0.->dp, ~left=100.->pct, ()),
            ])
          }
          dashColor=theme.colors.gray4
        />
      </View>
      {maxDuration->Option.map(maxDuration => {
        let maxHours = maxDuration /. 60.
        <View
          style={
            open Style
            array([
              StyleSheet.absoluteFill,
              Predefined.styles["colSpaceBetween"],
              boxStyle,
              viewStyle(~height=graphHeight->dp, ()),
            ])
          }>
          {Array.range(1, slices - 1)->Array.reverse->Array.map(i =>
            <React.Fragment key={i->string_of_int}>
              <View
                style={
                  open Style
                  array([
                    styles["dash"],
                    viewStyle(
                      ~position=#absolute,
                      ~left=0.->dp,
                      ~right=0.->dp,
                      ~bottom=(100. /. slices->float *. i->float)->pct,
                      ~height=StyleSheet.hairlineWidth->dp,
                      ~backgroundColor=theme.colors.gray5,
                      (),
                    ),
                  ])
                }
              />
              <SpacedView
                horizontal=XXS
                vertical=None
                style={
                  open Style
                  viewStyle(
                    ~position=#absolute,
                    ~right=0.->dp,
                    ~bottom=(100. /. slices->float *. i->float)->pct,
                    (),
                  )
                }>
                <Text
                  style={
                    open Style
                    array([
                      textStyle(~position=#absolute, ~top=-5.->dp, ~right=-20.->dp, ()),
                      theme.styles["textLight2"],
                      textStyle(~fontSize=10., ~lineHeight=10., ()),
                    ])
                  }>
                  {(maxHours /. slices->float *. i->float)->Js.Float.toString->React.string}
                  {"h"->React.string}
                </Text>
              </SpacedView>
            </React.Fragment>
          )->React.array}
          <View
            style={
              open Style
              array([
                styles["dash"],
                viewStyle(
                  ~position=#absolute,
                  ~left=0.->dp,
                  ~right=0.->dp,
                  ~bottom=0.->pct,
                  ~height=StyleSheet.hairlineWidth->dp,
                  ~backgroundColor=theme.colors.gray5,
                  (),
                ),
              ])
            }
          />
        </View>
      })->Option.getWithDefault(React.null)}
      <View
        style={
          open Style
          array([Predefined.styles["rowSpaceBetween"], boxStyle])
        }>
        {durationPerDate->Option.map(dpd => dpd->Array.map(((date, mapPerCategories)) =>
            <SpacedView
              key={date->Js.Date.toISOString}
              horizontal=XS
              vertical=None
              style={
                open Style
                viewStyle(
                  ~width=(width /. dates->Array.length->float)->dp,
                  ~flexDirection=#columnReverse,
                  ~height=(graphHeight +. graphLetterHeight)->dp,
                  ~paddingBottom=graphLetterHeight->dp,
                  (),
                )
              }>
              {mapCategoryDuration
              ->Option.map(mapCategoryDuration =>
                mapCategoryDuration
                ->Array.map(((catId, _categoryId)) =>
                  mapPerCategories->Map.String.toArray->Array.map(((key, value)) => {
                    let (_, _, colorName, _) = ActivityCategories.getFromId(catId)
                    let backgroundColor = colorName->ActivityCategories.getColor(theme.mode)
                    key != catId
                      ? React.null
                      : <View
                          key
                          style={
                            open Style
                            array([
                              viewStyle(
                                ~backgroundColor,
                                ~height=(graphHeight /.
                                maxDuration->Option.getWithDefault(0.) *.
                                value)->dp,
                                (),
                              ),
                            ])
                          }
                        />
                  })->React.array
                )
                ->React.array
              )
              ->Option.getWithDefault(React.null)}
            </SpacedView>
          )->React.array)->Option.getWithDefault(React.null)}
      </View>
    </View>
    <Spacer />
  </Row>
}
