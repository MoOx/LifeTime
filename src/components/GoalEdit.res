open Belt
open ReactNative
open ReactNative.Style
open ReactMultiversal

let title = "Edit Goal"

let quickDurations = [30., 45., 60., 90.]
let checkSize = 22.

@react.component
let make = (
  ~activities: array<Activities.t>,
  ~initialGoal: option<Goal.t>=?,
  ~initialType: option<Goal.Type.t>=?,
  ~onChange,
  ~onDelete=?,
) => {
  let theme = Theme.useTheme(AppSettings.useTheme())

  let (title, setTitle) = React.useState(() =>
    initialGoal->Option.map(g => g.title)->Option.getWithDefault("")
  )
  let (mode, setType) = React.useState(() =>
    initialGoal
    ->Option.map(g => g.mode->Goal.Type.fromSerialized)
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
  }, [setMinutes])
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

  React.useEffect7(() => {
    switch (
      // title,
      mode,
      minutes,
      days,
      categoriesSelected,
      activitiesSelected,
    ) {
    | (
        // title,
        Some(mode),
        minutes,
        days,
        categoriesSelected,
        activitiesSelected,
      )
      if minutes > 0. &&
        (days->Array.some(day => day) &&
        (categoriesSelected->Array.length > 0 || activitiesSelected->Array.length > 0)) =>
      onChange(
        Some(
          Goal.make(
            ~title,
            ~mode,
            ~durationPerDay=minutes,
            ~days,
            ~categoriesId=categoriesSelected,
            ~activitiesId=activitiesSelected,
            ~period=#week, // @todo: make this a setting
          ),
        ),
      )
    | _ => onChange(None)
    }
    None
  }, (title, mode, minutes, days, categoriesSelected, activitiesSelected, onChange))

  let dash =
    <View
      style={viewStyle(~width=1.->dp, ~height=12.->dp, ~backgroundColor=theme.colors.gray5, ())}
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
  let handleCategoryOpen = React.useCallback1(key =>
    setCategoriesOpen(categoriesOpened =>
      if categoriesOpened->Array.some(catKey => catKey == key) {
        categoriesOpened->Array.keep(catKey => catKey != key)
      } else {
        categoriesOpened->Array.concat([key])
      }
    )
  , [setCategoriesOpen])
  let handleActivityCheckPress = React.useCallback1(key =>
    setActivitiesSelected(activitiesSelected =>
      if activitiesSelected->Array.some(act => act == key) {
        activitiesSelected->Array.keep(act => act != key)
      } else {
        activitiesSelected->Array.concat([key])
      }
    )
  , [setActivitiesSelected])

  let debounced = Hooks.useDebounce()

  <SpacedView horizontal=None>
    <ListSeparator />
    <View style={theme.styles["background"]}>
      <SpacedView vertical=S>
        <TextInput
          testID={"GoalEdit_title"}
          autoCapitalize=#words
          autoComplete=#off
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
          style={array([
            Predefined.styles["flex"],
            Theme.text["body"],
            theme.styles["text"],
            textStyle(~padding=0.->dp, ()),
          ])}
        />
      </SpacedView>
    </View>
    <ListSeparator />
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Type" /> </Row>
    <ListSeparator />
    <ListItem
      testID="GoalEdit_type_goal"
      onPress={_ => setType(_ => Some(Goal.Type.Goal))}
      left={<NamedIcon name=#scope fill=theme.colors.green />}
      right={switch mode {
      | Some(Goal) =>
        <SVGCheckmark width={checkSize->dp} height={checkSize->dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      <ListItemText> {"Goal to Reach"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator spaceStart={Spacer.size(S) *. 2. +. NamedIcon.size} />
    <ListItem
      testID="GoalEdit_type_limit"
      onPress={_ => setType(_ => Some(Goal.Type.Limit))}
      left={<NamedIcon name=#hourglass fill=theme.colors.orange />}
      right={switch mode {
      | Some(Limit) =>
        <SVGCheckmark width={checkSize->dp} height={checkSize->dp} fill=theme.colors.blue />
      | _ => React.null
      }}>
      <ListItemText> {"Limit to Respect"->React.string} </ListItemText>
    </ListItem>
    <ListSeparator />
    <Spacer />
    {!debounced
      ? React.null
      : <>
          <Row> <Spacer size=XS /> <BlockHeading text="Days" /> </Row>
          <ListSeparator />
          <View style={theme.styles["background"]}>
            <SpacedView style={Predefined.styles["rowSpaceBetween"]}>
              {Date.weekIndices
              ->Array.map(day => {
                let dayOn = days->Array.getExn(day)
                <Pressable
                  key={day->string_of_int}
                  onPress={_ =>
                    setDays(days => {
                      let cp = days->Array.copy
                      cp->Array.set(day, !dayOn)->ignore
                      cp
                    })}
                  hitSlop=HitSlops.m>
                  {_ =>
                    <View>
                      <Text style={array([Theme.text["caption1"], theme.styles["textLight2"]])}>
                        {day->float->Date.dayShortString->React.string}
                      </Text>
                      <Spacer size=XXS />
                      {if !dayOn {
                        <SVGCircle width={26.->dp} height={26.->dp} fill=theme.colors.gray />
                      } else {
                        <SVGCheckmarkcircle
                          width={26.->dp} height={26.->dp} fill=theme.colors.blue
                        />
                      }}
                    </View>}
                </Pressable>
              })
              ->React.array}
            </SpacedView>
          </View>
          <ListSeparator />
          <BlockFootnote>
            {"Select the days where you would like to respect this goal."->React.string}
          </BlockFootnote>
          <Spacer />
          <Row> <Spacer size=XS /> <BlockHeading text="Duration" /> </Row>
          <ListSeparator />
          <View style={theme.styles["background"]}>
            <Spacer size=S />
            <View style={Predefined.styles["row"]}>
              <Spacer size=S />
              {quickDurations
              ->Array.map(quickDuration =>
                <TouchableOpacity
                  testID={"GoalEdit_quickDuration_" ++ quickDuration->Js.Float.toString}
                  key={quickDuration->Js.Float.toString}
                  onPress={_ => setMinutes(_ => quickDuration)}
                  style={Predefined.styles["flexGrow"]}>
                  <SpacedView vertical=XS horizontal=XS style={Predefined.styles["center"]}>
                    <Text
                      style={array([
                        Theme.text["subhead"],
                        Theme.text["weight600"],
                        textStyle(~color=theme.colors.blue, ()),
                      ])}
                      numberOfLines=1
                      adjustsFontSizeToFit=true>
                      {(quickDuration->Js.Float.toFixed ++ "min")->React.string}
                    </Text>
                  </SpacedView>
                </TouchableOpacity>
              )
              ->React.array}
              <Spacer size=S />
            </View>
            <SpacedView vertical=XS>
              <View style={Predefined.styles["rowCenter"]}>
                <Text style={array([Theme.text["caption1"], theme.styles["textLight2"]])}>
                  {"0"->React.string}
                </Text>
                <Spacer size=XS />
                <View style={Predefined.styles["flex"]}>
                  <View
                    style={array([
                      StyleSheet.absoluteFill,
                      viewStyle(~marginHorizontal=15.->dp, ()),
                      Predefined.styles["rowSpaceBetween"],
                    ])}>
                    dash dash dash dash dash
                  </View>
                  <ReactNativeSlider
                    testID="GoalEdit_durationSlider"
                    style={array([Predefined.styles["flexGrow"], style(~minHeight=40.->dp, ())])}
                    minimumValue=0.
                    maximumValue={24. *. 60.}
                    step=15.
                    value=minutes
                    onSlidingComplete=handleSliderMinutesChange
                    onValueChange=handleSliderMinutesChange
                  />
                </View>
                <Spacer size=XS />
                <Text style={array([Theme.text["caption1"], theme.styles["textLight2"]])}>
                  {"24"->React.string}
                </Text>
              </View>
            </SpacedView>
            <ListSeparator spaceStart={Spacer.size(S)} />
            <View style={Predefined.styles["rowSpaceBetween"]}>
              <Spacer />
              <View style={Predefined.styles["flex"]}>
                <SpacedView horizontal=None vertical=S style={Predefined.styles["row"]}>
                  <Text
                    style={array([
                      Predefined.styles["flex"],
                      Theme.text["callout"],
                      theme.styles["text"],
                    ])}>
                    {"Average Time per Day"->React.string}
                  </Text>
                  <Text
                    style={array([Theme.text["callout"], theme.styles["textLight1"]])}
                    numberOfLines=1
                    adjustsFontSizeToFit=true>
                    {(durationInMinutes /. numberOfDays)->Date.minToString->React.string}
                  </Text>
                  <Spacer />
                </SpacedView>
              </View>
            </View>
            <ListSeparator spaceStart={Spacer.size(S)} />
            <View style={Predefined.styles["rowSpaceBetween"]}>
              <Spacer />
              <View style={Predefined.styles["flex"]}>
                <SpacedView horizontal=None vertical=S style={Predefined.styles["row"]}>
                  <Text
                    style={array([
                      Predefined.styles["flex"],
                      Theme.text["callout"],
                      Theme.text["weight500"],
                      theme.styles["text"],
                    ])}>
                    {"Weekly Goal"->React.string}
                  </Text>
                  <Text
                    style={array([
                      Theme.text["callout"],
                      Theme.text["weight600"],
                      theme.styles["textLight1"],
                    ])}
                    numberOfLines=1
                    adjustsFontSizeToFit=true>
                    {durationInMinutes->Date.minToString->React.string}
                  </Text>
                  <Spacer />
                </SpacedView>
              </View>
            </View>
          </View>
          <ListSeparator />
          <BlockFootnote>
            {j`Goals are mesured on a weekly basis. The time spent on an entire week is what matters to achieve your goal.`->React.string}
          </BlockFootnote>
          <Spacer />
          <Row> <Spacer size=XS /> <BlockHeading text="Category or Activity" /> </Row>
          <ListSeparator />
          <View style={theme.styles["background"]}>
            {
              let spaceStart =
                Spacer.size(S) *. 2. +. NamedIcon.size +. checkSize +. Spacer.size(XS)
              ActivityCategories.defaults
              ->List.toArray
              ->Array.mapWithIndex((index, category) => {
                let (id, name, colorName, iconName) = category
                let color = colorName->ActivityCategories.getColor(theme.mode)
                let selectedCat = categoriesSelected->Array.some(catKey => catKey == id)
                let opened = categoriesOpened->Array.some(catKey => catKey == id)
                let separator = index != ActivityCategories.defaults->List.length - 1
                let categoryActivities =
                  activities->Array.keep(activity => activity.categoryId == id)
                let selectedCategoryActivities = categoryActivities->Array.reduce([], (
                  selActs,
                  activity,
                ) =>
                  if activitiesSelected->Array.some(actiId => actiId == activity.id) {
                    selActs->Array.concat([activity.id])
                  } else {
                    selActs
                  }
                )
                let canOpenCategory =
                  id != ActivityCategories.unknown && categoryActivities->Array.length > 0
                <React.Fragment key=id>
                  <ListItem
                    testID={"GoalEdit_category_" ++ id}
                    onPress={_ =>
                      canOpenCategory
                        ? handleCategoryOpen(id)
                        : handleCategoryCheck(id, selectedCategoryActivities)}
                    left={<>
                      <Pressable
                        testID={"GoalEdit_category_bullet_" ++ id}
                        onPress={_ => handleCategoryCheck(id, selectedCategoryActivities)}
                        hitSlop=HitSlops.xs>
                        {_ =>
                          !selectedCat
                            ? <SVGCircle
                                width={checkSize->dp} height={checkSize->dp} fill=theme.colors.gray
                              />
                            : <SVGCheckmarkcircle
                                width={checkSize->dp} height={checkSize->dp} fill=theme.colors.blue
                              />}
                      </Pressable>
                      <Spacer size=XS />
                      <NamedIcon name=iconName fill=color />
                    </>}
                    right={<>
                      {selectedCat || selectedCategoryActivities->Array.length > 0
                        ? <>
                            <Text
                              style={array([Theme.text["subhead"], theme.styles["textLight2"]])}>
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
                        style={viewStyle(
                          ~opacity=canOpenCategory ? 1. : 0.05,
                          ~transform=[rotate(~rotate=(opened ? 90. : 0.)->deg)],
                          (),
                        )}>
                        <SVGChevronright
                          width={14.->dp} height={14.->dp} fill=Predefined.Colors.Ios.light.gray4
                        />
                      </Animated.View>
                    </>}>
                    <ListItemText> {name->React.string} </ListItemText>
                  </ListItem>
                  <ListSeparator spaceStart />
                  {opened
                    ? categoryActivities
                      ->SortArray.stableSortBy((a, b) =>
                        a.title > b.title ? 1 : a.title < b.title ? -1 : 0
                      )
                      ->Array.mapWithIndex((index, activity) => {
                        let selected =
                          selectedCat || activitiesSelected->Array.some(key => key == activity.id)
                        <React.Fragment key=activity.id>
                          <ListItem
                            disabled=selectedCat
                            style={Style.viewStyle(~opacity=selectedCat ? 0.5 : 1., ())}
                            left={<>
                              <Pressable
                                disabled=selectedCat
                                onPress={_ => handleActivityCheckPress(activity.id)}>
                                {_ =>
                                  <SpacedView vertical=XS horizontal=None>
                                    {!selected
                                      ? <SVGCircle
                                          width={checkSize->dp}
                                          height={checkSize->dp}
                                          fill=theme.colors.gray
                                        />
                                      : <SVGCheckmarkcircle
                                          width={checkSize->dp}
                                          height={checkSize->dp}
                                          fill=theme.colors.blue
                                        />}
                                  </SpacedView>}
                              </Pressable>
                              <Spacer size=Custom(13.) />
                              <NamedIcon
                                name=iconName
                                fill=color
                                width={checkSize->dp}
                                height={checkSize->dp}
                              />
                              <Spacer size=Custom(3.) />
                            </>}
                            onPress={_ => handleActivityCheckPress(activity.id)}>
                            <ListItemText> {activity.title->React.string} </ListItemText>
                          </ListItem>
                          {separator || index != categoryActivities->Array.length - 1
                            ? <ListSeparator spaceStart />
                            : React.null}
                        </React.Fragment>
                      })
                      ->React.array
                    : React.null}
                </React.Fragment>
              })
              ->React.array
            }
          </View>
          <ListSeparator />
          <BlockFootnote>
            {j`By selecting a category, all future activities in that category will be included.`->React.string}
          </BlockFootnote>
          {onDelete
          ->Option.map(onDelete => <>
            <Spacer size=L />
            <ListSeparator />
            <ListItem
              onPress={_ =>
                Alert.alert(
                  ~title="Delete This Goal",
                  ~message="You are about to delete this goal.\nAre you sure?",
                  ~buttons=[
                    Alert.button(~text="Cancel", ~style=#default, ()),
                    Alert.button(
                      ~text="Delete",
                      ~style=#destructive,
                      ~onPress=() => onDelete(),
                      (),
                    ),
                  ],
                  (),
                )}>
              <ListItemText color=theme.colors.red center=true>
                {"Delete Goal"->React.string}
              </ListItemText>
            </ListItem>
            <ListSeparator />
          </>)
          ->Option.getWithDefault(React.null)}
          <Spacer />
        </>}
  </SpacedView>
}
