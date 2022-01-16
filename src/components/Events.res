open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = (
  ~events: array<ReactNativeCalendarEvents.calendarEventReadable>,
  ~startDate: Js.Date.t,
  ~endDate: Js.Date.t,
) => {
  let themeModeKey = AppSettings.useTheme()
  let theme = Theme.useTheme(themeModeKey)

  let (width, setWidth) = React.useState(() => 0.)
  let onLayout = React.useCallback1((layoutEvent: Event.layoutEvent) => {
    let width = layoutEvent.nativeEvent.layout.width
    setWidth(_ => width)
  }, [setWidth])
  // keep some place for duration string
  let availableWidthForBar = width -. 85. -. SpacedView.space *. 4.

  let eventsWithDuration = events->Array.map(event => {
    let durationInMin =
      Date.durationInMs(
        event.startDate->Js.Date.fromString,
        event.endDate->Js.Date.fromString,
      )->Date.msToMin
    (event, durationInMin)
  })

  let maxDuration =
    eventsWithDuration->Array.reduce(0., (max, (_, duration)) => duration > max ? duration : max)

  <View onLayout>
    <Row>
      <Spacer size=XS />
      <BlockHeading
        style={array([theme.styles["background"], theme.styles["text"]])}
        text={startDate->Js.Date.getDate->Belt.Float.toString ++
        " - " ++
        endDate->Js.Date.getDate->Belt.Float.toString ++
        " " ++
        endDate->Date.monthShortString}
      />
    </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    {switch eventsWithDuration->Array.length {
    | 0 =>
      <SpacedView horizontal=L>
        <Center>
          <Spacer />
          <Text
            style={array([
              Theme.text["title3"],
              Theme.text["weight400"],
              theme.styles["textLight2"],
            ])}>
            {"No events"->React.string}
          </Text>
          <Spacer size=XXS />
          <Text style={array([Theme.text["footnote"], theme.styles["textLight2"]])}>
            {"You should add some events to your calendar or activate more calendars."->React.string}
          </Text>
          <Spacer />
        </Center>
      </SpacedView>
    | _x =>
      <View>
        {eventsWithDuration
        ->Array.mapWithIndex((index, eventWithDuration) => {
          let (event, duration) = eventWithDuration
          let durationString = duration->Date.minToString
          <View key=event.id>
            <View style={Predefined.styles["rowSpaceBetween"]}>
              <Row>
                <Spacer size=S />
                <View>
                  <View style={Predefined.styles["row"]}>
                    <Text
                      style={array([Theme.text["callout"], theme.styles["text"]])}
                      numberOfLines=1
                      adjustsFontSizeToFit=true>
                      {(event.startDate
                      ->Js.Date.fromString
                      ->Js.Date.getDay
                      ->Date.dayShortString ++ " - ")->React.string}
                    </Text>
                    <Text
                      style={array([Theme.text["callout"], theme.styles["textLight1"]])}
                      numberOfLines=1
                      adjustsFontSizeToFit=true>
                      {(event.startDate->Js.Date.fromString->Js.Date.getDate->Belt.Float.toString ++
                      " " ++
                      event.startDate->Js.Date.fromString->Date.monthShortString)->React.string}
                    </Text>
                  </View>
                  <Row style={Predefined.styles["alignCenter"]}>
                    <View
                      style={array([
                        theme.styles["backgroundGray3"],
                        viewStyle(
                          ~width=(duration /. maxDuration *. availableWidthForBar)->dp,
                          ~height=6.->dp,
                          ~borderRadius=6.,
                          ~overflow=#hidden,
                          (),
                        ),
                      ])}
                    />
                    <Spacer size=XXS />
                    <Text
                      style={array([Theme.text["footnote"], theme.styles["textLight1"]])}
                      numberOfLines=1
                      adjustsFontSizeToFit=true>
                      {durationString->React.string}
                    </Text>
                  </Row>
                </View>
              </Row>
              <View>
                <SpacedView vertical=XS horizontal=None>
                  <View style={Predefined.styles["row"]}>
                    <View style={Predefined.styles["flexGrow"]}>
                      <Text style={array([Theme.text["callout"], theme.styles["textLight1"]])}>
                        {Js.Date.fromString(event.startDate)
                        ->Js.Date.toTimeString
                        ->Js.String2.slice(~from=0, ~to_=5)
                        ->React.string}
                      </Text>
                      <Text style={array([Theme.text["callout"], theme.styles["text"]])}>
                        {Js.Date.fromString(event.endDate)
                        ->Js.Date.toTimeString
                        ->Js.String2.slice(~from=0, ~to_=5)
                        ->React.string}
                      </Text>
                    </View>
                    <Spacer size=S />
                  </View>
                </SpacedView>
              </View>
            </View>
            {index !== eventsWithDuration->Array.length - 1
              ? <Separator style={theme.styles["separatorOnBackground"]} />
              : React.null}
          </View>
        })
        ->React.array}
      </View>
    }}
  </View>
}
