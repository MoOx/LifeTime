open Belt
open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {
    "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    "durationText": textStyle(~fontSize=12., ~lineHeight=12., ~fontWeight=#_700, ()),
    "dash": style(~alignSelf=#stretch, ()),
  }
}->StyleSheet.create

let slices = 6
let graphHeight = 160.
let graphLetterHeight = 16.

@react.component
let make = (
  ~events: array<ReactNativeCalendarEvents.calendarEventReadable>,
  ~startDate,
  ~supposedEndDate,
  ~categoryId,
) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context)

  let theme = Theme.useTheme(AppSettings.useTheme())

  let (_, _, colorName, _) = ActivityCategories.getFromId(categoryId)
  let backgroundColor = colorName->ActivityCategories.getColor(theme.mode)

  let (width, setWidth) = React.useState(() => 0.)
  let onLayout = React.useCallback1((layoutEvent: Event.layoutEvent) => {
    let width = layoutEvent.nativeEvent.layout.width
    setWidth(_ => width)
  }, [setWidth])

  let supposedNumberOfDays = Date.durationInMs(startDate, supposedEndDate)->Date.msToDays
  let dates =
    Array.range(0, supposedNumberOfDays->int_of_float)->Array.map(n =>
      startDate->DateFns.addDays(n->Js.Int.toFloat)
    )

  let eventsPerDate = React.useMemo4(() => {
    let events =
      events->Calendars.filterEvents(
        settings.calendarsSkipped,
        settings.activitiesSkippedFlag,
        settings.activitiesSkipped,
      )
    let minutesInDay = 1440.
    let minUnit = width /. minutesInDay
    dates->Array.map(date => {
      let startOfDate = date->Date.startOfDay
      let startOfDateMin = date->Date.startOfDay->Js.Date.getTime->Date.msToMin
      let endOfDate = date->Date.endOfDay
      (
        date,
        events
        ->Array.map(evt => {
          if (
            Date.hasOverlap(
              evt.startDate->Js.Date.fromString,
              evt.endDate->Js.Date.fromString,
              date,
            )
          ) {
            let start =
              (evt.startDate
              ->Js.Date.fromString
              ->Date.max(startOfDate)
              ->Js.Date.getTime
              ->Date.msToMin -. startOfDateMin) *. minUnit
            let end =
              (evt.endDate
              ->Js.Date.fromString
              ->Date.min(endOfDate)
              ->Js.Date.getTime
              ->Date.msToMin -. startOfDateMin) *. minUnit
            (evt.id, start, end)
          } else {
            ("", 0., 0.)
          }
        })
        ->Array.keep(((id, _, _)) => id != ""),
      )
    })
  }, (events, settings, dates, width))

  let boxStyle = {
    open Style
    viewStyle(
      ~alignItems=#flexStart,
      ~flexDirection=#column,
      ~borderTopWidth=StyleSheet.hairlineWidth,
      ~borderTopColor=theme.colors.gray4,
      ~height=(graphHeight +. graphLetterHeight)->dp,
      ~width=width->dp,
      (),
    )
  }

  <Row>
    <Spacer size=S />
    <View onLayout style={Predefined.styles["flexGrow"]}>
      <View
        style={
          open Style
          array([
            StyleSheet.absoluteFill,
            Predefined.styles["rowSpaceBetween"],
            boxStyle,
            viewStyle(~width=width->dp, ()),
          ])
        }>
        {Array.range(0, supposedNumberOfDays->int_of_float)
        ->Array.map(i =>
          <React.Fragment key={i->string_of_int}>
            <SpacedView
              horizontal=XXS
              vertical=None
              style={
                open Style
                viewStyle(
                  ~position=#absolute,
                  ~left=-20.->dp,
                  ~top=(104. /. supposedNumberOfDays *. i->float)->pct,
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
        )
        ->React.array}
      </View>
      <View
        style={
          open Style
          array([
            Predefined.styles["rowSpaceBetween"],
            viewStyle(~width=(width +. 30.)->dp, ~position=#absolute, ~bottom=15.->dp, ()),
          ])
        }>
        {Array.range(0, slices)
        ->Array.map(i =>
          <View key={i->string_of_int}>
            <SpacedView
              horizontal=XXS
              vertical=None
              style={
                open Style
                viewStyle(~bottom=-15.->dp, ())
              }>
              <Dash
                length=graphHeight
                style={
                  open Style
                  array([
                    styles["dash"],
                    viewStyle(
                      ~position=#absolute,
                      ~top=-.(graphHeight +. 10.)->dp,
                      ~bottom=-0.->dp,
                      (),
                    ),
                  ])
                }
                dashColor=theme.colors.gray4
              />
            </SpacedView>
            <View>
              <SpacedView
                horizontal=XXS
                vertical=None
                style={
                  open Style
                  viewStyle(~bottom=-15.->dp, ())
                }>
                <Text
                  style={
                    open Style
                    array([
                      textStyle(~top=5.->dp, ~right=10.->dp, ()),
                      theme.styles["textLight2"],
                      textStyle(~fontSize=10., ~lineHeight=10., ()),
                    ])
                  }>
                  {(i * 4)->Js.Int.toString->React.string} {"h"->React.string}
                </Text>
              </SpacedView>
            </View>
          </View>
        )
        ->React.array}
        <View
          style={
            open Style
            array([
              styles["dash"],
              viewStyle(
                ~position=#absolute,
                ~left=0.->dp,
                ~right=0.->dp,
                ~bottom=-10.->pct,
                ~height=StyleSheet.hairlineWidth->dp,
                ~width=width->dp,
                ~backgroundColor=theme.colors.gray5,
                (),
              ),
            ])
          }
        />
      </View>
      <View
        style={
          open Style
          array([Predefined.styles["col"]])
        }>
        <Spacer size=XXS />
        {// TODO: handle events
        eventsPerDate
        ->Array.map(((date, ranges)) =>
          <SpacedView
            key={date->Js.Date.toISOString}
            horizontal=S
            vertical=XS
            style={
              open Style
              viewStyle(
                ~flexDirection=#row,
                ~height=6.->dp,
                ~paddingBottom=graphLetterHeight->dp,
                (),
              )
            }>
            {ranges
            ->Array.map(((id, rangeFrom, rangeTo)) =>
              <View
                key=id
                style={
                  open Style
                  array([
                    viewStyle(
                      ~height=6.->dp,
                      ~width=(rangeTo -. rangeFrom)->dp,
                      ~position=#absolute,
                      ~left=rangeFrom->dp,
                      ~borderRadius=6.,
                      ~backgroundColor,
                      (),
                    ),
                  ])
                }
              />
            )
            ->React.array}
          </SpacedView>
        )
        ->React.array}
      </View>
    </View>
    <Spacer />
  </Row>
}
