open Belt
open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {
    "container": viewStyle(~flexGrow=1., ()),
    "options": viewStyle(~flexDirection=#row, ~justifyContent=#flexEnd, ()),
    "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    "infoText": textStyle(~fontSize=12., ~lineHeight=12. *. 1.4, ()),
    "durationText": textStyle(~fontSize=12., ~lineHeight=12., ~fontWeight=#_700, ()),
  }
}->StyleSheet.create

let title = "Filters"

@react.component
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())
  let calendars = Calendars.useCalendars()
  let isCalendarButtonHide = settings.calendarsSkipped->Array.length === 0
  <>
    <View style={Predefined.styles["rowSpaceBetween"]}>
      <Row> <Spacer size=XS /> <BlockHeading text="Calendars" /> </Row>
      <Row> {isCalendarButtonHide ? <BlockHeadingTouchable onPress={_ => setSettings(_settings => {
                  ...settings,
                  lastUpdated: Js.Date.now(),
                  calendarsSkipped: calendars->Option.map(cs => cs->Array.map(c => {
                      open AppSettings
                      {
                        id: c.id,
                        title: c.title,
                        source: c.source,
                        color: c.color,
                      }
                    }))->Option.getWithDefault([]),
                })} text="Hide All" /> : <BlockHeadingTouchable
              onPress={_ => setSettings(_settings => {
                  ...settings,
                  lastUpdated: Js.Date.now(),
                  calendarsSkipped: [],
                })} text="Show All"
            />} <Spacer size=XS /> </Row>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      {calendars->Option.map(calendars => calendars->Array.mapWithIndex((index, calendar) =>
          <TouchableOpacity key=calendar.id onPress={_ => setSettings(settings => {
                ...settings,
                lastUpdated: Js.Date.now(),
                calendarsSkipped: if (
                  settings.calendarsSkipped->Array.some(c => c.id == calendar.id)
                ) {
                  settings.calendarsSkipped->Array.keep(c => c.id != calendar.id)
                } else {
                  settings.calendarsSkipped->Array.concat([
                    {
                      open AppSettings
                      {
                        id: calendar.id,
                        title: calendar.title,
                        source: calendar.source,
                        color: calendar.color,
                      }
                    },
                  ])
                },
              })}>
            <View style={Predefined.styles["row"]}>
              <Spacer size=S />
              <View style={Predefined.styles["flexGrow"]}>
                <SpacedView vertical=XS horizontal=None style={Predefined.styles["rowCenter"]}>
                  <View style={Predefined.styles["flexGrow"]}>
                    <Text style={Style.array([styles["text"], theme.styles["textOnBackground"]])}>
                      {calendar.title->React.string}
                    </Text>
                    <Text style={Style.array([styles["infoText"], theme.styles["textGray2"]])}>
                      {calendar.source->React.string}
                    </Text>
                  </View>
                  {
                    let skipped = settings.calendarsSkipped->Array.some(c => c.id == calendar.id)
                    if skipped {
                      <SVGCircle width={26.->Style.dp} height={26.->Style.dp} fill=calendar.color />
                    } else {
                      <SVGCheckmarkcircle
                        width={26.->Style.dp} height={26.->Style.dp} fill=calendar.color
                      />
                    }
                  }
                  <Spacer size=S />
                </SpacedView>
                {index !== calendars->Array.length - 1
                  ? <Separator style={theme.styles["separatorOnBackground"]} />
                  : React.null}
              </View>
            </View>
          </TouchableOpacity>
        )->React.array)->Option.getWithDefault(
        React.null,
      )} <Separator style={theme.styles["separatorOnBackground"]} />
    </View>
  </>
}
