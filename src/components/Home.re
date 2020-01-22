open Belt;
open ReactNative;
open ReactMultiversal;
open ReasonDateFns;

let styles =
  Style.{
    "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    "smallText": textStyle(~fontSize=12., ~lineHeight=16. *. 1.4, ()),
  }
  ->StyleSheet.create;

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
  let (getEvents, updatedAt, requestUpdate) =
    React.useContext(Calendars.context);
  let theme = Theme.useTheme(AppSettings.useTheme());
  let windowDimensions = Dimensions.useWindowDimensions();
  let styleWidth = Style.(style(~width=windowDimensions##width->dp, ()));

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
      Array.range(0, 4)
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
    React.useCallback1(
      renderItemProps => {
        let (startDate, supposedEndDate) = renderItemProps##item;
        let endDate = supposedEndDate->Date.min(today->React.Ref.current);
        let events = getEvents(startDate, endDate);
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
        <View style=styleWidth>
          <Spacer />
          <SpacedView vertical=None>
            <Text style=theme.styles##textVeryLightOnBackground>
              (
                if (todayFirst == startDate) {
                  "Daily Average";
                } else if (previousFirst == startDate) {
                  "Last Week's Average";
                } else {
                  startDate->Js.Date.getDate->Js.Float.toString
                  ++ " - "
                  ++ endDate->Js.Date.getDate->Js.Float.toString
                  ++ " "
                  ++ endDate->Date.monthShortString
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
              <Separator style=theme.styles##separatorOnBackground />
              <SpacedView
                horizontal=None vertical=S style=Predefined.styles##row>
                <View style=Predefined.styles##flexGrow>
                  <Text
                    style=Style.(
                      list([
                        Theme.text##callout,
                        theme.styles##textOnBackground,
                      ])
                    )>
                    "Total Logged Time"->React.string
                  </Text>
                </View>
                <Text>
                  <Text
                    style=Style.(
                      list([
                        Theme.text##callout,
                        theme.styles##textLightOnBackground,
                      ])
                    )>
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
      [|getEvents|],
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
      <TitlePre style=theme.styles##textLightOnBackgroundDark>
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
      <Title style=theme.styles##textOnBackground> title->React.string </Title>
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
    <Separator style=theme.styles##separatorOnBackground />
    <FlatList
      ref=flatListRef
      horizontal=true
      pagingEnabled=true
      showsHorizontalScrollIndicator=false
      initialScrollIndex
      initialNumToRender=2
      data={weeks->React.Ref.current}
      style={Style.list([theme.styles##background, styleWidth])}
      getItemLayout
      keyExtractor={((first, _), _index) => first->Js.Date.toString}
      renderItem
      onViewableItemsChanged={onViewableItemsChanged->React.Ref.current}
    />
    <Separator style=theme.styles##separatorOnBackground />
    <BlockFootnote>
      {(
         "Updated "
         ++ DateFns.formatRelative(today->React.Ref.current, updatedAt)
       )
       ->React.string}
      <Spacer size=XS />
      {!refreshing
         ? React.null
         : <ActivityIndicator size={ActivityIndicator.Size.exact(8.)} />}
    </BlockFootnote>
    <Spacer />
    {let events = getEvents(startDate, endDate);
     let mapTitleDuration =
       events->Option.map(es =>
         es->Calendars.filterEvents(settings)->Calendars.mapTitleDuration
       );
     <TopActivities mapTitleDuration onFiltersPress onActivityPress />}
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
            {settings.activitiesSkippedFlag
               ? <Text style=Style.(textStyle(~color=theme.colors.blue, ()))>
                   "Reveal Hidden Activities"->React.string
                 </Text>
               : <Text style=Style.(textStyle(~color=theme.colors.blue, ()))>
                   "Mask Hidden Activities"->React.string
                 </Text>}
          </Center>
        </SpacedView>
        <Separator style=theme.styles##separatorOnBackground />
      </TouchableOpacity>
    </SpacedView>
    <Spacer />
  </>;
};
