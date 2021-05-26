open Belt
open ReactNative
open ReactMultiversal

let numberOfActivitiesToShow = 8

@react.component
let make = (~activities, ~mapTitleDuration, ~onActivityPress, ~onFiltersPress, ~startDate, ~endDate) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let (activitiesToShow, setActivitiesToShow) = React.useState(() => numberOfActivitiesToShow)

  let (_, maxDurationInMin) =
    mapTitleDuration->Option.flatMap(dpt => dpt[0])->Option.getWithDefault(("", 50.))

  let (width, setWidth) = React.useState(() => 0.)
  let onLayout = React.useCallback1((layoutEvent: Event.layoutEvent) => {
    let width = layoutEvent.nativeEvent.layout.width
    setWidth(_ => width)
  }, [setWidth])
  // keep some place for duration string
  let availableWidthForBar = width -. 85. -. SpacedView.space *. 4.

  <>
    <View style={Predefined.styles["rowSpaceBetween"]}>
      <Row> <Spacer size=XS /> <BlockHeading text="Top Activities" /> </Row>
      <Row>
        <BlockHeadingTouchable onPress={_ => onFiltersPress()} text="Customize report" />
        <Spacer size=XS />
      </Row>
    </View>
    <ListSeparator />
    <View onLayout style={theme.styles["background"]}>
      {mapTitleDuration
      ->Option.map(mapTitleDuration => {
        let shouldShowMore = mapTitleDuration->Array.length > activitiesToShow
        let shouldShowLess = activitiesToShow > numberOfActivitiesToShow
        <>
          {switch mapTitleDuration {
          | [] =>
            <SpacedView horizontal=L>
              <Center>
                <Spacer />
                <Text
                  style={Style.array([
                    Theme.text["title3"],
                    Theme.text["weight500"],
                    theme.styles["textLight2"],
                  ])}>
                  {"No activities"->React.string}
                </Text>
                <Spacer size=XXS />
                <Text style={Style.array([Theme.text["footnote"], theme.styles["textLight2"]])}>
                  {"You should add some events to your calendar or activate more calendars."->React.string}
                </Text>
                <Spacer />
              </Center>
            </SpacedView>
          | _ => <>
              {mapTitleDuration
              ->Array.slice(~offset=0, ~len=activitiesToShow)
              ->Array.mapWithIndex((index, (title, totalDurationInMin)) => {
                let durationString = totalDurationInMin->Date.minToString
                let (_, _, colorName, iconName) =
                  title
                  ->Calendars.categoryIdFromActivityTitle(activities)
                  ->ActivityCategories.getFromId
                let color = colorName->ActivityCategories.getColor(theme.mode)
                <React.Fragment key=title>
                  <ListItem
                    onPress={_ => onActivityPress(title, (startDate, endDate))}
                    left={<NamedIcon name=iconName fill=color />}
                    right={<SVGChevronright
                      width={14.->Style.dp}
                      height={14.->Style.dp}
                      fill=Predefined.Colors.Ios.light.gray4
                    />}>
                    <Text
                      style={
                        open Style
                        array([Theme.text["callout"], theme.styles["text"]])
                      }
                      numberOfLines=1>
                      {title->React.string}
                    </Text>
                    <Spacer size=XXS />
                    <Row style={Predefined.styles["alignCenter"]}>
                      <View
                        style={
                          open Style
                          array([
                            theme.styles["backgroundGray3"],
                            viewStyle(
                              // ~backgroundColor=color,

                              ~width=(totalDurationInMin /.
                              maxDurationInMin *.
                              availableWidthForBar)->dp,
                              ~height=6.->dp,
                              ~borderRadius=6.,
                              ~overflow=#hidden,
                              (),
                            ),
                          ])
                        }
                      />
                      <Spacer size=XXS />
                      <Text
                        style={
                          open Style
                          array([Theme.text["footnote"], theme.styles["textLight2"]])
                        }
                        numberOfLines=1
                        adjustsFontSizeToFit=true>
                        {durationString->React.string}
                      </Text>
                    </Row>
                  </ListItem>
                  {index < mapTitleDuration->Array.length - 1 || (shouldShowMore || shouldShowLess)
                    ? <ListSeparator spaceStart={Spacer.size(S) *. 2. +. NamedIcon.size} />
                    : React.null}
                </React.Fragment>
              })
              ->React.array}
              {shouldShowMore || shouldShowLess
                ? <Row>
                    <Spacer size=L />
                    <View
                      style={
                        open Style
                        array([Predefined.styles["rowSpaceBetween"], Predefined.styles["flexGrow"]])
                      }>
                      {mapTitleDuration->Array.length > activitiesToShow
                        ? <TouchableOpacity
                            onPress={_ =>
                              setActivitiesToShow(activitiesToShow =>
                                activitiesToShow + numberOfActivitiesToShow
                              )}>
                            <SpacedView vertical=XS horizontal=S>
                              <Text
                                style={
                                  open Style
                                  array([Theme.text["callout"], theme.styles["textBlue"]])
                                }>
                                {"Show More"->React.string}
                              </Text>
                            </SpacedView>
                          </TouchableOpacity>
                        : React.null}
                      <Spacer />
                      {activitiesToShow > numberOfActivitiesToShow
                        ? <TouchableOpacity
                            onPress={_ =>
                              setActivitiesToShow(activitiesToShow =>
                                activitiesToShow - numberOfActivitiesToShow
                              )}>
                            <SpacedView vertical=XS horizontal=S>
                              <Text
                                style={
                                  open Style
                                  array([Theme.text["callout"], theme.styles["textBlue"]])
                                }>
                                {"Show Less"->React.string}
                              </Text>
                            </SpacedView>
                          </TouchableOpacity>
                        : React.null}
                    </View>
                    <ListSeparator />
                  </Row>
                : React.null}
            </>
          }}
        </>
      })
      ->Option.getWithDefault(
        <SpacedView vertical=XXL>
          <ActivityIndicator size=ActivityIndicator.Size.small />
        </SpacedView>,
      )}
    </View>
    <ListSeparator />
  </>
}