open Belt
open ReactNative
open ReactMultiversal

let title = "Edit Goal"

let quickDurations = [30., 45., 60., 90.]

@bs.module("react")
external useEffect6: (
  @bs.uncurry (unit => option<unit => unit>),
  ('a, 'b, 'c, 'd, 'e, 'f),
) => unit = "useEffect"

@react.component
let make = (
  ~initialGoal: option<Goal.t>=?,
  ~initialType: option<Goal.Type.t>=?,
  ~onChange,
  ~onDelete=?,
) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context)

  let theme = Theme.useTheme(AppSettings.useTheme())

  let (title, setTitle) = React.useState(() =>
    initialGoal->Option.map(g => g.title)->Option.getWithDefault("")
  )
  let (type_, setType) = React.useState(() =>
    initialGoal
    ->Option.map(g => g.type_->Goal.Type.fromSerialized)
    ->Option.getWithDefault(initialType)
  )
  let (days, setDays) = React.useState(() =>
    initialGoal
    ->Option.map(g => g.days)
    ->Option.getWithDefault(Array.range(0, 6)->Array.map(_ => true))
  )
  let numberOfDays = days->Array.reduce(0., (total, dayOn) => dayOn ? total +. 1. : total)
  let (minutes, setMinutes) = React.useState(() =>
    initialGoal->Option.map(g => g.durationPerDay)->Option.getWithDefault(60.)
  )
  let throttleMinutesTimer = React.useRef(None)
  let handleSliderMinutesChange = React.useCallback1(value => {
    throttleMinutesTimer.current->Option.map(Js.Global.clearTimeout)->ignore
    throttleMinutesTimer.current = Some(Js.Global.setTimeout(() => setMinutes(_ => value), 100))
  }, [])
  let (categoriesSelected, setCategoriesSelected) = React.useState(() =>
    initialGoal->Option.map(g => g.categoriesId)->Option.getWithDefault([])
  )
  let (categoriesOpened, setCategoriesOpen) = React.useState(() => [])
  let (activitiesSelected, setActivitiesSelected) = React.useState(() =>
    initialGoal->Option.map(g => g.activitiesId)->Option.getWithDefault([])
  )

  let durationInMinutes =
    Js.Date.makeWithYMDHM(
      ~year=0.,
      ~month=0.,
      ~date=0.,
      ~hours=0.,
      ~minutes=minutes *. numberOfDays,
      (),
    )
    ->Date.durationInMs(Calendars.date0)
    ->Date.msToMin

  useEffect6(() => {
    switch (
      // title,
      type_,
      minutes,
      days,
      categoriesSelected,
      activitiesSelected,
    ) {
    | (
        // title,
        Some(type_),
        minutes,
        days,
        categoriesSelected,
        activitiesSelected,
      )
      when minutes > 0. &&
        (days->Array.some(day => day) &&
        (categoriesSelected->Array.length > 0 || activitiesSelected->Array.length > 0)) =>
      onChange(Some(Goal.make(title, type_, minutes, days, categoriesSelected, activitiesSelected)))
    | _ => onChange(None)
    }
    None
  }, (title, type_, minutes, days, categoriesSelected, activitiesSelected))

  let dash =
    <View
      style={
        open Style
        viewStyle(~width=1.->dp, ~height=12.->dp, ~backgroundColor=theme.colors.gray5, ())
      }
    />

  let handleCategoryCheck = React.useCallback2((id, selectedCategoryActivities) => {
    setCategoriesSelected(categoriesSelected =>
      if categoriesSelected->Array.some(catKey => catKey == id) {
        categoriesSelected->Array.keep(catKey => catKey != id)
      } else {
        categoriesSelected->Array.concat([id])
      }
    )
    setActivitiesSelected(activitiesSelected =>
      activitiesSelected->Array.keep(act =>
        !(selectedCategoryActivities->Array.some(selCatAct => selCatAct == act))
      )
    )
  }, (setCategoriesSelected, setActivitiesSelected))
  let handleCategoryOpen = React.useCallback1(key => setCategoriesOpen(categoriesOpened =>
      if categoriesOpened->Array.some(catKey => catKey == key) {
        categoriesOpened->Array.keep(catKey => catKey != key)
      } else {
        categoriesOpened->Array.concat([key])
      }
    ), [setCategoriesOpen])
  let handleActivityCheckPress = React.useCallback1(
    key => setActivitiesSelected(activitiesSelected =>
        if activitiesSelected->Array.some(act => act == key) {
          activitiesSelected->Array.keep(act => act != key)
        } else {
          activitiesSelected->Array.concat([key])
        }
      ),
    [setActivitiesSelected],
  )

  <SpacedView horizontal=None>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <SpacedView vertical=S>
        <TextInput
          autoCapitalize=#words
          autoCompleteType=#off
          autoCorrect=true
          clearButtonMode=#whileEditing
          keyboardAppearance={switch theme.mode {
          | #light => #light
          | #dark => #dark
          }}
          maxLength=100
          onChangeText={value => setTitle(_ => value)}
          placeholder="Title (Optional)"
          placeholderTextColor=theme.colors.gray3
          returnKeyType=#done_
          value=title
          style={
            open Style
            array([
              Predefined.styles["flex"],
              Theme.text["body"],
              theme.styles["textOnBackground"],
              textStyle(~padding=0.->dp, ()),
            ])
          }
        />
      </SpacedView>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Type" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <TouchableWithoutFeedback onPress={_ => setType(_ => Some(Goal.Type.Goal))}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <NamedIcon name=#scope fill=theme.colors.green />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None>
              <View style={Predefined.styles["row"]}>
                <View
                  style={
                    open Style
                    array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
                  }>
                  <Text
                    style={
                      open Style
                      array([Theme.text["body"], theme.styles["textOnBackground"]])
                    }>
                    {"Goal to Reach"->React.string}
                  </Text>
                </View>
                {switch type_ {
                | Some(Goal) =>
                  <SVGCheckmark
                    width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue
                  />
                | _ => React.null
                }}
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style={theme.styles["separatorOnBackground"]} />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={_ => setType(_ => Some(Goal.Type.Limit))}>
        <View style={Predefined.styles["rowCenter"]}>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <NamedIcon name=#hourglass fill=theme.colors.orange />
          </SpacedView>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <SpacedView vertical=XS horizontal=None>
              <View style={Predefined.styles["row"]}>
                <View
                  style={
                    open Style
                    array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
                  }>
                  <Text
                    style={
                      open Style
                      array([Theme.text["body"], theme.styles["textOnBackground"]])
                    }>
                    {"Limit to Respect"->React.string}
                  </Text>
                </View>
                {switch type_ {
                | Some(Limit) =>
                  <SVGCheckmark
                    width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue
                  />
                | _ => React.null
                }}
                <Spacer size=S />
              </View>
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Separator style={theme.styles["separatorOnBackground"]} />
    </View>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Days" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <SpacedView style={Predefined.styles["rowSpaceBetween"]}>
        {days
        ->Array.sliceToEnd(Date.weekStartsOn)
        ->Array.concat(days->Array.slice(~offset=0, ~len=Date.weekStartsOn))
        ->Array.mapWithIndex((index, dayOn) => {
          let day = mod(index + Date.weekStartsOn, 7)
          <TouchableWithoutFeedback key={index->string_of_int} onPress={_ => setDays(days => {
                let cp = days->Array.copy
                cp->Array.set(day, !dayOn)->ignore
                cp
              })} hitSlop={View.edgeInsets(~top=20., ~bottom=20., ~left=20., ~right=20., ())}>
            <View>
              <Text
                style={Style.array([
                  Theme.text["caption1"],
                  theme.styles["textVeryLightOnBackground"],
                ])}>
                {day->float->Date.dayShortString->React.string}
              </Text>
              <Spacer size=XXS />
              {if !dayOn {
                <SVGCircle width={26.->Style.dp} height={26.->Style.dp} fill=theme.colors.gray />
              } else {
                <SVGCheckmarkcircle
                  width={26.->Style.dp} height={26.->Style.dp} fill=theme.colors.blue
                />
              }}
            </View>
          </TouchableWithoutFeedback>
        })
        ->React.array}
      </SpacedView>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <BlockFootnote>
      {"Select the days where you would like to respect this goal."->React.string}
    </BlockFootnote>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Duration" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <Spacer size=S />
      <View style={Predefined.styles["row"]}>
        <Spacer size=S /> {quickDurations->Array.map(quickDuration =>
          <TouchableOpacity
            key={quickDuration->Js.Float.toString}
            onPress={_ => setMinutes(_ => quickDuration)}
            style={Predefined.styles["flexGrow"]}>
            <SpacedView vertical=XS horizontal=XS style={Predefined.styles["center"]}>
              <Text
                style={
                  open Style
                  array([
                    Theme.text["subhead"],
                    textStyle(~color=theme.colors.blue, ~fontWeight=Theme.fontWeights.semiBold, ()),
                  ])
                }
                numberOfLines=1
                adjustsFontSizeToFit=true>
                {(quickDuration->Js.Float.toFixed ++ "min")->React.string}
              </Text>
            </SpacedView>
          </TouchableOpacity>
        )->React.array} <Spacer size=S />
      </View>
      <SpacedView vertical=XS>
        <View style={Predefined.styles["rowCenter"]}>
          <Text
            style={Style.array([
              Theme.text["caption1"],
              theme.styles["textVeryLightOnBackground"],
            ])}>
            {"0"->React.string}
          </Text>
          <Spacer size=XS />
          <View style={Predefined.styles["flex"]}>
            <View
              style={
                open Style
                array([
                  StyleSheet.absoluteFill,
                  viewStyle(~marginHorizontal=15.->dp, ()),
                  Predefined.styles["rowSpaceBetween"],
                ])
              }>
              dash dash dash dash dash
            </View>
            <ReactNativeSlider
              style={
                open Style
                array([Predefined.styles["flexGrow"], style(~minHeight=40.->dp, ())])
              }
              minimumValue=0.
              maximumValue={24. *. 60.}
              step=15.
              value=minutes
              onValueChange=handleSliderMinutesChange
            />
          </View>
          <Spacer size=XS />
          <Text
            style={Style.array([
              Theme.text["caption1"],
              theme.styles["textVeryLightOnBackground"],
            ])}>
            {"24"->React.string}
          </Text>
        </View>
      </SpacedView>
      <View style={Predefined.styles["rowSpaceBetween"]}>
        <Spacer />
        <View style={Predefined.styles["flex"]}>
          <Separator style={theme.styles["separatorOnBackground"]} />
          <SpacedView horizontal=None vertical=S style={Predefined.styles["row"]}>
            <Text
              style={
                open Style
                array([
                  Predefined.styles["flex"],
                  Theme.text["callout"],
                  theme.styles["textOnBackground"],
                ])
              }>
              {"Average Time per Day"->React.string}
            </Text>
            <Text
              style={
                open Style
                array([Theme.text["callout"], theme.styles["textLightOnBackground"]])
              }
              numberOfLines=1
              adjustsFontSizeToFit=true>
              {(durationInMinutes /. numberOfDays)->Date.minToString->React.string}
            </Text>
            <Spacer />
          </SpacedView>
        </View>
      </View>
      <View style={Predefined.styles["rowSpaceBetween"]}>
        <Spacer />
        <View style={Predefined.styles["flex"]}>
          <Separator style={theme.styles["separatorOnBackground"]} />
          <SpacedView horizontal=None vertical=S style={Predefined.styles["row"]}>
            <Text
              style={
                open Style
                array([
                  Predefined.styles["flex"],
                  Theme.text["callout"],
                  theme.styles["textOnBackground"],
                  textStyle(~fontWeight=Theme.fontWeights.medium, ()),
                ])
              }>
              {"Weekly Goal"->React.string}
            </Text>
            <Text
              style={
                open Style
                array([
                  Theme.text["callout"],
                  theme.styles["textLightOnBackground"],
                  textStyle(~fontWeight=Theme.fontWeights.semiBold, ()),
                ])
              }
              numberOfLines=1
              adjustsFontSizeToFit=true>
              {durationInMinutes->Date.minToString->React.string}
            </Text>
            <Spacer />
          </SpacedView>
        </View>
      </View>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <BlockFootnote>
      {j`Goals are mesured on a weekly basis. The time spent on an entire week is what matters to achieve your goal.`->React.string}
    </BlockFootnote>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Category or Activity" /> </Row>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      {ActivityCategories.defaults->List.toArray->Array.mapWithIndex((index, category) => {
        let (id, name, colorName, iconName) = category
        let color = colorName->ActivityCategories.getColor(theme.mode)
        let selectedCat = categoriesSelected->Array.some(catKey => catKey == id)
        let opened = categoriesOpened->Array.some(catKey => catKey == id)
        let separator = index != ActivityCategories.defaults->List.length - 1
        let categoryActivities =
          settings.activities->Array.keep(activity => activity.categoryId == id)
        let selectedCategoryActivities = categoryActivities->Array.reduce([], (selActs, activity) =>
          if activitiesSelected->Array.some(actiId => actiId == activity.id) {
            selActs->Array.concat([activity.id])
          } else {
            selActs
          }
        )
        let canOpenCategory =
          id != ActivityCategories.unknown && categoryActivities->Array.length > 0
        <React.Fragment key=id>
          <View style={Predefined.styles["rowCenter"]}>
            <Spacer size=S />
            <TouchableWithoutFeedback
              onPress={_ => handleCategoryCheck(id, selectedCategoryActivities)}>
              <View>
                <SpacedView vertical=XS horizontal=None>
                  {if !selectedCat {
                    <SVGCircle
                      width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.gray
                    />
                  } else {
                    <SVGCheckmarkcircle
                      width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue
                    />
                  }}
                </SpacedView>
              </View>
            </TouchableWithoutFeedback>
            <Spacer size=XS />
            <TouchableWithoutFeedback
              onPress={_ =>
                canOpenCategory
                  ? handleCategoryOpen(id)
                  : handleCategoryCheck(id, selectedCategoryActivities)}>
              <View style={Predefined.styles["flex"]}>
                <View style={Predefined.styles["rowCenter"]}>
                  <SpacedView vertical=XS horizontal=None>
                    <NamedIcon name=iconName fill=color />
                  </SpacedView>
                  <Spacer size=XS />
                  <View style={Predefined.styles["flex"]}>
                    <SpacedView
                      vertical=XS
                      horizontal=None
                      style={
                        open Style
                        array([Predefined.styles["flex"], Predefined.styles["center"]])
                      }>
                      <View style={Predefined.styles["rowCenter"]}>
                        <View style={Predefined.styles["flex"]}>
                          <Text
                            style={Style.array([
                              Theme.text["body"],
                              theme.styles["textOnBackground"],
                            ])}>
                            {name->React.string}
                          </Text>
                        </View>
                        {selectedCat || selectedCategoryActivities->Array.length > 0
                          ? <>
                              <Text
                                style={Style.array([
                                  Theme.text["subhead"],
                                  theme.styles["textVeryLightOnBackground"],
                                ])}>
                                {(
                                  selectedCat
                                    ? "All"
                                    : {
                                        let numberOfActivities =
                                          selectedCategoryActivities->Array.length
                                        switch numberOfActivities {
                                        | 1 => numberOfActivities->string_of_int ++ " activity"
                                        | _ => numberOfActivities->string_of_int ++ " activities"
                                        }
                                      }
                                )->React.string}
                              </Text>
                              <Spacer size=S />
                            </>
                          : React.null}
                        // using a key because (at least in simulator, it seems to be buggy)
                        <Animated.View
                          key={opened ? "opened" : "unopened"}
                          style={
                            open Style
                            viewStyle(
                              ~opacity=canOpenCategory ? 1. : 0.05,
                              ~transform=[rotate(~rotate=(opened ? 90. : 0.)->deg)],
                              (),
                            )
                          }>
                          <SVGChevronright
                            width={14.->Style.dp}
                            height={14.->Style.dp}
                            fill=Predefined.Colors.Ios.light.gray4
                          />
                        </Animated.View>
                        <Spacer size=S />
                      </View>
                    </SpacedView>
                    {separator
                      ? <Separator style={theme.styles["separatorOnBackground"]} />
                      : React.null}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
          {opened ? categoryActivities->Array.mapWithIndex((index, activity) => {
                let selected =
                  selectedCat || activitiesSelected->Array.some(key => key == activity.id)
                let separator = separator || index != categoryActivities->Array.length - 1
                <View
                  key=activity.id
                  style={
                    open Style
                    array([
                      Predefined.styles["rowCenter"],
                      viewStyle(
                        ~backgroundColor="rgba(125,125,125,0.03)",
                        ~opacity=selectedCat ? 0.5 : 1.,
                        (),
                      ),
                    ])
                  }>
                  <Spacer size=S />
                  <TouchableWithoutFeedback
                    disabled=selectedCat onPress={_ => handleActivityCheckPress(activity.id)}>
                    <View>
                      <SpacedView vertical=XS horizontal=None>
                        {if !selected {
                          <SVGCircle
                            width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.gray
                          />
                        } else {
                          <SVGCheckmarkcircle
                            width={22.->Style.dp} height={22.->Style.dp} fill=theme.colors.blue
                          />
                        }}
                      </SpacedView>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback
                    disabled=selectedCat onPress={_ => handleActivityCheckPress(activity.id)}>
                    <View style={Predefined.styles["flex"]}>
                      <View style={Predefined.styles["rowCenter"]}>
                        <SpacedView
                          vertical=XS horizontal=Custom(13.) style={Predefined.styles["center"]}>
                          <NamedIcon
                            name=iconName fill=color width={22.->Style.dp} height={22.->Style.dp}
                          />
                        </SpacedView>
                        <View style={Predefined.styles["flex"]}>
                          <SpacedView vertical=XS horizontal=None>
                            <View style={Predefined.styles["rowCenter"]}>
                              <View style={Predefined.styles["flex"]}>
                                <Text
                                  style={
                                    open Style
                                    array([
                                      Predefined.styles["flex"],
                                      Theme.text["body"],
                                      theme.styles["textOnBackground"],
                                    ])
                                  }
                                  numberOfLines=1>
                                  {activity.title->React.string}
                                </Text>
                              </View>
                              <Spacer size=S />
                            </View>
                          </SpacedView>
                          {separator
                            ? <Separator style={theme.styles["separatorOnBackground"]} />
                            : React.null}
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              })->React.array : React.null}
        </React.Fragment>
      })->React.array}
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <BlockFootnote>
      {j`By selecting a category, all future activities in that category will be included.`->React.string}
    </BlockFootnote>
    {onDelete->Option.map(onDelete => <>
      <Spacer size=L />
      <Separator style={theme.styles["separatorOnBackground"]} />
      <View style={theme.styles["background"]}>
        <TouchableWithoutFeedback
          onPress={_ =>
            Alert.alert(
              ~title="Delete This Goal",
              ~message="You are about to delete this goal.\nAre you sure?",
              ~buttons=[
                Alert.button(~text="Cancel", ~style=#default, ()),
                Alert.button(~text="Delete", ~style=#destructive, ~onPress=() => onDelete(), ()),
              ],
              (),
            )}>
          <View>
            <SpacedView vertical=XS horizontal=XS style={Predefined.styles["rowCenter"]}>
              <Text
                style={
                  open Style
                  array([Theme.text["body"], textStyle(~color=theme.colors.red, ())])
                }>
                {"Delete Goal"->React.string}
              </Text>
            </SpacedView>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <Separator style={theme.styles["separatorOnBackground"]} />
    </>)->Option.getWithDefault(React.null)}
    <Spacer />
  </SpacedView>
}
