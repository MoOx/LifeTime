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

  let ((startDate, endDate), setCurrentDates) =
    React.useState(() =>
      data->React.Ref.current[data->React.Ref.current->Array.length - 1]
      ->Option.getWithDefault(
          Date.weekDates(~firstDayOfWeekIndex=1, today->React.Ref.current),
        )
    );

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
          <Text> {firstDay->Js.Date.toString->React.string} </Text>
          <Text>
            {lastDay
             ->Date.minDate(today->React.Ref.current)
             ->Js.Date.toString
             ->React.string}
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

  <>
    <SpacedView>
      <TitlePre style=themeStyles##textLightOnBackground>
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
      <Row> <Spacer size=S /> </Row>
    </View>
    <Separator style=themeStyles##separatorOnBackground />
    <FlatList
      horizontal=true
      pagingEnabled=true
      showsHorizontalScrollIndicator=false
      initialScrollIndex={data->React.Ref.current->Array.length - 1}
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
