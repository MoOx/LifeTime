open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

let title = "Goals"

@react.component
let make = (
  ~activities,
  ~activitiesSkipped,
  ~activitiesSkippedFlag,
  ~calendarsSkipped,
  ~goals: array<Goal.t>,
  ~onEditGoalPress,
  ~onNewGoalPress,
) => {
  let (getEvents, fetchEvents, _updatedAt, _requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let (today, _todayUpdate) = Date.Hooks.useToday()
  let todayDates = Date.Hooks.useWeekDates(today)

  let (startDate, supposedEndDate) = todayDates
  let endDate = supposedEndDate->Date.min(today)
  let endDateTonight = endDate->Date.endOfDay
  let remainingMinThisWeek =
    (supposedEndDate->Js.Date.getTime -. endDate->Js.Date.getTime)->Date.msToMin
  let fetchedEvents = getEvents(startDate, endDate)
  React.useEffect4(() => {
    // Log.info(("Goals fetchEvents", startDate, endDate))
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
  let mapTitleDuration =
    events->Option.map(es =>
      es
      ->Calendars.filterEvents(calendarsSkipped, activitiesSkippedFlag, activitiesSkipped)
      ->Calendars.makeMapTitleDuration(startDate, endDate)
    )
  let mapCategoryDuration =
    events->Option.map(es =>
      es
      ->Calendars.filterEvents(calendarsSkipped, activitiesSkippedFlag, activitiesSkipped)
      ->Calendars.makeMapCategoryDuration(activities, startDate, endDate)
    )

  let (debug, debug_set) = React.useState(() => false)
  let (forceWelcomeContent, forceWelcomeContent_set) = React.useState(() => false)

  <>
    <SpacedView>
      <TitlePre> {" "->React.string} </TitlePre>
      <View style={Predefined.styles["rowSpaceBetween"]}>
        <Text
          allowFontScaling=false
          style={array([Theme.text["largeTitle"], Theme.text["weight700"], theme.styles["text"]])}>
          {title->React.string}
        </Text>
        <View style={Predefined.styles["row"]}>
          {Global.__DEV__
            ? <>
                <TouchableOpacity
                  hitSlop=HitSlops.m
                  onPress={_ =>
                    forceWelcomeContent_set(forceWelcomeContent => !forceWelcomeContent)}>
                  <View style={Style.style(~opacity=0.10, ())}>
                    <SVGInfo width={24.->dp} height={24.->dp} fill=theme.namedColors.text />
                  </View>
                </TouchableOpacity>
                <Spacer size=S />
                <TouchableOpacity hitSlop=HitSlops.m onPress={_ => debug_set(debug => !debug)}>
                  <View style={Style.style(~opacity=0.10, ())}>
                    <SVGScope width={24.->dp} height={24.->dp} fill=theme.namedColors.text />
                  </View>
                </TouchableOpacity>
                <Spacer size=S />
              </>
            : React.null}
          <TouchableOpacity
            testID="Goals_Button_AddAGoal"
            hitSlop=HitSlops.m
            onPress={_ => onNewGoalPress(Goal.Type.serializedGoal)}>
            <SVGPlus width={24.->dp} height={24.->dp} fill=theme.namedColors.text />
          </TouchableOpacity>
        </View>
      </View>
    </SpacedView>
    {goals->Array.length > 0 && !forceWelcomeContent
      ? React.null
      : <>
          <SpacedView vertical=None horizontal=S>
            <Text style={array([Theme.text["subhead"], theme.styles["textOnDarkLight"]])}>
              {j`LifeTime lets you visualize the time you spend on everything. This allows you to take more informed decisions about how to use your valuable time.`->React.string}
            </Text>
            <Spacer size=XS />
            <Text style={array([Theme.text["subhead"], theme.styles["textOnDarkLight"]])}>
              {j`You can help yourself by adding goals & limits you would like to respect. LifeTime will try to remind you when you successfully achieve your goals & respect your limits and can help your to improve your self-discipline if needed.`->React.string}
            </Text>
          </SpacedView>
          <Spacer size=L />
          <View style={Predefined.styles["rowSpaceBetween"]}>
            <Row> <Spacer size=XS /> <BlockHeading text="Minimum to achieve" /> </Row>
            <Row> <Spacer size=XS /> </Row>
          </View>
          <ListSeparator />
          <View style={theme.styles["background"]}>
            <TouchableOpacity onPress={_ => onNewGoalPress(Goal.Type.serializedGoal)}>
              <View style={Predefined.styles["rowCenter"]}>
                <Spacer size=S />
                <SpacedView vertical=XS horizontal=None>
                  <NamedIcon name=#scope fill=theme.colors.green />
                </SpacedView>
                <Spacer size=XS />
                <View style={Predefined.styles["flexGrow"]}>
                  <Text style={array([Theme.text["body"], theme.styles["text"]])}>
                    {"Add a Goal"->React.string}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <ListSeparator />
          <Spacer />
          <View style={Predefined.styles["rowSpaceBetween"]}>
            <Row> <Spacer size=XS /> <BlockHeading text="Maximum to respect" /> </Row>
            <Row> <Spacer size=XS /> </Row>
          </View>
          <ListSeparator />
          <View style={theme.styles["background"]}>
            <TouchableOpacity onPress={_ => onNewGoalPress(Goal.Type.serializedLimit)}>
              <View style={Predefined.styles["rowCenter"]}>
                <Spacer size=S />
                <SpacedView vertical=XS horizontal=None>
                  <NamedIcon name=#hourglass fill=theme.colors.orange />
                </SpacedView>
                <Spacer size=XS />
                <View style={Predefined.styles["flexGrow"]}>
                  <Text style={array([Theme.text["body"], theme.styles["text"]])}>
                    {"Add a Limit"->React.string}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <ListSeparator />
        </>}
    <SpacedView horizontal=XS vertical=None>
      {!debug
        ? React.null
        : <Text style={array([theme.styles["textOnDarkLight"], textStyle(~fontSize=7.5, ())])}>
            {"remainingMinThisWeek: "->React.string}
            {remainingMinThisWeek->Date.minToString->React.string}
            {"\n"->React.string}
          </Text>}
      {forceWelcomeContent
        ? React.null
        : goals
          ->Array.map(goal => {
            <GoalCard
              key=goal.id
              activities
              debug
              endDate
              endDateTonight
              goal
              mapCategoryDuration
              mapTitleDuration
              onEditGoalPress
              remainingMinThisWeek
              startDate
              supposedEndDate
            />
          })
          ->React.array}
    </SpacedView>
  </>
}
