open Belt;
open ReactNative;
open ReactMultiversal;
open ReasonDateFns;

let styles =
  Style.(
    StyleSheet.create({
      "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
      "smallText": textStyle(~fontSize=12., ~lineHeight=16. *. 1.4, ()),
    })
  );

let title = "Your LifeTime";

[@bs.module "react"]
external useCallback4:
  ([@bs.uncurry] ('input => 'output), ('a, 'b, 'c, 'd)) =>
  React.callback('input, 'output) =
  "useCallback";
[@bs.module "react"]
external useCallback5:
  ([@bs.uncurry] ('input => 'output), ('a, 'b, 'c, 'd, 'e)) =>
  React.callback('input, 'output) =
  "useCallback";
[@bs.module "react"]
external useCallback6:
  ([@bs.uncurry] ('input => 'output), ('a, 'b, 'c, 'd, 'e, 'f)) =>
  React.callback('input, 'output) =
  "useCallback";

[@react.component]
let make = (~refreshing, ~onRefreshDone, ~onFiltersPress, ~onActivityPress) => {
  let (settings, setSettings) = React.useContext(AppSettings.context);
  let themeStyles = Theme.useStyles();
  let themeColors = Theme.useColors();
  let windowDimensions = Dimensions.useWindowDimensions();
  let styleWidth = Style.(style(~width=windowDimensions##width->dp, ()));

  let (updatedAt, setUpdatedAt) = React.useState(_ => Date.now());
  React.useEffect1(
    () => {
      if (refreshing) {
        setUpdatedAt(_ => Date.now());
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
          setUpdatedAt(_ => Date.now());
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
    [|setUpdatedAt|],
  );

  let today = React.useRef(Date.now());
  let todayDates =
    React.useRef(
      Date.weekDates(~firstDayOfWeekIndex=1, today->React.Ref.current),
    );
  let previousDates =
    React.useRef(
      Date.weekDates(
        ~firstDayOfWeekIndex=1,
        today->React.Ref.current->Date.addDays(-7),
      ),
    );

  let weeks =
    React.useRef(
      Array.range(0, 51)
      ->Array.reverse
      ->Array.map(currentWeekReverseIndex =>
          Date.weekDates(
            ~firstDayOfWeekIndex=1,
            today
            ->React.Ref.current
            ->Date.addDays(- currentWeekReverseIndex * 7),
          )
        ),
    );
  let initialScrollIndex = weeks->React.Ref.current->Array.length - 1;

  let ((startDate, supposedEndDate), setCurrentDates) =
    React.useState(() =>
      weeks->React.Ref.current[weeks->React.Ref.current->Array.length - 1]
      ->Option.getWithDefault(todayDates->React.Ref.current)
    );

  let endDate = supposedEndDate->Date.min(today->React.Ref.current);

  let events = Calendars.useEvents(startDate, endDate, updatedAt);
  let mapTitleDuration =
    events->Option.map(es =>
      es->Calendars.filterEvents(settings)->Calendars.mapTitleDuration
    );
  let mapCategoryDuration =
    events->Option.map(es =>
      settings->Calendars.mapCategoryDuration(
        es->Calendars.filterEvents(settings),
      )
    );

  let (todayFirst, _) = todayDates->React.Ref.current;
  let (previousFirst, _) = previousDates->React.Ref.current;

  let flatListRef = React.useRef(Js.Nullable.null);

  let getItemLayout =
    React.useMemo1(
      ((), _items, index) =>
        {
          "length": windowDimensions##width,
          "offset": windowDimensions##width *. index->float,
          "index": index,
        },
      [|windowDimensions##width|],
    );

  let renderItem =
    useCallback6(
      renderItemProps => {
        // Js.log2("render", renderItemProps##index);
        let (firstDay, lastDay) = renderItemProps##item;
        <View style=styleWidth>
          <Spacer />
          <SpacedView vertical=None>
            <Text style=themeStyles##textLightOnBackground>
              (
                if (todayFirst == firstDay) {
                  "Daily Average";
                } else if (previousFirst == firstDay) {
                  "Last Week's Average";
                } else {
                  firstDay->Js.Date.getDate->Js.Float.toString
                  ++ " - "
                  ++ lastDay->Js.Date.getDate->Js.Float.toString
                  ++ " "
                  ++ lastDay->Date.monthShortString
                  ++ " Average";
                }
              )
              ->React.string
            </Text>
          </SpacedView>
          <Spacer size=S />
          <SpacedView vertical=None>
            <WeeklyGraph
              events
              mapCategoryDuration
              mapTitleDuration
              startDate
              supposedEndDate
            />
          </SpacedView>
          <Spacer size=S />
          <View style=Predefined.styles##row>
            <Spacer size=S />
            <View style=Predefined.styles##flexGrow>
              <Separator style=themeStyles##separatorOnBackground />
              <SpacedView
                horizontal=None vertical=S style=Predefined.styles##row>
                <View style=Predefined.styles##flexGrow>
                  <Text style=themeStyles##textOnBackground>
                    "Total Logged Time:"->React.string
                  </Text>
                </View>
                <Text>
                  <Text style=themeStyles##textLightOnBackgroundDark>
                    {mapTitleDuration
                     ->Option.map(mapTitleDuration =>
                         mapTitleDuration->Array.reduce(
                           0., (total, (_title, duration)) =>
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
        </View>;
      },
      (
        startDate,
        endDate,
        events,
        supposedEndDate,
        mapCategoryDuration,
        mapTitleDuration,
      ),
    );

  let onViewableItemsChanged =
    React.useRef(itemsChanged =>
      if (itemsChanged##viewableItems->Array.length == 1) {
        itemsChanged##viewableItems[0]
        ->Option.map(wrapper => setCurrentDates(_ => wrapper##item))
        ->ignore;
      }
    );

  let onShowThisWeek =
    React.useCallback3(
      _ =>
        // scrollToIndexParams triggers the setCurrentDates
        // setCurrentDates(_ => todayDates->React.Ref.current);
        flatListRef
        ->React.Ref.current
        ->Js.Nullable.toOption
        ->Option.map(flatList =>
            flatList->FlatList.scrollToIndex(
              FlatList.scrollToIndexParams(~index=initialScrollIndex, ()),
            )
          )
        ->ignore,
      (setCurrentDates, todayDates, flatListRef),
    );

  <>
    <SpacedView>
      <TitlePre style=themeStyles##textLightOnBackgroundDark>
        {Date.(
           today->React.Ref.current->Js.Date.getDay->dayLongString
           ++ " "
           ++ today->React.Ref.current->dateString
           ++ " "
           ++ today->React.Ref.current->monthLongString
         )
         ->Js.String.toUpperCase
         ->React.string}
      </TitlePre>
      <Title style=themeStyles##textOnBackground> title->React.string </Title>
    </SpacedView>
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
    <Separator style=themeStyles##separatorOnBackground />
    <FlatList
      ref=flatListRef
      horizontal=true
      pagingEnabled=true
      showsHorizontalScrollIndicator=false
      initialScrollIndex
      initialNumToRender=2
      data={weeks->React.Ref.current}
      style={Style.list([themeStyles##background, styleWidth])}
      getItemLayout
      keyExtractor={((first, _), _index) => first->Js.Date.toString}
      renderItem
      onViewableItemsChanged={onViewableItemsChanged->React.Ref.current}
    />
    <Separator style=themeStyles##separatorOnBackground />
    <SpacedView vertical=XXS horizontal=S style=Predefined.styles##row>
      <Text
        style=Style.(
          list([styles##smallText, themeStyles##textLightOnBackgroundDark])
        )>
        {(
           "Updated "
           ++ DateFns.formatRelative(today->React.Ref.current, updatedAt)
         )
         ->React.string}
      </Text>
      <Spacer size=XS />
      {!refreshing
         ? React.null
         : <ActivityIndicator size={ActivityIndicator.Size.exact(8.)} />}
    </SpacedView>
    <Spacer />
    <TopActivities mapTitleDuration onFiltersPress onActivityPress />
    <Spacer />
    <SpacedView horizontal=None>
      <TouchableOpacity
        onPress={_ =>
          setSettings(settings =>
            {
              "theme": settings##theme,
              "lastUpdated": Js.Date.now(),
              "calendarsIdsSkipped": settings##calendarsIdsSkipped,
              "eventsSkippedOn": !settings##eventsSkippedOn,
              "eventsSkipped": settings##eventsSkipped,
              "eventsCategories": settings##eventsCategories,
            }
          )
        }>
        <Separator style=themeStyles##separatorOnBackground />
        <SpacedView vertical=XS style=themeStyles##background>
          <Center>
            {settings##eventsSkippedOn
               ? <Text style=Style.(textStyle(~color=themeColors.blue, ()))>
                   "Show Ignored"->React.string
                 </Text>
               : <Text style=Style.(textStyle(~color=themeColors.blue, ()))>
                   "Hide Ignored"->React.string
                 </Text>}
          </Center>
        </SpacedView>
        <Separator style=themeStyles##separatorOnBackground />
      </TouchableOpacity>
    </SpacedView>
    <Spacer />
  </>;
};
