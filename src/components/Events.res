open Belt
open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {"text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ())}
}->StyleSheet.create

@react.component
let make = (
  ~events: array<ReactNativeCalendarEvents.calendarEventReadable>,
  ~startDate: Js.Date.t,
  ~endDate: Js.Date.t,
) => {
  let themeModeKey = AppSettings.useTheme()
  let theme = Theme.useTheme(themeModeKey)
  switch events->Array.length {
  | 0 => <> </>
  | _x =>
    <View>
      <Row>
        <Spacer size=XS />
        <BlockHeading
          style={theme.styles["background"]}
          text={startDate->Js.Date.getDate->Belt.Float.toString ++
          " - " ++
          endDate->Js.Date.getDate->Belt.Float.toString ++
          " " ++
          endDate->Date.monthShortString}
        />
      </Row>
      <Separator style={theme.styles["separatorOnBackground"]} />
      {events->Array.mapWithIndex((index, el) => {
        let duration =
          Js.Date.getTime(el.endDate->Js.Date.fromString) -.
          Js.Date.getTime(el.startDate->Js.Date.fromString)
        let durationString = (duration /. 1000. /. 60.)->Date.minToString
        <View key=el.id>
          <View style={Predefined.styles["rowSpaceBetween"]}>
            <Row>
              <Spacer size=S />
              <View>
                <Text
                  style={Style.array([styles["text"], theme.styles["textLight1"]])}
                  numberOfLines=1
                  adjustsFontSizeToFit=true>
                  {(endDate->Js.Date.getDate->Belt.Float.toString ++
                  " " ++
                  endDate->Date.monthShortString)->React.string}
                </Text>
                <Row style={Predefined.styles["alignCenter"]}>
                  <View
                    style={
                      open Style
                      array([
                        theme.styles["backgroundGray3"],
                        viewStyle(
                          // ~backgroundColor=color,
                          ~width=15.->dp,
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
                      array([Theme.text["footnote"], theme.styles["textLight2"]])
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
                      {(Js.Date.fromString(el.startDate)->Js.Date.getHours->Belt.Float.toString ++
                      ":" ++
                      Js.Date.fromString(el.startDate)->Js.Date.getMinutes->Belt.Float.toString)
                        ->React.string}
                    </Text>
                    <Text style={Style.array([styles["text"], theme.styles["text"]])}>
                      {(Js.Date.fromString(el.endDate)->Js.Date.getHours->Belt.Float.toString ++
                      ":" ++
                      Js.Date.fromString(el.endDate)->Js.Date.getMinutes->Belt.Float.toString)
                        ->React.string}
                    </Text>
                  </View>
                  <Spacer size=S />
                </View>
              </SpacedView>
            </View>
          </View>
          {index !== events->Array.length - 1
            ? <Separator style={theme.styles["separatorOnBackground"]} />
            : React.null}
        </View>
      })->React.array}
    </View>
  }
}
