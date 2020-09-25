open Belt;
open ReactNative;
open ReactMultiversal;
open ReasonDateFns;
open VirtualizedList;

let title = "Your LifeTime";

[@react.component]
let make =
    (
      ~onGetStarted,
      ~refreshing,
      ~onRefreshDone,
      ~onFiltersPress,
      ~onActivityPress,
    ) => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let (getEvents, updatedAt, requestUpdate) =
    React.useContext(Calendars.context);
  let theme = Theme.useTheme(AppSettings.useTheme());
  let windowDimensions = Dimensions.useWindowDimensions();
  let styleWidth = Style.(style(~width=windowDimensions.width->dp, ()));

  React.useEffect1(
    () => {
      if (refreshing) {
        requestUpdate();
        onRefreshDone();
      };
      None;
    },
    [|refreshing|],
  );

  React.useEffect1(
    () => {
      let handleAppStateChange = newAppState =>
        if (newAppState == AppState.active) {
          requestUpdate();
        };

      AppState.addEventListener(
        `change(state => handleAppStateChange(state)),
      );
      Some(
        () =>
          AppState.removeEventListener(
            `change(state => handleAppStateChange(state)),
          ),
      );
    },
    [|requestUpdate|],
  );

  let today = React.useRef(Date.now());
  let todayDates = React.useRef(Date.weekDates(today.current));
  let previousDates =
    React.useRef(Date.weekDates(today.current->Date.addDays(-7)));

  let weeks =
    React.useRef(
      Array.range(0, 5)
      ->Array.map(currentWeekReverseIndex =>
          Date.weekDates(
            today.current->Date.addDays(- currentWeekReverseIndex * 7),
          )
        ),
    );

  let ((startDate, supposedEndDate), setCurrentDates) =
    React.useState(() =>
      weeks.current[weeks.current->Array.length - 1]
      ->Option.getWithDefault(todayDates.current)
    );

  let endDate = supposedEndDate->Date.min(today.current);

  let (todayFirst, _) = todayDates.current;
  let (previousFirst, _) = previousDates.current;

  let events = getEvents(startDate, endDate, true);
  let mapTitleDuration =
    events->Option.map(es =>
      es->Calendars.filterEvents(settings)->Calendars.mapTitleDuration
    );

  let flatListRef = React.useRef(Js.Nullable.null);

  let getItemLayout =
    React.useMemo1(
      ((), _items, index) =>
        {
          length: windowDimensions.width,
          offset: windowDimensions.width *. index->float,
          index,
        },
      [|windowDimensions.width|],
    );

  let renderItem = (renderItemProps: renderItemProps('a)) => {
    let (currentStartDate, currentSupposedEndDate) = renderItemProps.item;
    <WeeklyBarChart
      today
      todayFirst
      previousFirst
      // isVisible={
      //   startDate == currentStartDate
      //   && supposedEndDate == currentSupposedEndDate
      // }
      startDate=currentStartDate
      supposedEndDate=currentSupposedEndDate
      style=styleWidth
    />;
  };

  let onViewableItemsChanged =
    React.useRef(itemsChanged =>
      if (itemsChanged.viewableItems->Array.length == 1) {
        itemsChanged.viewableItems[0]
        ->Option.map(wrapper => setCurrentDates(_ => wrapper.item))
        ->ignore;
      }
    );

  let onShowThisWeek =
    React.useCallback3(
      _ =>
        // scrollToIndexParams triggers the setCurrentDates
        // setCurrentDates(_ => todayDates.current);
        flatListRef.current
        ->Js.Nullable.toOption
        ->Option.map(flatList =>
            flatList->FlatList.scrollToIndex(
              FlatList.scrollToIndexParams(~index=0, ()),
            )
          )
        ->ignore,
      (setCurrentDates, todayDates, flatListRef),
    );

  let (startDate1, supposedEndDate1) =
    weeks.current[weeks.current->Array.length - 1]
    ->Option.getWithDefault(todayDates.current);
  let endDate1 = supposedEndDate1->Date.min(today.current);
  let (startDate2, supposedEndDate2) =
    weeks.current[weeks.current->Array.length - 2]
    ->Option.getWithDefault(todayDates.current);
  let endDate2 = supposedEndDate2->Date.min(today.current);

  let events1 = getEvents(startDate1, endDate1, true);
  let events2 = getEvents(startDate2, endDate2, true);

  let (noEventDuringThisWeek, set_noEventDuringThisWeek) =
    React.useState(() => None);
  React.useEffect1(
    () => {
      switch (events1) {
      | Some(evts1) =>
        set_noEventDuringThisWeek(_ =>
          Some(Calendars.noEvents(evts1, settings))
        )
      | _ => ()
      };
      None;
    },
    [|events1|],
  );
  let (noEventDuringLastWeeks, set_noEventDuringLastWeeks) =
    React.useState(() => None);
  React.useEffect2(
    () => {
      switch (events1, events2) {
      | (Some(evts1), Some(evts2)) =>
        set_noEventDuringLastWeeks(_ =>
          Some(Calendars.noEvents(Array.concat(evts1, evts2), settings))
        )
      | _ => ()
      };
      None;
    },
    (events1, events2),
  );

  let longNoEventsExplanation =
    " "
    ++ "LifeTime can help you to understand how you use your time and rely on calendar events to learn how you use it. "
    ++ "By saving events into your calendars, you will be able to visualize reports so you can take more informed decisions about how to use your valuable time.";

  let messagesNoEvents =
    switch (noEventDuringThisWeek, noEventDuringLastWeeks) {
    | (Some(None), Some(None)) =>
      Some((
        "LifeTime could not find any events on the last two weeks."
        ++ longNoEventsExplanation,
        [|
          <TouchableButton
            key="getStarted"
            text="Get Started"
            onPress={_ => onGetStarted()}
          />,
          <TouchableButton
            key="openCalendar"
            text="Open Calendar"
            onPress={_ => Calendars.openCalendarApp()}
            mode=TouchableButton.Simple
          />,
        |],
      ))
    | (Some(OnlyAllDays), Some(None))
    | (Some(None), Some(OnlyAllDays))
    | (Some(OnlyAllDays), Some(OnlyAllDays)) =>
      Some((
        "LifeTime could not find any relevent events on the last two weeks. All day events are not suitable for time tracking.",
        [|
          <TouchableButton
            key="getStarted"
            text="Get Started"
            onPress={_ => onGetStarted()}
          />,
          <TouchableButton
            key="openCalendar"
            text="Open Calendar"
            onPress={_ => Calendars.openCalendarApp()}
            mode=TouchableButton.Simple
          />,
        |],
      ))
    | (Some(OnlySkippedCalendars), Some(None))
    | (Some(None), Some(OnlySkippedCalendars))
    | (Some(OnlySkippedCalendars), Some(OnlySkippedCalendars)) =>
      Some((
        "LifeTime could not find any recent events that aren't part of skipped calendars.",
        [|
          <TouchableButton
            key="helpSkipCal"
            text="Help me customize settings"
            onPress={_ => onFiltersPress()}
          />,
          <TouchableButton
            key="openCalendar"
            text="Open Calendar"
            onPress={_ => Calendars.openCalendarApp()}
            mode=TouchableButton.Simple
          />,
        |],
      ))
    | (Some(OnlySkippedActivities), Some(None))
    | (Some(None), Some(OnlySkippedActivities))
    | (Some(OnlySkippedActivities), Some(OnlySkippedActivities))
        when settings.activitiesSkippedFlag =>
      Some((
        "LifeTime could not find any recent events that aren't part of skipped activities.",
        [|
          <TouchableButton
            key="helpSkipAct"
            text="Help me customize settings"
            onPress={_ => onFiltersPress()}
          />,
          <TouchableButton
            key="openCalendar"
            text="Toggle Hidden Activities"
            onPress={_ =>
              setSettings(settings =>
                {
                  ...settings,
                  lastUpdated: Js.Date.now(),
                  activitiesSkippedFlag: !settings.activitiesSkippedFlag,
                }
              )
            }
            mode=TouchableButton.Simple
          />,
          <TouchableButton
            key="openCalendar"
            text="Open Calendar"
            onPress={_ => Calendars.openCalendarApp()}
            mode=TouchableButton.Simple
          />,
        |],
      ))
    // | (Some(Some), Some(Some)) => None
    // | (None, None) => None
    | _ => None
    };

  let (onMessageNoEventsHeight, setOnMessageNoEventsHeight) =
    React.useState(() => None);
  let onMessageNoEventsLayout =
    React.useCallback0((layoutEvent: Event.layoutEvent) => {
      let height = layoutEvent.nativeEvent.layout.height;
      setOnMessageNoEventsHeight(_ => Some(height));
    });
  let animatedMessageNoEventsHeight =
    React.useRef(Animated.Value.create(0.));
  let animatedMessageNoEventsOpacity =
    React.useRef(Animated.Value.create(0.));
  let animatedMessageNoEventsScale = React.useRef(Animated.Value.create(0.));
  React.useEffect1(
    () => {
      onMessageNoEventsHeight
      ->Option.map(height => {
          Animated.(
            parallel(
              [|
                spring(
                  animatedMessageNoEventsHeight.current,
                  Value.Spring.config(
                    ~useNativeDriver=true,
                    ~toValue=height->Value.Spring.fromRawValue,
                    ~tension=1.,
                    (),
                  ),
                ),
                spring(
                  animatedMessageNoEventsScale.current,
                  Value.Spring.config(
                    ~useNativeDriver=true,
                    ~toValue=1.->Value.Spring.fromRawValue,
                    ~tension=1.,
                    // ~delay=1.,
                    (),
                  ),
                ),
                timing(
                  animatedMessageNoEventsOpacity.current,
                  Value.Timing.config(
                    ~useNativeDriver=true,
                    ~toValue=1.->Value.Timing.fromRawValue,
                    ~duration=1200.,
                    // ~delay=1.,
                    (),
                  ),
                ),
              |],
              {stopTogether: false},
            )
            ->Animation.start()
          )
        })
      ->ignore;
      None;
    },
    [|onMessageNoEventsHeight|],
  );

  <>
    <SpacedView>
      <TitlePre style=theme.styles##textLightOnBackgroundDark>
        {Date.(
           today.current->Js.Date.getDay->dayLongString
           ++ " "
           ++ today.current->dateString
           ++ " "
           ++ today.current->monthLongString
         )
         ->Js.String.toUpperCase
         ->React.string}
      </TitlePre>
      <Title style=theme.styles##textOnBackground> title->React.string </Title>
    </SpacedView>
    {messagesNoEvents
     ->Option.map(((messageNoEvents, messageNoEventsButtons)) =>
         <Animated.View
           onLayout=onMessageNoEventsLayout
           style=Style.(
             style(
               // this is what allow to compute height
               // we put this container in absolute + opacity 0
               // then we get height via onLayout, then we switch this to relative
               // and animate the rest
               ~position=
                 onMessageNoEventsHeight->Option.isNone
                   ? `absolute : `relative,
               ~opacity=
                 animatedMessageNoEventsOpacity.current
                 ->Animated.StyleProp.float,
               ~transform=[|
                 scale(
                   ~scale=
                     animatedMessageNoEventsScale.current
                     ->Animated.StyleProp.float,
                 ),
               |],
               (),
             )
           )>
           <SpacedView>
             <View
               style=Style.(
                 viewStyle(
                   ~shadowColor="#000",
                   ~shadowOffset=offset(~height=3., ~width=1.),
                   ~shadowOpacity=0.1,
                   ~shadowRadius=6.,
                   (),
                 )
               )>
               <SpacedView
                 horizontal=XS
                 vertical=XXS
                 style=Style.(
                   array([|
                     Predefined.styles##rowSpaceBetween,
                     theme.styles##backgroundMain,
                     viewStyle(
                       ~borderTopLeftRadius=Theme.Radius.card,
                       ~borderTopRightRadius=Theme.Radius.card,
                       (),
                     ),
                   |])
                 )>
                 <Text style=Style.(textStyle(~color="#fff", ()))>
                   "No Events Available"->React.string
                 </Text>
                 <TouchableOpacity
                   hitSlop={View.edgeInsets(
                     ~top=10.,
                     ~bottom=10.,
                     ~left=10.,
                     ~right=10.,
                     (),
                   )}
                   onPress={_ => {
                     Alert.(
                       alert(
                         ~title="Let's stay motivated!",
                         ~message=
                           "LifeTime is here to help you move foward and can give you advices & motivate you to achieve your personal goals."
                           ++ "\n"
                           ++ "To stop seeing this message, try to fill your calendar with events or adjust settings to reveal some that are currently hidden.",
                         ~buttons=[|
                           button(~text="Got it", ~style=`cancel, ()),
                         |],
                         (),
                       )
                     )
                   }}>
                   <SVGXmark
                     width={16.->Style.dp}
                     height={16.->Style.dp}
                     fill="#fff"
                   />
                 </TouchableOpacity>
               </SpacedView>
               <SpacedView
                 horizontal=M
                 vertical=XS
                 style=Style.(
                   array([|
                     Predefined.styles##alignCenter,
                     theme.styles##background,
                     viewStyle(
                       ~borderBottomLeftRadius=Theme.Radius.card,
                       ~borderBottomRightRadius=Theme.Radius.card,
                       (),
                     ),
                   |])
                 )>
                 <Spacer size=S />
                 <Text
                   style=Style.(
                     array([|
                       Theme.text##title1,
                       Theme.text##heavy,
                       theme.styles##textOnBackground,
                     |])
                   )>
                   "No Events"->React.string
                 </Text>
                 <Spacer size=XS />
                 <Text
                   style=Style.(
                     array([|
                       Theme.text##subhead,
                       theme.styles##textOnBackground,
                     |])
                   )>
                   messageNoEvents->React.string
                 </Text>
                 <Spacer size=M />
                 messageNoEventsButtons->React.array
                 <Spacer size=S />
               </SpacedView>
             </View>
           </SpacedView>
         </Animated.View>
       )
     ->Option.getWithDefault(React.null)}
    <Animated.View
      style=Style.(
        arrayOption([|
          onMessageNoEventsHeight->Option.map(height =>
            style(
              ~transform=[|
                translateY(
                  ~translateY=
                    Animated.Interpolation.(
                      animatedMessageNoEventsHeight.current
                      ->interpolate(
                          config(
                            ~inputRange=[|0., height|],
                            ~outputRange=[|-. height, 0.|]->fromFloatArray,
                            (),
                          ),
                        )
                    )
                    ->Animated.StyleProp.float,
                ),
              |],
              (),
            )
          ),
        |])
      )>
      <View style=Predefined.styles##rowSpaceBetween>
        <Row> <Spacer size=XS /> <BlockHeading text="Weekly Chart" /> </Row>
        <Row>
          {todayFirst == startDate
             ? React.null
             : <BlockHeadingTouchable
                 onPress=onShowThisWeek
                 text="Show This Week"
               />}
          <Spacer size=XS />
        </Row>
      </View>
      <Separator style=theme.styles##separatorOnBackground />
      <FlatList
        ref={flatListRef->Ref.value}
        horizontal=true
        pagingEnabled=true
        showsHorizontalScrollIndicator=false
        inverted=true
        initialNumToRender=1
        data={weeks.current}
        style={Style.array([|theme.styles##background, styleWidth|])}
        getItemLayout
        keyExtractor={((first, _), _index) => first->Js.Date.toString}
        renderItem
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
      <Separator style=theme.styles##separatorOnBackground />
      <BlockFootnote>
        {("Updated " ++ DateFns.formatRelative(today.current, updatedAt))
         ->React.string}
        <Spacer size=XS />
        {!refreshing
           ? React.null
           : <ActivityIndicator size={ActivityIndicator.Size.exact(8.)} />}
      </BlockFootnote>
      <Spacer />
      <TopActivities mapTitleDuration onFiltersPress onActivityPress />
      <Spacer />
      <SpacedView horizontal=None>
        <TouchableOpacity
          onPress={_ =>
            setSettings(settings =>
              {
                ...settings,
                lastUpdated: Js.Date.now(),
                activitiesSkippedFlag: !settings.activitiesSkippedFlag,
              }
            )
          }>
          <Separator style=theme.styles##separatorOnBackground />
          <SpacedView vertical=XS style=theme.styles##background>
            <Center>
              <Text
                style=Style.(
                  array([|
                    Theme.text##callout,
                    textStyle(~color=theme.colors.blue, ()),
                  |])
                )>
                {settings.activitiesSkippedFlag
                   ? "Reveal Hidden Activities" : "Mask Hidden Activities"}
                ->React.string
              </Text>
            </Center>
          </SpacedView>
          <Separator style=theme.styles##separatorOnBackground />
        </TouchableOpacity>
      </SpacedView>
      <Spacer />
    </Animated.View>
  </>;
};
