open Belt;
open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    })
  );

let title = "Your LifeTime";

[@react.component]
let make = (~onFiltersPress) => {
  let themeStyles = Theme.useStyles();
  let windowDimensions = Dimensions.useWindowDimensions();
  let styleWidth = Style.(style(~width=windowDimensions##width->dp, ()));

  let today = React.useRef(Date.now());
  let todayDates =
    React.useRef(
      Date.weekDates(~firstDayOfWeekIndex=1, today->React.Ref.current),
    );
  let previousDates =
    React.useRef(
      Date.weekDates(
        ~firstDayOfWeekIndex=1,
        today->React.Ref.current->Date.addDays(~numberOfDays=-7),
      ),
    );

  let data =
    React.useRef(
      Array.range(0, 51)
      ->Array.reverse
      ->Array.map(currentWeekReverseIndex =>
          Date.weekDates(
            ~firstDayOfWeekIndex=1,
            today
            ->React.Ref.current
            ->Date.addDays(~numberOfDays=- currentWeekReverseIndex * 7),
          )
        ),
    );
  let initialScrollIndex = data->React.Ref.current->Array.length - 1;

  let ((startDate, endDate), setCurrentDates) =
    React.useState(() =>
      data->React.Ref.current[data->React.Ref.current->Array.length - 1]
      ->Option.getWithDefault(todayDates->React.Ref.current)
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
    React.useCallback0(renderItemProps => {
      let (firstDay, lastDay) = renderItemProps##item;
      <View style=styleWidth>
        <SpacedView>
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
      </View>;
    });

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
           today->React.Ref.current->dayLongString
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
      <Row> <Spacer size=S /> <BlockHeading text="Weekly Chart" /> </Row>
      <Row>
        {todayFirst == startDate
           ? React.null
           : <BlockHeadingTouchable
               onPress=onShowThisWeek
               text="Show This Week"
             />}
        <Spacer size=S />
      </Row>
    </View>
    <Separator style=themeStyles##separatorOnBackground />
    <FlatList
      ref=flatListRef
      horizontal=true
      pagingEnabled=true
      showsHorizontalScrollIndicator=false
      initialScrollIndex
      data={data->React.Ref.current}
      style={Style.list([themeStyles##background, styleWidth])}
      getItemLayout
      keyExtractor={((first, _), _index) => first->Js.Date.toString}
      renderItem
      onViewableItemsChanged={onViewableItemsChanged->React.Ref.current}
    />
    <Separator style=themeStyles##separatorOnBackground />
    <Spacer />
    <TopActivities
      startDate
      endDate={endDate->Date.minDate(today->React.Ref.current)}
      onFiltersPress
    />
    <Spacer size=L />
  </>;
};
