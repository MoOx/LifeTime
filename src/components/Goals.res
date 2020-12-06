open Belt
open ReactNative
open ReactMultiversal

let title = "Goals"

@react.component
let make = (~onNewGoalPress, ~onEditGoalPress) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context)
  let (getEvents, _updatedAt, _requestUpdate) = React.useContext(Calendars.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let today = React.useRef(Date.now())
  let todayDates = React.useRef(Date.weekDates(today.current))
  let (startDate, supposedEndDate) = todayDates.current
  let endDate = supposedEndDate->Date.min(today.current)
  let endDateTonight = endDate->Date.endOfDay
  let remainingMinThisWeek =
    (supposedEndDate->Js.Date.getTime -. endDate->Js.Date.getTime)->Date.msToMin
  let events = getEvents(startDate, endDate, true)
  let mapTitleDuration =
    events->Option.map(es =>
      es->Calendars.filterEvents(settings)->Calendars.makeMapTitleDuration(startDate, endDate)
    )
  let mapCategoryDuration =
    events->Option.map(es =>
      es
      ->Calendars.filterEvents(settings)
      ->Calendars.makeMapCategoryDuration(settings, startDate, endDate)
    )

  let (debug, debug_set) = React.useState(() => false)
  let (forceWelcomeContent, forceWelcomeContent_set) = React.useState(() => false)

  <>
    <SpacedView>
      <TitlePre> {" "->React.string} </TitlePre>
      <View style={Predefined.styles["rowSpaceBetween"]}>
        <Title style={theme.styles["textOnBackground"]}> {title->React.string} </Title>
        <View style={Predefined.styles["row"]}>
          {Global.__DEV__
            ? <>
                <TouchableOpacity
                  onPress={_ =>
                    forceWelcomeContent_set(forceWelcomeContent => !forceWelcomeContent)}>
                  <View style={Style.style(~opacity=0.10, ())}>
                    <SVGInfo
                      width={24.->Style.dp}
                      height={24.->Style.dp}
                      fill=theme.namedColors.textOnBackground
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={_ => debug_set(debug => !debug)}>
                  <View style={Style.style(~opacity=0.10, ())}>
                    <SVGScope
                      width={24.->Style.dp}
                      height={24.->Style.dp}
                      fill=theme.namedColors.textOnBackground
                    />
                  </View>
                </TouchableOpacity>
              </>
            : React.null}
          <TouchableOpacity onPress={_ => onNewGoalPress(Goal.Type.serializedGoal)}>
            <SVGPlus
              width={24.->Style.dp} height={24.->Style.dp} fill=theme.namedColors.textOnBackground
            />
          </TouchableOpacity>
        </View>
      </View>
    </SpacedView>
    {settings.goals->Array.length > 0 && !forceWelcomeContent
      ? React.null
      : <>
          <SpacedView vertical=None horizontal=S>
            <Text
              style={
                open Style
                array([Theme.text["subhead"], theme.styles["textLightOnBackgroundDark"]])
              }>
              {j`LifeTime lets you visualize the time you spend on everything. This allows you to take more informed decisions about how to use your valuable time.`->React.string}
            </Text>
            <Spacer size=XS />
            <Text
              style={
                open Style
                array([Theme.text["subhead"], theme.styles["textLightOnBackgroundDark"]])
              }>
              {j`You can help yourself by adding goals & limits you would like to respect. LifeTime will try to remind you when you successfully achieve your goals & respect your limits and can help your to improve your self-discipline if needed.`->React.string}
            </Text>
          </SpacedView>
          <Spacer size=L />
          <View style={Predefined.styles["rowSpaceBetween"]}>
            <Row> <Spacer size=XS /> <BlockHeading text="Minimum to achieve" /> </Row>
            <Row> <Spacer size=XS /> </Row>
          </View>
          <Separator style={theme.styles["separatorOnBackground"]} />
          <View style={theme.styles["background"]}>
            <TouchableOpacity onPress={_ => onNewGoalPress(Goal.Type.serializedGoal)}>
              <View style={Predefined.styles["rowCenter"]}>
                <Spacer size=S />
                <SpacedView vertical=XS horizontal=None>
                  <NamedIcon name=#scope fill=theme.colors.green />
                </SpacedView>
                <Spacer size=XS />
                <View style={Predefined.styles["flexGrow"]}>
                  <Text
                    style={
                      open Style
                      array([Theme.text["body"], theme.styles["textOnBackground"]])
                    }>
                    {"Add a Goal"->React.string}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <Separator style={theme.styles["separatorOnBackground"]} />
          <Spacer />
          <View style={Predefined.styles["rowSpaceBetween"]}>
            <Row> <Spacer size=XS /> <BlockHeading text="Maximum to respect" /> </Row>
            <Row> <Spacer size=XS /> </Row>
          </View>
          <Separator style={theme.styles["separatorOnBackground"]} />
          <View style={theme.styles["background"]}>
            <TouchableOpacity onPress={_ => onNewGoalPress(Goal.Type.serializedLimit)}>
              <View style={Predefined.styles["rowCenter"]}>
                <Spacer size=S />
                <SpacedView vertical=XS horizontal=None>
                  <NamedIcon name=#hourglass fill=theme.colors.orange />
                </SpacedView>
                <Spacer size=XS />
                <View style={Predefined.styles["flexGrow"]}>
                  <Text
                    style={
                      open Style
                      array([Theme.text["body"], theme.styles["textOnBackground"]])
                    }>
                    {"Add a Limit"->React.string}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <Separator style={theme.styles["separatorOnBackground"]} />
        </>}
    <SpacedView horizontal=XS vertical=None>
      {!debug
        ? React.null
        : <Text
            style={
              open Style
              array([theme.styles["textLightOnBackgroundDark"], textStyle(~fontSize=7.5, ())])
            }>
            {"remainingMinThisWeek: "->React.string}
            {remainingMinThisWeek->Date.minToString->React.string}
            {"\n"->React.string}
          </Text>}
      {forceWelcomeContent ? React.null : settings.goals->Array.map(goal => {
            let currentCategoriesTime =
              mapCategoryDuration
              ->Option.map(mapCategoryDuration =>
                goal.categoriesId
                ->Array.map(catId =>
                  mapCategoryDuration
                  ->Array.map(((cid, duration)) => cid == catId ? duration : 0.)
                  ->Array.reduce(0., (total, v) => total +. v)
                )
                ->Array.reduce(0., (total, v) => total +. v)
              )
              ->Option.getWithDefault(0.)
            let currentActivitiesTime =
              mapTitleDuration
              ->Option.map(mapTitleDuration => goal.activitiesId->Array.map(actId => {
                  let act = Activities.getFromId(actId, settings.activities)
                  mapTitleDuration
                  ->Array.map(((title, duration)) =>
                    Activities.isSimilar(title, act.title) ? duration : 0.
                  )
                  ->Array.reduce(0., (total, v) => total +. v)
                })->Array.reduce(0., (total, v) => total +. v))
              ->Option.getWithDefault(0.)
            let currentTime = currentCategoriesTime +. currentActivitiesTime
            let numberOfDays =
              goal.days->Array.reduce(0., (total, dayOn) => dayOn ? total +. 1. : total)
            let durationPerWeek = goal.durationPerDay *. numberOfDays
            let durationProgress =
              (startDate->Js.Date.getTime -. endDate->Js.Date.getTime) /.
                (startDate->Js.Date.getTime -. supposedEndDate->Js.Date.getTime)
            let durationProgressTonight =
              (startDate->Js.Date.getTime -. endDateTonight->Js.Date.getTime) /.
                (startDate->Js.Date.getTime -. supposedEndDate->Js.Date.getTime)
            let proportionalGoal = durationPerWeek *. durationProgress
            let proportionalGoalTonight = durationPerWeek *. durationProgressTonight
            let totalProgress = currentTime /. durationPerWeek
            let progress = currentTime /. proportionalGoal
            let progressTonight = currentTime /. proportionalGoalTonight
            let proportionalAverageTime = currentTime /. (numberOfDays *. durationProgressTonight)
            let remainingMinLimit = durationPerWeek -. currentTime
            let (isAlreadyDone, canBeDone) = switch goal.type_->Goal.Type.fromSerialized {
            | Some(Goal) => (totalProgress > 1., remainingMinLimit < remainingMinThisWeek)
            | Some(Limit) => (remainingMinLimit > remainingMinThisWeek, totalProgress < 1.)
            | _ => (false, false)
            }
            let backgroundColor =
              goal.categoriesId->Array.concat(goal.activitiesId->Array.map(actId => {
                  let act = actId->Activities.getFromId(settings.activities)
                  act.categoryId
                }))->Array.map(catId => {
                let (_, _, color, _) = catId->ActivityCategories.getFromId
                color
              })->Array.reduce(Map.String.empty, (map, color) =>
                map->Map.String.set(color, map->Map.String.get(color)->Option.getWithDefault(0) + 1)
              )->Map.String.toArray->SortArray.stableSortBy(((_, weight), (_, weight2)) =>
                if weight < weight2 {
                  1
                } else if weight > weight2 {
                  -1
                } else {
                  0
                }
              )->Array.get(
                0,
              )->Option.map(((c, _)) =>
                c->ActivityCategories.getColor(#dark)
              )->Option.getWithDefault(theme.colors.gray)

            let goalTitle = if goal.title != "" {
              goal.title
            } else {
              goal.activitiesId
              ->Array.map(actId => (actId->Activities.getFromId(settings.activities)).title)
              ->Array.concat(goal.categoriesId->Array.map(catId => {
                  let (_, title, _, _) = catId->ActivityCategories.getFromId
                  title
                }))
              ->Js.Array2.joinWith(", ")
            }

            // backgroundColor with some black to approximatively
            // match the gradient in the background
            let backgroundColorAlt = {
              open BsTinycolor.TinyColor
              makeFromString(backgroundColor)->Option.flatMap(color =>
                makeFromRgb({r: 0, g: 0, b: 0})->Option.flatMap(black =>
                  mix(color, black, ~value=30)->Option.map(mixed => mixed->toRgbString)
                )
              )
            }->Option.getWithDefault(backgroundColor)

            let (startColor, endColor) = {
              open Goal.Colors
              switch goal.type_->Goal.Type.fromSerialized {
              | Some(_) when !canBeDone && !isAlreadyDone => (danger, bad)
              | Some(_) when !canBeDone && isAlreadyDone => (ok, good)
              // Goals
              | Some(Goal) when progressTonight <= 0.25 => (bad, bad)
              | Some(Goal) when progressTonight <= 0.5 => (danger, bad)
              | Some(Goal) when progressTonight <= 0.75 => (alert, danger)
              | Some(Goal) when progressTonight <= 0.9 => (ok, danger)
              | Some(Goal) when progressTonight < 1. => (ok, alert)
              | Some(Goal) when progressTonight > 1. => (ok, good)
              //  Limits
              | Some(Limit) when progressTonight <= 0.75 => (ok, good)
              | Some(Limit) when progressTonight <= 0.9 => (alert, ok)
              | Some(Limit) when progressTonight < 1. => (danger, ok)
              | Some(Limit) when progressTonight >= 1.15 => (alert, bad)
              | Some(Limit) when progressTonight >= 1. => (alert, danger)
              | _ => (ok, ok)
              }
            }
            <SpacedView key=goal.id horizontal=XS vertical=XS>
              <SpacedView
                style={
                  open Style
                  viewStyle(
                    ~backgroundColor,
                    ~borderRadius=Theme.Radius.button,
                    ~overflow=#hidden,
                    (),
                  )
                }
                horizontal=M
                vertical=S>
                {!debug
                  ? React.null
                  : <View
                      style={
                        open Style
                        viewStyle(~position=#absolute, ~bottom=5.->dp, ~left=30.->pct, ())
                      }>
                      <Text
                        style={
                          open Style
                          array([
                            Theme.styleSheets.dark["textLightOnBackgroundDark"],
                            textStyle(~fontSize=7.5, ()),
                          ])
                        }>
                        {"currentTime: "->React.string}
                        {currentTime->Date.minToString->React.string}
                        {"\n"->React.string}
                        {"remainingMinLimit: "->React.string}
                        {remainingMinLimit->Date.minToString->React.string}
                        {"\n"->React.string}
                        {"durationPerWeek: "->React.string}
                        {durationPerWeek->Date.minToString->React.string}
                        {"\n"->React.string}
                        {"proportionalGoal: "->React.string}
                        {proportionalGoal->Date.minToString->React.string}
                        {"\n"->React.string}
                        {"progress: "->React.string}
                        {progress->Js.Float.toFixedWithPrecision(~digits=3)->React.string}
                        {"\n"->React.string}
                        {"progressTonight: "->React.string}
                        {progressTonight->Js.Float.toFixedWithPrecision(~digits=3)->React.string}
                        {"\n"->React.string}
                        {"totalProgress: "->React.string}
                        {totalProgress->Js.Float.toFixedWithPrecision(~digits=3)->React.string}
                        {"\n"->React.string}
                        {"durationProgressTonight: "->React.string}
                        {durationProgressTonight
                        ->Js.Float.toFixedWithPrecision(~digits=3)
                        ->React.string}
                        {"\n"->React.string}
                        {"isAlreadyDone: "->React.string}
                        {isAlreadyDone->string_of_bool->React.string}
                        {"\n"->React.string}
                        {"canBeDone: "->React.string}
                        {canBeDone->string_of_bool->React.string}
                      </Text>
                    </View>}
                <View
                  style={
                    open Style
                    array([StyleSheet.absoluteFill])
                  }>
                  <LinearGradientView
                    width={100.->Style.pct}
                    height={100.->Style.pct}
                    stops=[
                      {
                        offset: 0.->Style.dp,
                        stopColor: "#000",
                        stopOpacity: 0.->ReactNativeSvg.opacity,
                      },
                      {
                        offset: 1.->Style.dp,
                        stopColor: "#000",
                        stopOpacity: 0.5->ReactNativeSvg.opacity,
                      },
                    ]
                  />
                </View>
                <View
                  style={
                    open Style
                    array([Predefined.styles["rowSpaceBetween"], Predefined.styles["alignStart"]])
                  }>
                  <View>
                    <Text
                      style={
                        open Style
                        array([
                          Theme.text["caption1"],
                          Theme.styleSheets.dark["textLightOnBackgroundDark"],
                          textStyle(~fontWeight=Theme.fontWeights.bold, ()),
                        ])
                      }>
                      {switch goal.type_->Goal.Type.fromSerialized {
                      | Some(Goal) => "Goal"
                      | Some(Limit) => "Limit"
                      | _ => ""
                      }
                      ->Js.String.toUpperCase
                      ->React.string}
                    </Text>
                    <Text
                      style={
                        open Style
                        array([
                          Theme.text["title1"],
                          Theme.styleSheets.dark["textOnBackground"],
                          textStyle(~fontWeight=Theme.fontWeights.medium, ()),
                        ])
                      }
                      numberOfLines=1>
                      {goalTitle->React.string}
                    </Text>
                    <Text
                      style={
                        open Style
                        array([
                          Theme.text["footnote"],
                          Theme.styleSheets.dark["textLightOnBackgroundDark"],
                        ])
                      }>
                      {{
                        let durationInMinutes =
                          Js.Date.makeWithYMDHM(
                            ~year=0.,
                            ~month=0.,
                            ~date=0.,
                            ~hours=0.,
                            ~minutes=durationPerWeek,
                            (),
                          )
                          ->Date.durationInMs(Calendars.date0)
                          ->Date.msToMin
                        (durationInMinutes /. numberOfDays)->Date.minToString
                      }->React.string}
                      {", "->React.string}
                      {switch goal.days {
                      | [true, true, true, true, true, true, true] => "every day"
                      | [false, true, true, true, true, true, false] => "every weekday"
                      | [
                          false,
                          false,
                          true,
                          true,
                          true,
                          true,
                          false,
                        ] => "every weekday except monday"
                      | [
                          false,
                          true,
                          false,
                          true,
                          true,
                          true,
                          false,
                        ] => "every weekday except tuesday"
                      | [
                          false,
                          true,
                          true,
                          false,
                          true,
                          true,
                          false,
                        ] => "every weekday except wednesday"
                      | [
                          false,
                          true,
                          true,
                          true,
                          false,
                          true,
                          false,
                        ] => "every weekday except thursday"
                      | [
                          false,
                          true,
                          true,
                          true,
                          true,
                          false,
                          false,
                        ] => "every weekday except friday"
                      | [
                          true,
                          false,
                          false,
                          false,
                          false,
                          false,
                          true,
                        ] => "every day of the weekend"
                      | _ => goal.days->Array.reduceWithIndex("", (days, day, index) =>
                          if day {
                            days ++
                            (Date.dayShortString(index->float) ++
                            (index < goal.days->Array.length - 1 ? ", " : ""))
                          } else {
                            days
                          }
                        )
                      }->React.string}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={_ => onEditGoalPress(goal.id)}
                    style={
                      open Style
                      viewStyle(
                        ~backgroundColor="rgba(255,255,255,0.1)",
                        ~borderRadius=100.,
                        ~padding=2.->dp,
                        (),
                      )
                    }>
                    <SVGMore
                      width={24.->Style.dp} height={24.->Style.dp} fill="rgba(255,255,255,0.75)"
                    />
                  </TouchableOpacity>
                </View>
                <Spacer />
                <View
                  style={
                    open Style
                    array([Predefined.styles["rowSpaceBetween"], Predefined.styles["alignEnd"]])
                  }>
                  <ActivityRings
                    width=48.
                    strokeWidth=10.
                    spaceBetween=0.
                    backgroundColor=backgroundColorAlt
                    rings=[
                      {
                        startColor: startColor,
                        endColor: endColor,
                        backgroundColor: {
                          open BsTinycolor.TinyColor
                          makeFromString(backgroundColorAlt)
                          ->Option.flatMap(color =>
                            makeFromString(startColor)->Option.flatMap(color2 =>
                              mix(color, color2, ~value=20)->Option.map(mixedColor =>
                                mixedColor->toRgbString
                              )
                            )
                          )
                          ->Option.getWithDefault(backgroundColor)
                        },
                        progress: switch goal.type_->Goal.Type.fromSerialized {
                        | Some(Goal) => progressTonight
                        //  | Some(Limit) when progressTonight < 1. =>
                        //    1. -. progressTonight
                        //  | Some(Limit) => -. progressTonight
                        //  | Some(Limit) => -. (1. -. progressTonight)
                        | Some(Limit) => progressTonight
                        | _ => 0.
                        },
                      },
                    ]
                  />
                  <View
                    style={
                      open Style
                      array([Predefined.styles["row"], Predefined.styles["alignCenter"]])
                    }>
                    {
                      let width = 36.->Style.dp
                      let height = 36.->Style.dp
                      let fill = "rgba(255,255,255,0.1)"
                      switch goal.type_->Goal.Type.fromSerialized {
                      | Some(Goal) => <SVGScope width height fill />
                      | Some(Limit) => <SVGHourglass width height fill />
                      | _ => <SVGCheckmark width height fill />
                      }
                    }
                    <Spacer size=XS />
                    <View>
                      <Text
                        style={
                          open Style
                          array([
                            Theme.text["caption1"],
                            Theme.styleSheets.dark["textLightOnBackgroundDark"],
                            textStyle(~fontWeight=Theme.fontWeights.light, ()),
                          ])
                        }>
                        {"Daily Average"->React.string}
                      </Text>
                      <Text
                        style={
                          open Style
                          array([
                            Theme.text["title2"],
                            Theme.styleSheets.dark["textOnBackground"],
                            textStyle(
                              //  ~fontWeight=Theme.fontWeights.light,
                              ~fontWeight=Theme.fontWeights.medium,
                              ~textAlign=#right,
                              (),
                            ),
                          ])
                        }>
                        {switch proportionalAverageTime {
                        | 0. => "-"->React.string
                        | _ => proportionalAverageTime->Date.minToString->React.string
                        }}
                      </Text>
                    </View>
                  </View>
                </View>
              </SpacedView>
            </SpacedView>
            //  <Text
            //    style=Style.(
            //      array([|
            //        Theme.text##caption2,
            //        Theme.styleSheets.dark##textLightOnBackgroundDark,
            //      |])
            //    )>
            //    {currentTime->Date.minToString->React.string}
            //    " / "->React.string
            //    {durationPerWeek->Date.minToString->React.string}
            //  </Text>
          })->React.array}
    </SpacedView>
  </>
}
