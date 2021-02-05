open Belt
open ReactNative
open ReactMultiversal
open VirtualizedList

let title = "Your LifeTime"

@react.component
let make = (~onGetStarted, ~refreshing, ~onRefreshDone, ~onFiltersPress, ~onActivityPress) => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let (getEvents, updatedAt, requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())
  let windowDimensions = Dimensions.useWindowDimensions()
  let styleWidth = {
    open Style
    style(~width=windowDimensions.width->dp, ())
  }

  React.useEffect3(() => {
    if refreshing {
      requestUpdate()
      onRefreshDone()
    }
    None
  }, (refreshing, requestUpdate, onRefreshDone))

  React.useEffect1(() => {
    let handleAppStateChange = newAppState =>
      if newAppState == #active {
        requestUpdate()
      }

    AppState.addEventListener(#change(state => handleAppStateChange(state)))
    Some(() => AppState.removeEventListener(#change(state => handleAppStateChange(state))))
  }, [requestUpdate])

  let (today, today_set) = React.useState(() => Date.now())
  let appState = ReactNativeHooks.useAppState()
  React.useEffect2(() => {
    open Js.Date
    let now = Date.now()
    // only update today when active AND there is an relevant diff
    if appState === #active && now->getTime -. today->getTime > 1000. *. 5. {
      today_set(_ => now)
    }
    None
  }, (appState, today_set))
  let (todayDates, todayDates_set) = React.useState(() => Date.weekDates(today))
  React.useEffect2(() => {
    todayDates_set(_ => Date.weekDates(today))
    None
  }, (today, todayDates_set))
  let (previousDates, previousDates_set) = React.useState(() =>
    Date.weekDates(today->DateFns.addDays(-7.))
  )
  React.useEffect2(() => {
    previousDates_set(_ => Date.weekDates(today->DateFns.addDays(-7.)))
    None
  }, (today, previousDates_set))
  let (last5Weeks, last5Weeks_set) = React.useState(() =>
    Array.range(0, 5)->Array.map(currentWeekReverseIndex =>
      Date.weekDates(today->DateFns.addDays((-currentWeekReverseIndex * 7)->Js.Int.toFloat))
    )
  )
  React.useEffect2(() => {
    last5Weeks_set(_ =>
      Array.range(0, 5)->Array.map(currentWeekReverseIndex =>
        Date.weekDates(today->DateFns.addDays((-currentWeekReverseIndex * 7)->Js.Int.toFloat))
      )
    )
    None
  }, (today, last5Weeks_set))

  let ((startDate, supposedEndDate), currentDates_set) = React.useState(() =>
    last5Weeks[0]->Option.getWithDefault(todayDates)
  )

  let endDate = supposedEndDate->Date.min(today)

  let (todayFirst, _) = todayDates
  let (previousFirst, _) = previousDates

  let events = getEvents(startDate, endDate, true)
  let mapTitleDuration =
    events->Option.map(es =>
      es->Calendars.filterEvents(settings)->Calendars.makeMapTitleDuration(startDate, endDate)
    )

  let flatListRef = React.useRef(Js.Nullable.null)

  let getItemLayout = React.useMemo1(((), _items, index) => {
    length: windowDimensions.width,
    offset: windowDimensions.width *. index->float,
    index: index,
  }, [windowDimensions.width])

  let renderItem = (renderItemProps: renderItemProps<'a>) => {
    let (currentStartDate, currentSupposedEndDate) = renderItemProps.item
    <WeeklyBarChart
      today
      todayFirst
      previousFirst
      startDate=currentStartDate
      // isVisible={
      //   startDate == currentStartDate
      //   && supposedEndDate == currentSupposedEndDate
      // }
      supposedEndDate=currentSupposedEndDate
      style=styleWidth
    />
  }

  let onViewableItemsChanged = React.useRef(itemsChanged =>
    if itemsChanged.viewableItems->Array.length == 1 {
      itemsChanged.viewableItems[0]
      ->Option.map(wrapper => currentDates_set(_ => wrapper.item))
      ->ignore
    }
  ).current

  let onShowThisWeek = React.useCallback0(_ =>
    // scrollToIndexParams triggers the currentDates_set
    // currentDates_set(_ => todayDates.current);
    flatListRef.current
    ->Js.Nullable.toOption
    ->Option.map(flatList =>
      flatList->FlatList.scrollToIndex(FlatList.scrollToIndexParams(~index=0, ()))
    )
    ->ignore
  )

  let (startDate1, supposedEndDate1) = last5Weeks[0]->Option.getWithDefault(todayDates)
  let endDate1 = supposedEndDate1->Date.min(today)
  let (startDate2, supposedEndDate2) = last5Weeks[1]->Option.getWithDefault(todayDates)
  let endDate2 = supposedEndDate2->Date.min(today)

  let events1 = getEvents(startDate1, endDate1, true)
  let events2 = getEvents(startDate2, endDate2, true)

  let (noEventDuringThisWeek, set_noEventDuringThisWeek) = React.useState(() => None)
  React.useEffect3(() => {
    switch events1 {
    | Some(evts1) => set_noEventDuringThisWeek(_ => Some(Calendars.noEvents(evts1, settings)))
    | _ => ()
    }
    None
  }, (events1, set_noEventDuringThisWeek, settings))
  let (noEventDuringLastWeeks, set_noEventDuringLastWeeks) = React.useState(() => None)
  React.useEffect4(() => {
    switch (events1, events2) {
    | (Some(evts1), Some(evts2)) =>
      set_noEventDuringLastWeeks(_ => Some(
        Calendars.noEvents(Array.concat(evts1, evts2), settings),
      ))
    | _ => ()
    }
    None
  }, (events1, events2, set_noEventDuringLastWeeks, settings))

  let longNoEventsExplanation =
    " " ++
    ("LifeTime can help you to understand how you use your time and rely on calendar events to learn how you use it. " ++
    "By saving events into your calendars, you will be able to visualize reports so you can take more informed decisions about how to use your valuable time.")

  let messagesNoEvents = switch (noEventDuringThisWeek, noEventDuringLastWeeks) {
  | (Some(None), Some(None)) =>
    Some((
      "LifeTime could not find any events on the last two weeks." ++ longNoEventsExplanation,
      [
        <TouchableButton key="getStarted" text="Get Started" onPress={_ => onGetStarted()} />,
        <TouchableButton
          key="openCalendar"
          text="Open Calendar"
          onPress={_ => Calendars.openCalendarApp()}
          mode=TouchableButton.Simple
        />,
      ],
    ))
  | (Some(OnlyAllDays), Some(None))
  | (Some(None), Some(OnlyAllDays))
  | (Some(OnlyAllDays), Some(OnlyAllDays)) =>
    Some((
      "LifeTime could not find any relevent events on the last two weeks. All day events are not suitable for time tracking.",
      [
        <TouchableButton key="getStarted" text="Get Started" onPress={_ => onGetStarted()} />,
        <TouchableButton
          key="openCalendar"
          text="Open Calendar"
          onPress={_ => Calendars.openCalendarApp()}
          mode=TouchableButton.Simple
        />,
      ],
    ))
  | (Some(OnlySkippedCalendars), Some(None))
  | (Some(None), Some(OnlySkippedCalendars))
  | (Some(OnlySkippedCalendars), Some(OnlySkippedCalendars)) =>
    Some((
      "LifeTime could not find any recent events that aren't part of skipped calendars.",
      [
        <TouchableButton
          key="helpSkipCal" text="Help me customize settings" onPress={_ => onFiltersPress()}
        />,
        <TouchableButton
          key="openCalendar"
          text="Open Calendar"
          onPress={_ => Calendars.openCalendarApp()}
          mode=TouchableButton.Simple
        />,
      ],
    ))
  | (Some(OnlySkippedActivities), Some(None))
  | (Some(None), Some(OnlySkippedActivities))
  | (Some(OnlySkippedActivities), Some(OnlySkippedActivities))
    when settings.activitiesSkippedFlag =>
    Some((
      "LifeTime could not find any recent events that aren't part of skipped activities.",
      [
        <TouchableButton
          key="helpSkipAct" text="Help me customize settings" onPress={_ => onFiltersPress()}
        />,
        <TouchableButton
          key="openCalendar" text="Toggle Hidden Activities" onPress={_ => setSettings(settings => {
              ...settings,
              lastUpdated: Js.Date.now(),
              activitiesSkippedFlag: !settings.activitiesSkippedFlag,
            })} mode=TouchableButton.Simple
        />,
        <TouchableButton
          key="openCalendar"
          text="Open Calendar"
          onPress={_ => Calendars.openCalendarApp()}
          mode=TouchableButton.Simple
        />,
      ],
    ))
  // | (Some(Some), Some(Some)) => None
  // | (None, None) => None
  | _ => None
  }

  let (onMessageNoEventsHeight, setOnMessageNoEventsHeight) = React.useState(() => None)
  let onMessageNoEventsLayout = React.useCallback1((layoutEvent: Event.layoutEvent) => {
    let height = layoutEvent.nativeEvent.layout.height
    setOnMessageNoEventsHeight(_ => Some(height))
  }, [setOnMessageNoEventsHeight])
  let animatedMessageNoEventsHeight = React.useRef(Animated.Value.create(0.)).current
  let animatedMessageNoEventsOpacity = React.useRef(Animated.Value.create(0.)).current
  let animatedMessageNoEventsScale = React.useRef(Animated.Value.create(0.)).current
  React.useEffect4(() => {
    onMessageNoEventsHeight->Option.map(height => {
      open Animated
      parallel(
        [
          spring(
            animatedMessageNoEventsHeight,
            Value.Spring.config(
              ~useNativeDriver=true,
              ~toValue=height->Value.Spring.fromRawValue,
              ~tension=1.,
              (),
            ),
          ),
          spring(
            animatedMessageNoEventsScale,
            Value.Spring.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Spring.fromRawValue,
              ~tension=1.,
              // ~delay=1.,
              (),
            ),
          ),
          timing(
            animatedMessageNoEventsOpacity,
            Value.Timing.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Timing.fromRawValue,
              ~duration=1200.,
              // ~delay=1.,
              (),
            ),
          ),
        ],
        {stopTogether: false},
      )->Animation.start()
    })->ignore
    None
  }, (
    onMessageNoEventsHeight,
    animatedMessageNoEventsHeight,
    animatedMessageNoEventsOpacity,
    animatedMessageNoEventsScale,
  ))

  <>
    <SpacedView>
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
      <View style={Predefined.styles["rowSpaceBetween"]}>
        <Text
          allowFontScaling=false
          style={Style.array([
            Theme.text["largeTitle"],
            Theme.text["weight700"],
            theme.styles["text"],
          ])}>
          {title->React.string}
        </Text>
        <View style={Predefined.styles["row"]}>
          {Global.__DEV__
            ? <>
                {Global.hermesInternal != None
                  ? <Text
                      style={
                        open Style
                        array([theme.styles["textOnDarkLight"], Theme.text["caption2"]])
                      }>
                      {"Hermes on"->React.string}
                    </Text>
                  : React.null}
              </>
            : React.null}
        </View>
      </View>
    </SpacedView>
    {messagesNoEvents->Option.map(((messageNoEvents, messageNoEventsButtons)) =>
      <Animated.View
        onLayout=onMessageNoEventsLayout
        style={
          open Style
          style(
            // this is what allow to compute height
            // we put this container in absolute + opacity 0
            // then we get height via onLayout, then we switch this to relative
            // and animate the rest

            ~position=onMessageNoEventsHeight->Option.isNone ? #absolute : #relative,
            ~opacity=animatedMessageNoEventsOpacity->Animated.StyleProp.float,
            ~transform=[scale(~scale=animatedMessageNoEventsScale->Animated.StyleProp.float)],
            (),
          )
        }>
        <SpacedView>
          <View
            style={
              open Style
              viewStyle(
                ~shadowColor="#000",
                ~shadowOffset=offset(~height=3., ~width=1.),
                ~shadowOpacity=0.1,
                ~shadowRadius=6.,
                (),
              )
            }>
            <SpacedView
              horizontal=XS
              vertical=XXS
              style={
                open Style
                array([
                  Predefined.styles["rowSpaceBetween"],
                  theme.styles["backgroundMain"],
                  viewStyle(
                    ~borderTopLeftRadius=Theme.Radius.card,
                    ~borderTopRightRadius=Theme.Radius.card,
                    (),
                  ),
                ])
              }>
              <Text
                style={
                  open Style
                  textStyle(~color="#fff", ())
                }>
                {"No Events Available"->React.string}
              </Text>
              <TouchableOpacity
                hitSlop={View.edgeInsets(~top=10., ~bottom=10., ~left=10., ~right=10., ())}
                onPress={_ => {
                  open Alert
                  alert(
                    ~title="Let's stay motivated!",
                    ~message="LifeTime is here to help you move foward and can give you advices & motivate you to achieve your personal goals." ++
                    ("\n" ++
                    "To stop seeing this message, try to fill your calendar with events or adjust settings to reveal some that are currently hidden."),
                    ~buttons=[button(~text="Got it", ~style=#cancel, ())],
                    (),
                  )
                }}>
                <SVGXmark width={16.->Style.dp} height={16.->Style.dp} fill="#fff" />
              </TouchableOpacity>
            </SpacedView>
            <SpacedView
              horizontal=M
              vertical=XS
              style={
                open Style
                array([
                  Predefined.styles["alignCenter"],
                  theme.styles["background"],
                  viewStyle(
                    ~borderBottomLeftRadius=Theme.Radius.card,
                    ~borderBottomRightRadius=Theme.Radius.card,
                    (),
                  ),
                ])
              }>
              <Spacer size=S />
              <Text
                style={
                  open Style
                  array([Theme.text["title1"], Theme.text["weight700"], theme.styles["text"]])
                }>
                {"No Events"->React.string}
              </Text>
              <Spacer size=XS />
              <Text
                style={
                  open Style
                  array([Theme.text["subhead"], theme.styles["text"]])
                }>
                {messageNoEvents->React.string}
              </Text>
              <Spacer size=M />
              {messageNoEventsButtons->React.array}
              <Spacer size=S />
            </SpacedView>
          </View>
        </SpacedView>
      </Animated.View>
    )->Option.getWithDefault(React.null)}
    <Animated.View
      style={
        open Style
        arrayOption([onMessageNoEventsHeight->Option.map(height =>
            style(
              ~transform=[
                translateY(
                  ~translateY={
                    open Animated.Interpolation
                    animatedMessageNoEventsHeight->interpolate(
                      config(
                        ~inputRange=[0., height],
                        ~outputRange=[-.height, 0.]->fromFloatArray,
                        (),
                      ),
                    )
                  }->Animated.StyleProp.float,
                ),
              ],
              (),
            )
          )])
      }>
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
      <FlatList
        ref={flatListRef->Ref.value}
        horizontal=true
        pagingEnabled=true
        showsHorizontalScrollIndicator=false
        inverted=true
        initialNumToRender=1
        data=last5Weeks
        style={Style.array([theme.styles["background"], styleWidth])}
        getItemLayout
        keyExtractor={((first, _), _index) => first->Js.Date.toString}
        renderItem
        onViewableItemsChanged
      />
      <ListSeparator />
      <BlockFootnote>
        {("Updated " ++ Date.formatRelative(updatedAt, today))->React.string}
        <Spacer size=XS />
        {!refreshing ? React.null : <ActivityIndicator size={ActivityIndicator.Size.exact(8.)} />}
      </BlockFootnote>
      <Spacer />
      <TopActivities mapTitleDuration onFiltersPress onActivityPress />
      <Spacer />
      <SpacedView horizontal=None>
        <TouchableOpacity onPress={_ => setSettings(settings => {
              ...settings,
              lastUpdated: Js.Date.now(),
              activitiesSkippedFlag: !settings.activitiesSkippedFlag,
            })}>
          <ListSeparator />
          <SpacedView vertical=XS style={theme.styles["background"]}>
            <Center>
              <Text
                style={
                  open Style
                  array([Theme.text["callout"], textStyle(~color=theme.colors.blue, ())])
                }>
                {(
                  settings.activitiesSkippedFlag
                    ? "Reveal Hidden Activities"
                    : "Mask Hidden Activities"
                )->React.string}
              </Text>
            </Center>
          </SpacedView>
          <ListSeparator />
        </TouchableOpacity>
      </SpacedView>
      <Spacer />
    </Animated.View>
  </>
}
