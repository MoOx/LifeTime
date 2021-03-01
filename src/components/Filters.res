open Belt
open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {
    "container": viewStyle(~flexGrow=1., ()),
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
      <Row>
        {isCalendarButtonHide
          ? <BlockHeadingTouchable
              onPress={_ =>
                setSettings(_settings => {
                  ...settings,
                  lastUpdated: Js.Date.now(),
                  calendarsSkipped: calendars
                  ->Option.map(cs =>
                    cs->Array.map(c => {
                      open AppSettings
                      {
                        id: c.id,
                        title: c.title,
                        source: c.source,
                        color: c.color,
                      }
                    })
                  )
                  ->Option.getWithDefault([]),
                })}
              text="Hide All"
            />
          : <BlockHeadingTouchable
              onPress={_ =>
                setSettings(_settings => {
                  ...settings,
                  lastUpdated: Js.Date.now(),
                  calendarsSkipped: [],
                })}
              text="Show All"
            />}
        <Spacer size=XS />
      </Row>
    </View>
    <ListSeparator />
    {calendars
    ->Option.map(calendars =>
      calendars
      ->Array.mapWithIndex((index, calendar) =>
        <React.Fragment key=calendar.id>
          <ListItem
            right={settings.calendarsSkipped->Array.some(c => c.id == calendar.id)
              ? {
                  <SVGCircle width={26.->Style.dp} height={26.->Style.dp} fill=calendar.color />
                }
              : {
                  <SVGCheckmarkcircle
                    width={26.->Style.dp} height={26.->Style.dp} fill=calendar.color
                  />
                }}
            onPress={_ =>
              setSettings(settings => {
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
            <ListItemText> {calendar.title->React.string} </ListItemText>
            <Text style={Style.array([Theme.text["caption1"], theme.styles["textGray2"]])}>
              {calendar.source->React.string}
            </Text>
          </ListItem>
          {index !== calendars->Array.length - 1
            ? <ListSeparator spaceStart={Spacer.size(S)} />
            : React.null}
        </React.Fragment>
      )
      ->React.array
    )
    ->Option.getWithDefault(React.null)}
    <ListSeparator />
  </>
}
