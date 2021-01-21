open Belt
open ReactNative
open ReactMultiversal
open VirtualizedList

let styles = {
  open Style
  {"text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ())}
}->StyleSheet.create

let filterEventsByTitle = (
  events: array<ReactNativeCalendarEvents.calendarEventReadable>,
  title: string,
) => events->Array.keep(evt => !(!(evt.title == title)))

let sortEventsByDecreasingStartDate = (
  events: array<ReactNativeCalendarEvents.calendarEventReadable>,
) => events->SortArray.stableSortBy((a, b) =>
    a.startDate->Js.Date.fromString->Js.Date.getTime <
      b.startDate->Js.Date.fromString->Js.Date.getTime
      ? 1
      : switch a.startDate->Js.Date.fromString->Js.Date.getTime >
          b.startDate->Js.Date.fromString->Js.Date.getTime {
        | true => -1
        | false => 0
        }
  )

@react.component
let make = (
  ~activityTitle,
  ~refreshing,
  ~onRefreshDone,
  ~onSkipActivity,
  ~currentWeek: (string, string),
) => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let (getEvents, _updatedAt, requestUpdate) = React.useContext(Calendars.context)

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

  let (today, today_set) = React.useState(() => Date.now())
  let appState = ReactNativeHooks.useAppState()
  React.useEffect3(() => {
    if appState === #active {
      requestUpdate()
      today_set(_ => Date.now())
    }
    None
  }, (appState, today_set, requestUpdate))

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

  let ((startDate, supposedEndDate), currentDates_set) = React.useState(() => {
    let (start, end) = currentWeek
    (start->Js.Date.fromString, end->Js.Date.fromString)
  })

  let onViewableItemsChanged = React.useRef(itemsChanged =>
    if itemsChanged.viewableItems->Array.length == 1 {
      itemsChanged.viewableItems[0]
      ->Option.map(wrapper => currentDates_set(_ => wrapper.item))
      ->ignore
    }
  ).current

  let endDate = supposedEndDate->Date.min(today)

  let events =
    getEvents(startDate, endDate, true)
    ->Option.map(event =>
      event->filterEventsByTitle(activityTitle)->sortEventsByDecreasingStartDate
    )
    ->Option.getWithDefault([])

  let todayDates = Date.weekDates(today)

  let previousDates = Date.weekDates(today->DateFns.addDays(-7.))
  let _followingDates = Date.weekDates(today->DateFns.addDays(7.))

  let (todayFirst, _) = todayDates
  let (previousFirst, _) = previousDates

  let getItemLayout = React.useMemo1(((), _items, index) => {
    length: windowDimensions.width,
    offset: windowDimensions.width *. index->float,
    index: index,
  }, [windowDimensions.width])

  let renderItem = (renderItemProps: renderItemProps<'a>) => {
    let (currentStartDate, currentSupposedEndDate) = renderItemProps.item
    <WeeklyBarChartDetail
      today
      todayFirst
      previousFirst
      startDate=currentStartDate
      activityTitle
      supposedEndDate=currentSupposedEndDate
      style=styleWidth
    />
  }

  let flatListRef = React.useRef(Js.Nullable.null)

  React.useEffect2(() => {
    let (currentStartDate, _) = currentWeek
    let index = last5Weeks->Js.Array2.findIndex(week => {
      let (weekStart, _) = week
      weekStart->Js.Date.toString == currentStartDate
    })
    flatListRef.current
    ->Js.Nullable.toOption
    ->Option.map(flatList =>
      flatList->FlatList.scrollToIndex(FlatList.scrollToIndexParams(~index, ~animated=false, ()))
    )
    ->ignore
    None
  }, (last5Weeks, currentWeek))

  let themeModeKey = AppSettings.useTheme()
  let theme = Theme.useTheme(themeModeKey)
  let isSkipped =
    settings.activitiesSkipped->Array.some(skipped => Activities.isSimilar(skipped, activityTitle))
  <SpacedView horizontal=None>
    <Row> <Spacer size=XS /> <BlockHeading text="Category" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      {ActivityCategories.defaults->List.mapWithIndex((index, (id, name, colorName, iconName)) => {
        let color = colorName->ActivityCategories.getColor(theme.mode)
        <TouchableOpacity
          key=id
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
          }}>
          <View style={Predefined.styles["rowCenter"]}>
            <Spacer size=S />
            <SpacedView vertical=XS horizontal=None>
              <NamedIcon name=iconName fill=color />
            </SpacedView>
            <Spacer size=XS />
            <View style={Predefined.styles["flexGrow"]}>
              <SpacedView vertical=XS horizontal=None>
                <View style={Predefined.styles["row"]}>
                  <View style={Predefined.styles["flexGrow"]}>
                    <Text style={Style.array([styles["text"], theme.styles["text"]])}>
                      {name->React.string}
                    </Text>
                  </View>
                  {if id != settings->Calendars.categoryIdFromActivityTitle(activityTitle) {
                    <SVGCircle width={26.->Style.dp} height={26.->Style.dp} fill=color />
                  } else {
                    <SVGCheckmarkcircle width={26.->Style.dp} height={26.->Style.dp} fill=color />
                  }}
                  <Spacer size=S />
                </View>
              </SpacedView>
              {index !== ActivityCategories.defaults->List.length - 1
                ? <Separator style={theme.styles["separatorOnBackground"]} />
                : React.null}
            </View>
          </View>
        </TouchableOpacity>
      })->List.toArray->React.array} <Separator style={theme.styles["separatorOnBackground"]} />
    </View>
    <Spacer size=S />
    <Row> <Spacer size=XS /> <BlockHeading text="Activity chart" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
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
      <Separator style={theme.styles["separatorOnBackground"]} />
    </View>
    <Row> <Spacer size=XS /> <BlockHeading text="Events" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}> <Events startDate endDate events /> </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer size=L />
    <TouchableOpacity
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
                  Activities.isSimilar(alreadySkipped, activityTitle)
                ),
          }
        })
        onSkipActivity()
      }}>
      <Separator style={theme.styles["separatorOnBackground"]} />
      <SpacedView vertical=XS style={theme.styles["background"]}>
        <Center>
          <Text
            style={
              open Style
              textStyle(~color=theme.colors.red, ())
            }>
            {(!isSkipped ? "Hide Activity" : "Reveal Activity")->React.string}
          </Text>
        </Center>
      </SpacedView>
      <Separator style={theme.styles["separatorOnBackground"]} />
    </TouchableOpacity>
    <BlockFootnote>
      {(
        !isSkipped
          ? "This will hide similar activities from all reports."
          : "This will reveal similar activities in all reports."
      )->React.string}
    </BlockFootnote>
  </SpacedView>
}
