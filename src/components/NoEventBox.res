open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

@react.component
let make = (~onGetStarted, ~onFiltersPress, ~today, ~todayDates, ~last5Weeks) => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let (getEvents, fetchEvents, _updatedAt, _requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let (startDate1, supposedEndDate1) =
    last5Weeks[last5Weeks->Array.length - 1]->Option.getWithDefault(todayDates)
  let endDate1 = supposedEndDate1->Date.min(today)
  let (startDate2, supposedEndDate2) =
    last5Weeks[last5Weeks->Array.length - 2]->Option.getWithDefault(todayDates)
  let endDate2 = supposedEndDate2->Date.min(today)

  let fetchedEvents1 = getEvents(startDate1, endDate1)
  React.useEffect4(() => {
    // Log.info(("NoEventBox 1", startDate1, endDate1))
    switch fetchedEvents1 {
    | NotAsked => fetchEvents(startDate1, endDate1)
    | _ => ()
    }
    None
  }, (fetchEvents, fetchedEvents1, startDate1, endDate1))
  let events1 = switch fetchedEvents1 {
  | Done(evts) => Some(evts)
  | _ => None
  }

  let fetchedEvents2 = getEvents(startDate2, endDate2)
  React.useEffect4(() => {
    // Log.info(("NoEventBox 2", startDate2, endDate2))
    switch fetchedEvents2 {
    | NotAsked => fetchEvents(startDate2, endDate2)
    | _ => ()
    }
    None
  }, (fetchEvents, fetchedEvents2, startDate2, endDate2))
  let events2 = switch fetchedEvents2 {
  | Done(evts) => Some(evts)
  | _ => None
  }

  let (noEventDuringThisWeek, noEventDuringThisWeek_set) = React.useState(() => None)
  React.useEffect3(() => {
    switch events1 {
    | Some(evts1) =>
      noEventDuringThisWeek_set(_ => Some(
        evts1->Calendars.noEvents(
          settings.calendarsSkipped,
          settings.activitiesSkippedFlag,
          settings.activitiesSkipped,
        ),
      ))
    | _ => ()
    }
    None
  }, (events1, noEventDuringThisWeek_set, settings))
  let (noEventDuringLastWeeks, set_noEventDuringLastWeeks) = React.useState(() => None)
  React.useEffect4(() => {
    switch (events1, events2) {
    | (Some(evts1), Some(evts2)) =>
      set_noEventDuringLastWeeks(_ => Some(
        Array.concat(evts1, evts2)->Calendars.noEvents(
          settings.calendarsSkipped,
          settings.activitiesSkippedFlag,
          settings.activitiesSkipped,
        ),
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
  | (Some(OnlySkippedActivities), Some(OnlySkippedActivities)) if settings.activitiesSkippedFlag =>
    Some((
      "LifeTime could not find any recent events that aren't part of skipped activities.",
      [
        <TouchableButton
          key="helpSkipAct" text="Help me customize settings" onPress={_ => onFiltersPress()}
        />,
        <TouchableButton
          key="openCalendar"
          text="Toggle Hidden Activities"
          onPress={_ =>
            setSettings(settings => {
              ...settings,
              lastUpdated: Js.Date.now(),
              activitiesSkippedFlag: !settings.activitiesSkippedFlag,
            })}
          mode=TouchableButton.Simple
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

  let animatedMessageNoEvents = React.useRef(Animated.Value.create(0.))

  React.useEffect1(() => {
    if messagesNoEvents->Option.isSome {
      open Animated
      spring(
        animatedMessageNoEvents.current,
        Value.Spring.config(
          ~useNativeDriver=true,
          ~toValue=1.->Value.Spring.fromRawValue, //height->Value.Spring.fromRawValue,
          ~tension=1.,
          (),
        ),
      )->Animation.start()
    }
    None
  }, [messagesNoEvents])

  messagesNoEvents
  ->Option.map(((messageNoEvents, messageNoEventsButtons)) =>
    <Animated.View
      style={viewStyle(
        ~transform=[scale(~scale=animatedMessageNoEvents.current->Animated.StyleProp.float)],
        ~opacity=animatedMessageNoEvents.current->Animated.StyleProp.float,
        (),
      )}>
      <SpacedView>
        <View
          style={viewStyle(
            ~shadowColor="#000",
            ~shadowOffset=offset(~height=3., ~width=1.),
            ~shadowOpacity=0.1,
            ~shadowRadius=6.,
            (),
          )}>
          <SpacedView
            horizontal=XS
            vertical=XXS
            style={array([
              Predefined.styles["rowSpaceBetween"],
              theme.styles["backgroundMain"],
              viewStyle(
                ~borderTopLeftRadius=Theme.Radius.card,
                ~borderTopRightRadius=Theme.Radius.card,
                (),
              ),
            ])}>
            <Text style={textStyle(~color="#fff", ())}>
              {"No Events Available"->React.string}
            </Text>
            <TouchableOpacity
              hitSlop=HitSlops.m
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
              <SVGXmark width={16.->dp} height={16.->dp} fill="#fff" />
            </TouchableOpacity>
          </SpacedView>
          <SpacedView
            horizontal=M
            vertical=XS
            style={array([
              Predefined.styles["alignCenter"],
              theme.styles["background"],
              viewStyle(
                ~borderBottomLeftRadius=Theme.Radius.card,
                ~borderBottomRightRadius=Theme.Radius.card,
                (),
              ),
            ])}>
            <Spacer size=S />
            <Text
              style={array([Theme.text["title1"], Theme.text["weight700"], theme.styles["text"]])}>
              {"No Events"->React.string}
            </Text>
            <Spacer size=XS />
            <Text style={array([Theme.text["subhead"], theme.styles["text"]])}>
              {messageNoEvents->React.string}
            </Text>
            <Spacer size=M />
            {messageNoEventsButtons->React.array}
            <Spacer size=S />
          </SpacedView>
        </View>
      </SpacedView>
    </Animated.View>
  )
  ->Option.getWithDefault(React.null)
  // React.null
}
