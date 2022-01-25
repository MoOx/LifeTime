open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = (~activityTitle, ~refreshing, ~onRefreshDone, ~onSkipActivity, ~currentWeek) => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let (getEvents, fetchEvents, _updatedAt, requestUpdate) = React.useContext(Calendars.context)

  let appStateUpdateIsActive = ReactNativeHooks.useAppStateUpdateIsActive()
  React.useEffect2(() => {
    if appStateUpdateIsActive {
      requestUpdate()
    }
    None
  }, (appStateUpdateIsActive, requestUpdate))

  let (today, todayUpdate) = Date.Hooks.useToday()

  React.useEffect4(() => {
    if refreshing {
      Log.info("ActivityOption: refreshing...")
      todayUpdate()
      requestUpdate()
      onRefreshDone()
    }
    None
  }, (refreshing, todayUpdate, requestUpdate, onRefreshDone))

  let (startDate, endDate) = React.useMemo2(() => {
    let (startDateStr, supposedEndDateStr) = currentWeek->Option.getWithDefault({
      let (start, supposedEnd) = Date.weekDates(today)
      let end = supposedEnd->Date.min(today)
      (start->Js.Date.toISOString, end->Js.Date.toISOString)
    })
    (startDateStr->Js.Date.fromString, supposedEndDateStr->Js.Date.fromString->Date.min(today))
  }, (currentWeek, today))

  let fetchedEvents = getEvents(startDate, endDate)
  React.useEffect4(() => {
    switch fetchedEvents {
    | NotAsked => fetchEvents(startDate, endDate)
    | _ => ()
    }
    None
  }, (fetchEvents, fetchedEvents, startDate, endDate))
  let events = switch fetchedEvents {
  | Done(events) => Some(events)
  | _ => None
  }

  let filteredEvents =
    events
    ->Option.map(event =>
      event
      ->Calendars.filterEvents(
        settings.calendarsSkipped,
        settings.activitiesSkippedFlag,
        settings.activitiesSkipped,
      )
      ->Calendars.filterEventsByTitle(activityTitle)
      ->Calendars.sortEventsByDecreasingStartDate
    )
    ->Option.getWithDefault([])

  let themeModeKey = AppSettings.useTheme()
  let theme = Theme.useTheme(themeModeKey)
  let isSkipped =
    settings.activitiesSkipped->Array.some(skipped => Activities.isSimilar(skipped, activityTitle))
  <SpacedView horizontal=None>
    <Row> <Spacer size=XS /> <BlockHeading text="Category" /> </Row>
    <ListSeparator />
    {ActivityCategories.defaults
    ->List.mapWithIndex((index, (id, name, colorName, iconName)) => {
      let color = colorName->ActivityCategories.getColor(theme.mode)
      <React.Fragment key=id>
        <ListItem
          testID={"ActivityOption_Category_" ++ id}
          onPress={_ => {
            let createdAt = Js.Date.now()
            setSettings(settings => {
              ...settings,
              lastUpdated: Js.Date.now(),
              activities: settings.activities
              ->Array.keep(acti => !Activities.isSimilar(acti.title, activityTitle))
              ->Array.concat([
                {
                  id: Utils.makeId(activityTitle, createdAt),
                  title: activityTitle,
                  createdAt: createdAt,
                  categoryId: id,
                },
              ]),
            })
          }}
          left={<NamedIcon name=iconName fill=color />}
          right={id != activityTitle->Calendars.categoryIdFromActivityTitle(settings.activities)
            ? <SVGCircle width={26.->dp} height={26.->dp} fill=color />
            : <SVGCheckmarkcircle width={26.->dp} height={26.->dp} fill=color />}>
          <ListItemText> {name->React.string} </ListItemText>
        </ListItem>
        {index !== ActivityCategories.defaults->List.length - 1
          ? <ListSeparator spaceStart={Spacer.size(S) *. 2. +. NamedIcon.size} />
          : React.null}
      </React.Fragment>
    })
    ->List.toArray
    ->React.array}
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer size=S />
    <Row> <Spacer size=XS /> <BlockHeading text="Events" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <Events startDate endDate events=filteredEvents />
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer size=L />
    <ListSeparator />
    <ListItem
      onPress={_ => {
        setSettings(settings => {
          let isSkipped =
            settings.activitiesSkipped->Array.some(skipped =>
              Activities.isSimilar(skipped, activityTitle)
            )
          {
            ...settings,
            lastUpdated: Js.Date.now(),
            activitiesSkipped: !isSkipped
              ? settings.activitiesSkipped->Array.concat([activityTitle])
              : settings.activitiesSkipped->Array.keep(alreadySkipped =>
                  !Activities.isSimilar(alreadySkipped, activityTitle)
                ),
          }
        })
        onSkipActivity()
      }}>
      <ListItemText color=theme.colors.red center=true>
        {(!isSkipped ? "Hide Activity" : "Reveal Activity")->React.string}
      </ListItemText>
    </ListItem>
    <ListSeparator />
    <BlockFootnote>
      {(
        !isSkipped
          ? "This will hide similar activities from all reports."
          : "This will reveal similar activities in all reports."
      )->React.string}
    </BlockFootnote>
  </SpacedView>
}
