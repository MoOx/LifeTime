open Belt
open ReactNative
open ReactMultiversal

let oneH = 60.
let slices = 4
let graphHeight = 140.
let graphLetterHeight = 16.
let rightSpace = 28. // Enough for "99m"

let styles = {
  open Style
  {
    "container": viewStyle(
      ~flexDirection=#row,
      ~alignItems=#flexEnd,
      ~justifyContent=#flexEnd,
      ~height=(graphHeight +. graphLetterHeight)->dp,
      (),
    ),
    "content": viewStyle(~height=graphHeight->dp, ()),
    "axisX": viewStyle(
      ~alignSelf=#stretch,
      ~position=#absolute,
      ~left=0.->dp,
      ~right=0.->dp,
      ~height=StyleSheet.hairlineWidth->dp,
      (),
    ),
    "axisY": viewStyle(
      ~alignSelf=#stretch,
      ~position=#absolute,
      ~top=StyleSheet.hairlineWidth->dp,
      ~bottom=StyleSheet.hairlineWidth->dp,
      (),
    ),
    "barContainer": viewStyle(
      ~justifyContent=#flexEnd,
      ~alignItems=#center,
      ~height=(graphHeight +. graphLetterHeight)->dp,
      ~paddingBottom=graphLetterHeight->dp,
      (),
    ),
    "bar": viewStyle(
      ~width=60.->pct,
      ~borderTopLeftRadius=3.,
      ~borderTopRightRadius=3.,
      ~overflow=#hidden,
      (),
    ),
  }
}->StyleSheet.create

module GridXAxis = {
  @react.component
  let make = React.memo((~maxDuration) => {
    let theme = Theme.useTheme(AppSettings.useTheme())
    maxDuration
    ->Option.map(maxDuration => {
      let (max, u) = maxDuration > oneH ? (maxDuration /. oneH, "h") : (maxDuration, "m")
      let nbSlices = maxDuration === 0. ? 1 : slices
      <View
        style={
          open Style
          array([StyleSheet.absoluteFill, styles["content"]])
        }>
        {Array.range(0, nbSlices)
        ->Array.reverse
        ->Array.map(i =>
          <React.Fragment key={i->string_of_int}>
            <View
              style={
                open Style
                array([
                  styles["axisX"],
                  viewStyle(
                    ~marginTop=(i === nbSlices ? 0. : 1.)->dp,
                    ~top=(100. -. 100. /. nbSlices->float *. i->float)->pct,
                    ~backgroundColor=theme.colors.gray5,
                    (),
                  ),
                ])
              }
            />
            {i === 0 || i === nbSlices
              ? React.null
              : <View
                  style={
                    open Style
                    viewStyle(
                      ~position=#absolute,
                      ~right=0.->dp,
                      ~bottom=(100. /. nbSlices->float *. i->float)->pct,
                      (),
                    )
                  }>
                  <View
                    style={
                      open Style
                      array([
                        viewStyle(
                          ~position=#absolute,
                          ~top=-6.->dp,
                          ~right=-.rightSpace->dp,
                          ~width=rightSpace->dp,
                          ~flexDirection=#row,
                          (),
                        ),
                      ])
                    }>
                    <Spacer size=XXS />
                    <Text
                      allowFontScaling=false
                      style={Style.array([theme.styles["textLight2"], Theme.text["caption2"]])}>
                      {((max /. nbSlices->float *. i->float)->Js.Float.toFixed ++ u)->React.string}
                    </Text>
                  </View>
                </View>}
          </React.Fragment>
        )
        ->React.array}
      </View>
    })
    ->Option.getWithDefault(React.null)
  })
}

