open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

let title = "Your LifeTime"

type callback<'input, 'output> = 'input => 'output
@module("react")
external useCallback8: (
  @uncurry ('input => 'output),
  ('a, 'b, 'c, 'd, 'e, 'f, 'g, 'h),
) => callback<'input, 'output> = "useCallback"

@react.component
let make = (~onGetStarted, ~refreshing, ~onRefreshDone, ~onFiltersPress, ~onActivityPress) => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let (getEvents, fetchEvents, updatedAt, requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())
  let windowDimensions = Dimensions.useWindowDimensions()
  let styleWidth = React.useMemo1(() => {
    style(~width=windowDimensions.width->dp, ())
  }, [windowDimensions.width])

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
      Log.info("Home: refreshing...")
      todayUpdate()
      requestUpdate()
      onRefreshDone()
    }
    None
  }, (refreshing, todayUpdate, requestUpdate, onRefreshDone))

  let todayDates = Date.Hooks.useWeekDates(today)

  let previousDates = React.useMemo1(() => Date.weekDates(today->DateFns.addDays(-7.)), [today])
  let last5Weeks = React.useMemo1(
    () =>
      Array.range(0, 5)
      ->Array.map(currentWeekReverseIndex =>
        Date.weekDates(today->DateFns.addDays((-currentWeekReverseIndex * 7)->Js.Int.toFloat))
      )
      ->Array.reverse,
    [today],
  )

  let (currentDates, currentDates_set) = React.useState(() =>
    last5Weeks[last5Weeks->Array.length - 1]->Option.getWithDefault(todayDates)
  )
  let (startDate, supposedEndDate) = currentDates
  let endDate = supposedEndDate->Date.min(today)
  let (todayFirst, _) = todayDates
  let (previousFirst, _) = previousDates

  let fetchedEvents = getEvents(startDate, endDate)
  React.useEffect4(() => {
    // Log.info(("Home fetchEvents", startDate, endDate))
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
  let mapTitleDuration =
    events->Option.map(es =>
      es
      ->Calendars.filterEvents(
        settings.calendarsSkipped,
        settings.activitiesSkippedFlag,
        settings.activitiesSkipped,
      )
      ->Calendars.makeMapTitleDuration(startDate, endDate)
    )

  let scrollViewRef = React.useRef(Js.Nullable.null)
  let scrollViewSpace = SpacedView.M
  let scrollViewWidth =
    windowDimensions.width -. SpacedView.size(scrollViewSpace)->Option.getWithDefault(0.) *. 2.

  let onMomentumScrollEnd = React.useCallback5((event: Event.scrollEvent) => {
    let x = event.nativeEvent.contentOffset.x
    let index = (x /. scrollViewWidth)->Js.Math.unsafe_round
    let dates = last5Weeks[index]->Option.getWithDefault(todayDates)
    if dates !== currentDates {
      currentDates_set(_ => dates)
    }
  }, (currentDates_set, currentDates, todayDates, scrollViewWidth, last5Weeks))

  let onShowThisWeek = React.useCallback2(_ => {
    // scrollToIndexParams triggers the currentDates_set
    // currentDates_set(_ => todayDates.current);
    scrollViewRef.current
    ->Js.Nullable.toOption
    ->Option.map(scrollView => scrollView->ScrollView.scrollToEnd)
    ->ignore
    currentDates_set(_ => todayDates)
  }, (currentDates_set, todayDates))

  // scroll to current week on load
  React.useEffect0(() => {
    AnimationFrame.request(() => {
      scrollViewRef.current
      ->Js.Nullable.toOption
      ->Option.map(scrollView => scrollView->ScrollView.scrollToEnd)
      ->ignore
    })->ignore
    None
  })

  <>
    <SpacedView>
      <View testID="Home_TitlePre">
        <TitlePre style={theme.styles["textOnDarkLight"]}>
          {{
            open Date
            today->Js.Date.getDay->dayLongString ++
              (" " ++
              (today->dateString ++ (" " ++ today->monthLongString)))
          }
          ->Js.String.toUpperCase
          ->React.string}
        </TitlePre>
      </View>
      <View style={Predefined.styles["rowSpaceBetween"]}>
        <Text
          allowFontScaling=false
          style={array([Theme.text["largeTitle"], Theme.text["weight700"], theme.styles["text"]])}>
          {title->React.string}
        </Text>
        <View style={Predefined.styles["row"]}>
          {Global.__DEV__
            ? <>
                {Global.hermesInternal != None
                  ? <Text style={array([theme.styles["textOnDarkLight"], Theme.text["caption2"]])}>
                      {"Hermes on"->React.string}
                    </Text>
                  : React.null}
                <Spacer size=XS />
                <TouchableOpacity
                  testID="Home_DemoFullRefresh"
                  hitSlop=HitSlops.m
                  onPress={_ => {
                    Demo.fullRefresh()->ignore
                  }}>
                  <View style={Style.style(~opacity=0.10, ())}>
                    <SVGBroom width={24.->dp} height={24.->dp} fill=theme.namedColors.text />
                  </View>
                </TouchableOpacity>
              </>
            : React.null}
        </View>
      </View>
    </SpacedView>
    <View> <NoEventBox onGetStarted onFiltersPress today todayDates last5Weeks /> </View>
    <View style={Predefined.styles["rowSpaceBetween"]}>
      <Row> <Spacer size=XS /> <BlockHeading text="Weekly Chart" /> </Row>
      <Row>
        {todayFirst == startDate
          ? React.null
          : <BlockHeadingTouchable onPress=onShowThisWeek text="Show This Week" />}
        <Spacer size=XS />
      </Row>
    </View>
    <ListSeparator />
    <View style={array([theme.styles["background"], styleWidth])}>
      <Spacer />
      <SpacedView vertical=None horizontal=scrollViewSpace>
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
        <ScrollView
          testID="Home_ScrollView_WeeklyGraph"
          ref={scrollViewRef->Ref.value}
          horizontal=true
          pagingEnabled=true
          showsHorizontalScrollIndicator=false
          onMomentumScrollEnd
          style={array([Predefined.styles["row"], Predefined.styles["flexGrow"]])}>
          {last5Weeks
          ->Array.map(((currentStartDate, currentSupposedEndDate)) => {
            let endDate = currentSupposedEndDate->Date.min(today)
            let fetchedEvents = getEvents(currentStartDate, endDate)
            let events = switch fetchedEvents {
            | Done(evts) => Some(evts)
            | _ => None
            }
            let mapCategoryDuration =
              events->Option.map(es =>
                es
                ->Calendars.filterEvents(
                  settings.calendarsSkipped,
                  settings.activitiesSkippedFlag,
                  settings.activitiesSkipped,
                )
                ->Calendars.makeMapCategoryDuration(settings.activities, currentStartDate, endDate)
              )
            <WeeklyGraph
              key={currentStartDate->Js.Date.toString}
              activities=settings.activities
              activitiesSkipped=settings.activitiesSkipped
              activitiesSkippedFlag=settings.activitiesSkippedFlag
              calendarsSkipped=settings.calendarsSkipped
              events
              mapCategoryDuration
              startDate=currentStartDate
              supposedEndDate=currentSupposedEndDate
              width=scrollViewWidth
            />
          })
          ->React.array}
        </ScrollView>
      </SpacedView>
      <Spacer size=S />
      <ListSeparator spaceStart={Spacer.size(S)} />
      <View style={Predefined.styles["row"]}>
        <Spacer size=S />
        <View style={Predefined.styles["flexGrow"]}>
          <SpacedView horizontal=None vertical=S style={Predefined.styles["row"]}>
            <View style={Predefined.styles["flexGrow"]}>
              <Text style={array([Theme.text["callout"], theme.styles["text"]])}>
                {"Total Logged Time"->React.string}
              </Text>
            </View>
            <Text>
              <Text style={array([Theme.text["callout"], theme.styles["textLight1"]])}>
                {mapTitleDuration
                ->Option.map(mapTitleDuration =>
                  mapTitleDuration->Array.reduce(0., (total, (_title, duration)) =>
                    total +. duration
                  )
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
    <ListSeparator />
    <BlockFootnote>
      {("Updated " ++ Date.formatRelative(updatedAt, today))->React.string}
      <Spacer size=XS />
      {!refreshing ? React.null : <ActivityIndicator size={ActivityIndicator.Size.exact(8.)} />}
    </BlockFootnote>
    <Spacer />
    <TopActivities
      activities=settings.activities
      mapTitleDuration
      onFiltersPress
      onActivityPress
      startDate
      endDate
    />
    <Spacer />
    <SpacedView horizontal=None>
      <ListSeparator />
      <ListItem
        onPress={_ =>
          setSettings(settings => {
            ...settings,
            lastUpdated: Js.Date.now(),
            activitiesSkippedFlag: !settings.activitiesSkippedFlag,
          })}>
        <ListItemText color=theme.colors.blue center=true>
          {(
            settings.activitiesSkippedFlag ? "Reveal Hidden Activities" : "Mask Hidden Activities"
          )->React.string}
        </ListItemText>
      </ListItem>
      <ListSeparator />
    </SpacedView>
    <Spacer />
  </>
}
