open Belt
open ReactNative
open ReactMultiversal

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
  let (getEvents, fetchEvents, _updatedAt, _requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let endDate = supposedEndDate->Date.min(today)

  let fetchedEvents = getEvents(startDate, endDate)
  React.useEffect4(() => {
    switch fetchedEvents {
    | NotAsked => fetchEvents(startDate, endDate)
    | _ => ()
    }
    None
  }, (fetchEvents, fetchedEvents, startDate, endDate))
  let events = switch fetchedEvents {
  | Done(evts) => Some(evts)
  | _ => None
  }

  let filteredEvents =
    events
    ->Option.map(event => event->Calendars.filterEventsByTitle(activityTitle))
    ->Option.getWithDefault([])

  let categoryId = activityTitle->Calendars.categoryIdFromActivityTitle(settings.activities)

  <View style>
    <Spacer />
    <SpacedView vertical=None>
      <Text style={theme.styles["textLight2"]}>
        {if todayFirst == startDate {
          "Current Week's Events"
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
    <SpacedView vertical=XS>
      <WeeklyGraphDetail events=filteredEvents startDate supposedEndDate categoryId />
    </SpacedView>
    <Spacer size=S />
  </View>
}