module GridYAxis = {
  @react.component
  let make = React.memo((~supposedNumberOfDays, ~startDate) => {
    let theme = Theme.useTheme(AppSettings.useTheme())

    let dash =
      <Dash style=StyleSheet.absoluteFill dashColor=theme.colors.gray4 length=graphHeight />

    let nbDash = supposedNumberOfDays->int_of_float + 1

    <View
      style={
        open Style
        array([StyleSheet.absoluteFill, Predefined.styles["rowSpaceBetween"]])
      }>
      {Array.range(0, nbDash)
      ->Array.map(i =>
        <React.Fragment key={i->string_of_int}>
          <View
            style={
              open Style
              array([
                styles["axisY"],
                viewStyle(~left=(100. /. supposedNumberOfDays *. i->float)->pct, ()),
              ])
            }>
            {dash}
          </View>
          {i === nbDash
            ? React.null
            : <SpacedView
                horizontal=XXS
                vertical=None
                style={
                  open Style
                  viewStyle(
                    ~position=#absolute,
                    ~bottom=0.->dp,
                    ~left=(100. /. supposedNumberOfDays *. i->float)->pct,
                    (),
                  )
                }>
                <Text
                  allowFontScaling=false
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
              </SpacedView>}
        </React.Fragment>
      )
      ->React.array}
    </View>
  })
}

@react.component
let make = React.memo((
  ~activities,
  ~activitiesSkipped,
  ~activitiesSkippedFlag,
  ~calendarsSkipped,
  ~events,
  ~mapCategoryDuration: option<array<(Belt.Map.String.key, float)>>,
  ~startDate,
  ~supposedEndDate,
  ~width,
) => {
  let theme = Theme.useTheme(AppSettings.useTheme())

  let supposedNumberOfDays = Date.durationInMs(startDate, supposedEndDate)->Date.msToDays
  let dates =
    Array.range(0, supposedNumberOfDays->int_of_float)->Array.map(n =>
      startDate->DateFns.addDays(n->Js.Int.toFloat)
    )
  let nb = dates->Array.length->float

  let durationPerDate = React.useMemo6(() =>
    events->Option.map(evts => {
      let events =
        evts->Calendars.filterEvents(calendarsSkipped, activitiesSkippedFlag, activitiesSkipped)

      dates->Array.map(date => {
        let startOfDate = date->Date.startOfDay
        let endOfDate = date->Date.endOfDay
        (
          date,
          events->Array.reduce(Map.String.empty, (mapPerCategories, evt) => {
            let cat = evt.title->Calendars.categoryIdFromActivityTitle(activities)
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
          }),
        )
      })
    })
  , (events, dates, activities, activitiesSkipped, activitiesSkippedFlag, calendarsSkipped))

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
    ->Option.map(max => {
      // the idea here is to avoid when divided for visual slice to have
      // values with digits
      // if  max duration is > 1 hour, we round to a a "bundle of hours" scale
      // otherwise we round to "a small amount of minutes"
      let roundTo = max > oneH ? oneH *. 4. : 20.
      (max /. roundTo)->ceil *. roundTo
    })

  <Row>
    <View
      style={
        open Style
        array([styles["container"], viewStyle(~width=(width -. rightSpace)->dp, ())])
      }>
      {width == 0.
        ? React.null
        : <>
            <GridYAxis supposedNumberOfDays startDate />
            <GridXAxis maxDuration />
            {durationPerDate
            ->Option.map(dpd =>
              dpd
              ->Array.map(((date, mapPerCategories)) =>
                <View
                  key={date->Js.Date.toISOString}
                  style={
                    open Style
                    array([styles["barContainer"], viewStyle(~width=(100. /. nb)->pct, ())])
                  }>
                  <View style={styles["bar"]}>
                    {mapCategoryDuration
                    ->Option.map(mapCategoryDuration =>
                      mapCategoryDuration
                      ->Array.reverse
                      ->Array.map(((catId, _categoryId)) =>
                        mapPerCategories
                        ->Map.String.toArray
                        ->Array.map(((key, value)) => {
                          let (_, _, colorName, _) = ActivityCategories.getFromId(catId)
                          let backgroundColor = colorName->ActivityCategories.getColor(theme.mode)
                          key != catId
                            ? React.null
                            : <View
                                key
                                style={
                                  open Style
                                  viewStyle(
                                    ~backgroundColor,
                                    ~height=(graphHeight /.
                                    maxDuration->Option.getWithDefault(0.) *.
                                    value)->dp,
                                    (),
                                  )
                                }
                              />
                        })
                        ->React.array
                      )
                      ->React.array
                    )
                    ->Option.getWithDefault(React.null)}
                  </View>
                </View>
              )
              ->React.array
            )
            ->Option.getWithDefault(React.null)}
          </>}
    </View>
    <Spacer size=Custom(rightSpace) />
  </Row>
})
