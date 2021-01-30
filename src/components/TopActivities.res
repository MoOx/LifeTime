open Belt
open ReactNative
open ReactMultiversal

let numberOfActivitiesToShow = 8

@react.component
let make = (~mapTitleDuration, ~onFiltersPress, ~onActivityPress) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context)

  let theme = Theme.useTheme(AppSettings.useTheme())
  let calendars = Calendars.useCalendars(None)
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
      {calendars
      ->Option.map(calendars => Calendars.availableCalendars(calendars, settings))
      ->Option.map(c =>
        if c->Array.length === 0 {
          <SpacedView>
            <Center>
              <Spacer size=XXL />
              <Text
                style={Style.array([
                  Theme.text["title1"],
                  Theme.text["weight600"],
                  theme.styles["text"],
                ])}>
                {"No Events"->React.string}
              </Text>
              <Spacer />
              <Text style={theme.styles["textLight2"]}>
                {"You should select at least a calendar"->React.string}
              </Text>
              <Spacer size=XXL />
            </Center>
          </SpacedView>
        } else {
          React.null
        }
      )
      ->Option.getWithDefault(React.null)}
      {mapTitleDuration->Option.map(mapTitleDuration => {
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
                  settings
                  ->Calendars.categoryIdFromActivityTitle(title)
                  ->ActivityCategories.getFromId
                let color = colorName->ActivityCategories.getColor(theme.mode)
                <TouchableOpacity key=title onPress={_ => onActivityPress(title)}>
                  <View style={Predefined.styles["rowCenter"]}>
                    <Spacer size=S />
                    <SpacedView vertical=XS horizontal=None>
                      <NamedIcon name=iconName fill=color />
                    </SpacedView>
                    <Spacer size=XS />
                    <View style={Predefined.styles["flex"]}>
                      <SpacedView
                        vertical=XS horizontal=None style={Predefined.styles["rowCenter"]}>
                        <View style={Predefined.styles["flex"]}>
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
                        </View>
                        <Spacer size=XS />
                        <SVGChevronright
                          width={14.->Style.dp}
                          height={14.->Style.dp}
                          fill=Predefined.Colors.Ios.light.gray4
                        />
                        <Spacer size=S />
                      </SpacedView>
                      {index < mapTitleDuration->Array.length - 1 ||
                        (shouldShowMore ||
                        shouldShowLess)
                        ? <ListSeparator />
                        : React.null}
                    </View>
                  </View>
                </TouchableOpacity>
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
      })->Option.getWithDefault(
        <SpacedView vertical=XXL>
          <ActivityIndicator size=ActivityIndicator.Size.small />
        </SpacedView>,
      )}
    </View>
    <ListSeparator />
  </>
}
