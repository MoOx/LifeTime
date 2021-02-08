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
  // ~isVisible,
  ~style,
) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context)
  let (getEvents, _fetchEvents, _updatedAt, _requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let endDate = supposedEndDate->Date.min(today)
  let fetchedEvents = getEvents(startDate, endDate)
  let events = switch fetchedEvents {
  | Done(evts) => Some(evts)
  | _ => None
  }
  let mapTitleDuration =
    events->Option.map(es =>
      es->Calendars.filterEvents(settings)->Calendars.makeMapTitleDuration(startDate, endDate)
    )
  let mapCategoryDuration =
    events->Option.map(es =>
      es
      ->Calendars.filterEvents(settings)
      ->Calendars.makeMapCategoryDuration(settings, startDate, endDate)
    )
  <View style>
    <Spacer />
    <SpacedView vertical=None>
      <Text style={theme.styles["textLight2"]}>
        {if todayFirst == startDate {
          "Daily Average"
        } else if previousFirst == startDate {
          "Last Week's Average"
        } else {
          startDate->Js.Date.getDate->Js.Float.toString ++
            (" - " ++
            (endDate->Js.Date.getDate->Js.Float.toString ++
              (" " ++
              (endDate->Date.monthShortString ++ " Average"))))
        }->React.string}
      </Text>
    </SpacedView>
    <Spacer size=S />
    <SpacedView vertical=None>
      <WeeklyGraph events mapCategoryDuration startDate supposedEndDate />
    </SpacedView>
    <Spacer size=S />
    <View style={Predefined.styles["row"]}>
      <Spacer size=S />
      <View style={Predefined.styles["flexGrow"]}>
        <ListSeparator />
        <SpacedView horizontal=None vertical=S style={Predefined.styles["row"]}>
          <View style={Predefined.styles["flexGrow"]}>
            <Text
              style={
                open Style
                array([Theme.text["callout"], theme.styles["text"]])
              }>
              {"Total Logged Time"->React.string}
            </Text>
          </View>
          <Text>
            <Text
              style={
                open Style
                array([Theme.text["callout"], theme.styles["textLight1"]])
              }>
              {mapTitleDuration
              ->Option.map(mapTitleDuration =>
                mapTitleDuration->Array.reduce(0., (total, (_title, duration)) => total +. duration)
              )
              ->Option.getWithDefault(0.)
              ->Date.minToString
              ->React.string}
            </Text>
          </Text>
          <Spacer size=S />
        </SpacedView>
      </View>
    </View>
  </View>
}
