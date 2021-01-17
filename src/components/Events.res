open Belt
open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {"text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ())}
}->StyleSheet.create

let padTime = (time: string) => ("00" ++ time)->Js.String2.sliceToEnd(~from=-2)

@react.component
let make = (
  ~eventsWithDuration: array<(ReactNativeCalendarEvents.calendarEventReadable, float)>,
  ~maxDuration: float,
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

  let availableWidthForBar = width -. 85. -. SpacedView.space *. 4.

  switch eventsWithDuration->Array.length {
  | 0 => <> </>
  | _x =>
    <View onLayout>
      <Row>
        <Spacer size=S />
        <BlockHeading
          style={Style.array([theme.styles["background"], theme.styles["text"]])}
          text={startDate->Js.Date.getDate->Belt.Float.toString ++
          " - " ++
          endDate->Js.Date.getDate->Belt.Float.toString ++
          " " ++
          endDate->Date.monthShortString}
        />
      </Row>
      <Separator style={theme.styles["separatorOnBackground"]} />
      {eventsWithDuration->Array.mapWithIndex((index, eventWithDuration) => {
        let (event, duration) = eventWithDuration
        let durationString = duration->Date.minToString
        <View key=event.id>
          <View style={Predefined.styles["rowSpaceBetween"]}>
            <Row>
              <Spacer size=S />
              <View>
                <Text
                  style={Style.array([styles["text"], theme.styles["textLight1"]])}
                  numberOfLines=1
                  adjustsFontSizeToFit=true>
                  {(event.endDate->Js.Date.fromString->Js.Date.getDate->Belt.Float.toString ++
                  " " ++
                  event.endDate->Js.Date.fromString->Date.monthShortString)->React.string}
                </Text>
                <Row style={Predefined.styles["alignCenter"]}>
                  <View
                    style={
                      open Style
                      array([
                        theme.styles["backgroundGray3"],
                        viewStyle(
                          ~width=(duration /. maxDuration *. availableWidthForBar)->dp,
                          ~height=6.->dp,
                          ~borderRadius=6.,
                          ~overflow=#hidden,
                          (),
                        ),
                      ])
                    }
                  />
                  <Spacer size=XXS />
                  <Text
                    style={
                      open Style
                      array([Theme.text["footnote"], theme.styles["textLight1"]])
                    }
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
                    <Text style={Style.array([styles["text"], theme.styles["textLight1"]])}>
                      {(Js.Date.fromString(event.startDate)
                      ->Js.Date.getHours
                      ->Belt.Float.toString
                      ->padTime ++
                      ":" ++
                      Js.Date.fromString(event.startDate)
                      ->Js.Date.getMinutes
                      ->Belt.Float.toString
                      ->padTime)->React.string}
                    </Text>
                    <Text style={Style.array([styles["text"], theme.styles["text"]])}>
                      {(Js.Date.fromString(event.endDate)
                      ->Js.Date.getHours
                      ->Belt.Float.toString
                      ->padTime ++
                      ":" ++
                      Js.Date.fromString(event.endDate)
                      ->Js.Date.getMinutes
                      ->Belt.Float.toString
                      ->padTime)->React.string}
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
      })->React.array}
    </View>
  }
}
