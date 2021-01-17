open Belt
open ReactNative
open ReactMultiversal

let filterEventsByTitle = (
  events: array<ReactNativeCalendarEvents.calendarEventReadable>,
  title: string,
) => events->Array.keep(evt => !(!(evt.title == title)))

@react.component
let make = (
  ~today: Js.Date.t,
  ~todayFirst,
  ~previousFirst,
  ~startDate,
  ~supposedEndDate,
  ~activityTitle,
  // ~isVisible,
  ~style,
) => {
  let (_settings, _setSettings) = React.useContext(AppSettings.context)
  let (getEvents, _updatedAt, _requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let endDate = supposedEndDate->Date.min(today)
  let events =
    getEvents(startDate, endDate, false)
    ->Option.map(event => event->filterEventsByTitle(activityTitle))
    ->Option.getWithDefault([])

  <View style>
    <Spacer />
    <SpacedView vertical=None>
      <Text style={theme.styles["textLight2"]}>
        {if todayFirst == startDate {
          "Chronogram"
        } else if previousFirst == startDate {
          "Last Week's Chronogram"
        } else {
          startDate->Js.Date.getDate->Js.Float.toString ++
            (" - " ++
            (endDate->Js.Date.getDate->Js.Float.toString ++
              (" " ++
              (endDate->Date.monthShortString ++ " Chronogram"))))
        }->React.string}
      </Text>
    </SpacedView>
    <Spacer size=S />
    <SpacedView vertical=XS> <WeeklyGraphDetail events startDate supposedEndDate /> </SpacedView>
    <Spacer size=S />
  </View>
}
