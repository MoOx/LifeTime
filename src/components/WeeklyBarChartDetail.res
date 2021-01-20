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
  ~style,
) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context)
  let (getEvents, _updatedAt, _requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let endDate = supposedEndDate->Date.min(today)
  let events =
    getEvents(startDate, endDate, false)
    ->Option.map(event => event->filterEventsByTitle(activityTitle))
    ->Option.getWithDefault([])

  let categoryId = settings->Calendars.categoryIdFromActivityTitle(activityTitle)

  <View style>
    <Spacer />
    <SpacedView vertical=None>
      <Text style={theme.styles["textLight2"]}>
        {if todayFirst == startDate {
          "Events"
        } else if previousFirst == startDate {
          "Last Week's Events"
        } else {
          startDate->Js.Date.getDate->Js.Float.toString ++
            (" - " ++
            (endDate->Js.Date.getDate->Js.Float.toString ++
              (" " ++
              (endDate->Date.monthShortString ++ " Events"))))
        }->React.string}
      </Text>
    </SpacedView>
    <Spacer size=S />
    <SpacedView vertical=XS> <WeeklyGraphDetail events startDate supposedEndDate categoryId /> </SpacedView>
    <Spacer size=S />
  </View>
}
