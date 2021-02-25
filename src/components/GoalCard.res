open Belt
open ReactNative
open ReactMultiversal

let title = "Goals"

@react.component
let make = (
  ~activities,
  ~debug,
  ~endDate,
  ~endDateTonight,
  ~goal: Goal.t,
  ~mapCategoryDuration,
  ~mapTitleDuration,
  ~onEditGoalPress,
  ~remainingMinThisWeek,
  ~startDate,
  ~supposedEndDate,
) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
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
    ->Option.map(mapTitleDuration =>
      goal.activitiesId
      ->Array.map(actId => {
        let act = Activities.getFromId(actId, activities)
        mapTitleDuration
        ->Array.map(((title, duration)) => Activities.isSimilar(title, act.title) ? duration : 0.)
        ->Array.reduce(0., (total, v) => total +. v)
      })
      ->Array.reduce(0., (total, v) => total +. v)
    )
    ->Option.getWithDefault(0.)
  let currentTime = currentCategoriesTime +. currentActivitiesTime
  let numberOfDays = goal.days->Array.reduce(0., (total, dayOn) => dayOn ? total +. 1. : total)
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
    goal.categoriesId
    ->Array.concat(
      goal.activitiesId->Array.map(actId => {
        let act = actId->Activities.getFromId(activities)
        act.categoryId
      }),
    )
    ->Array.map(catId => {
      let (_, _, color, _) = catId->ActivityCategories.getFromId
      color
    })
    ->Array.reduce(Map.String.empty, (map, color) =>
      map->Map.String.set(color, map->Map.String.get(color)->Option.getWithDefault(0) + 1)
    )
    ->Map.String.toArray
    ->SortArray.stableSortBy(((_, weight), (_, weight2)) =>
      if weight < weight2 {
        1
      } else if weight > weight2 {
        -1
      } else {
        0
      }
    )
    ->Array.get(0)
    ->Option.map(((c, _)) => c->ActivityCategories.getColor(#dark))
    ->Option.getWithDefault(theme.colors.gray)

  let goalTitle = if goal.title != "" {
    goal.title
  } else {
    goal.activitiesId
    ->Array.map(actId => (actId->Activities.getFromId(activities)).title)
    ->Array.concat(
      goal.categoriesId->Array.map(catId => {
        let (_, title, _, _) = catId->ActivityCategories.getFromId
        title
      }),
    )
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

  let ring = React.useMemo6(() => {
    open ActivityRings
    {
      startColor: startColor,
      endColor: endColor,
      backgroundColor: {
        open BsTinycolor.TinyColor
        makeFromString(backgroundColorAlt)
        ->Option.flatMap(color =>
          makeFromString(startColor)->Option.flatMap(color2 =>
            mix(color, color2, ~value=20)->Option.map(mixedColor => mixedColor->toRgbString)
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
    }
  }, (startColor, endColor, backgroundColor, backgroundColorAlt, goal.type_, progressTonight))

  <SpacedView key=goal.id horizontal=XS vertical=XS>
    <SpacedView
      style={
        open Style
        viewStyle(~backgroundColor, ~borderRadius=Theme.Radius.button, ~overflow=#hidden, ())
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
                array([Theme.styleSheets.dark["textOnDarkLight"], textStyle(~fontSize=7.5, ())])
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
              {durationProgressTonight->Js.Float.toFixedWithPrecision(~digits=3)->React.string}
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
        <View style={Predefined.styles["flex"]}>
          <Text
            style={
              open Style
              array([
                Theme.text["caption1"],
                Theme.text["weight700"],
                Theme.styleSheets.dark["textOnDarkLight"],
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
              array([Theme.text["title1"], Theme.text["weight500"], Theme.styleSheets.dark["text"]])
            }
            numberOfLines=1>
            {goalTitle->React.string}
          </Text>
          <Text
            style={
              open Style
              array([Theme.text["footnote"], Theme.styleSheets.dark["textOnDarkLight"]])
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
            | [false, false, true, true, true, true, false] => "every weekday except monday"
            | [false, true, false, true, true, true, false] => "every weekday except tuesday"
            | [false, true, true, false, true, true, false] => "every weekday except wednesday"
            | [false, true, true, true, false, true, false] => "every weekday except thursday"
            | [false, true, true, true, true, false, false] => "every weekday except friday"
            | [true, false, false, false, false, false, true] => "every day of the weekend"
            | _ =>
              goal.days->Array.reduceWithIndex("", (days, day, index) =>
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
          hitSlop=HitSlops.m
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
          <SVGMore width={24.->Style.dp} height={24.->Style.dp} fill="rgba(255,255,255,0.75)" />
        </TouchableOpacity>
      </View>
      <Spacer />
      <View
        style={
          open Style
          array([Predefined.styles["rowSpaceBetween"], Predefined.styles["alignEnd"]])
        }>
        <ActivityRings
          width=48. strokeWidth=10. spaceBetween=0. backgroundColor=backgroundColorAlt rings=[ring]
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
                  Theme.text["weight300"],
                  Theme.styleSheets.dark["textOnDarkLight"],
                ])
              }>
              {"Daily Average"->React.string}
            </Text>
            <Text
              style={
                open Style
                array([
                  Theme.text["title2"],
                  Theme.text["weight500"],
                  Theme.styleSheets.dark["text"],
                  textStyle(~textAlign=#right, ()),
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
  //        Theme.styleSheets.dark##textOnDarkLight,
  //      |])
  //    )>
  //    {currentTime->Date.minToString->React.string}
  //    " / "->React.string
  //    {durationPerWeek->Date.minToString->React.string}
  //  </Text>
}
