open Belt;
open ReactNative;
open ReactMultiversal;

let title = "Goals";

[@react.component]
let make = (~onNewGoalPress, ~onEditGoalPress) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context);
  let (getEvents, _updatedAt, _requestUpdate) =
    React.useContext(Calendars.context);
  let theme = Theme.useTheme(AppSettings.useTheme());

  let today = React.useRef(Date.now());
  let todayDates =
    React.useRef(
      Date.weekDates(~firstDayOfWeekIndex=1, today->React.Ref.current),
    );
  let (startDate, supposedEndDate) = todayDates->React.Ref.current;
  let endDate = supposedEndDate->Date.min(today->React.Ref.current);
  let endDateTonight = endDate->Date.endOfDay;
  let remainingMinThisWeek =
    (supposedEndDate->Js.Date.getTime -. endDate->Js.Date.getTime)
    ->Date.msToMin;
  let events = getEvents(startDate, endDate, true);
  let mapTitleDuration =
    events->Option.map(es =>
      es->Calendars.filterEvents(settings)->Calendars.mapTitleDuration
    );
  let mapCategoryDuration =
    events->Option.map(es =>
      es
      ->Calendars.filterEvents(settings)
      ->Calendars.mapCategoryDuration(settings)
    );

  <>
    <SpacedView>
      <TitlePre> " "->React.string </TitlePre>
      <Title style=theme.styles##textOnBackground> title->React.string </Title>
    </SpacedView>
    <SpacedView vertical=None horizontal=S>
      <Text
        style=Style.(
          list([Theme.text##subhead, theme.styles##textLightOnBackgroundDark])
        )>
        {j|LifeTime lets you visualize the time you spend on everything. This allows you to take more informed decisions about how to use your valuable time.|j}
        ->React.string
      </Text>
      <Spacer size=XS />
      <Text
        style=Style.(
          list([Theme.text##subhead, theme.styles##textLightOnBackgroundDark])
        )>
        {j|You can help yourself by adding goals & limits you would like to respect. LifeTime will try to remind you when you successfully achieve your goals & respect your limits and can help your to improve your self-discipline if needed.|j}
        ->React.string
      </Text>
    </SpacedView>
    <SpacedView horizontal=XS>
      {!Global.__DEV__
         ? React.null
         : <Text
             style=Style.(
               list([
                 theme.styles##textLightOnBackgroundDark,
                 textStyle(~fontSize=7.5, ()),
               ])
             )>
             "remainingMinThisWeek: "->React.string
             {remainingMinThisWeek->Date.minToString->React.string}
             "\n"->React.string
           </Text>}
      {settings.goals
       ->Array.map(goal => {
           let currentCategoriesTime =
             mapCategoryDuration
             ->Option.map(mapCategoryDuration =>
                 goal.categoriesId
                 ->Array.map(catId => {
                     mapCategoryDuration
                     ->Array.map(((cid, duration)) =>
                         cid == catId ? duration : 0.
                       )
                     ->Array.reduce(0., (total, v) => total +. v)
                   })
                 ->Array.reduce(0., (total, v) => total +. v)
               )
             ->Option.getWithDefault(0.);
           let currentActivitiesTime =
             mapTitleDuration
             ->Option.map(mapTitleDuration =>
                 goal.activitiesId
                 ->Array.map(actId => {
                     let act =
                       Activities.getFromId(actId, settings.activities);
                     mapTitleDuration
                     ->Array.map(((title, duration)) => {
                         Activities.isSimilar(title, act.title)
                           ? duration : 0.
                       })
                     ->Array.reduce(0., (total, v) => total +. v);
                   })
                 ->Array.reduce(0., (total, v) => total +. v)
               )
             ->Option.getWithDefault(0.);
           let currentTime = currentCategoriesTime +. currentActivitiesTime;
           let numberOfDays =
             goal.days
             ->Array.reduce(0., (total, dayOn) =>
                 dayOn ? total +. 1. : total
               );
           let durationPerWeek = goal.durationPerDay *. numberOfDays;
           let durationProgress =
             (startDate->Js.Date.getTime -. endDate->Js.Date.getTime)
             /. (
               startDate->Js.Date.getTime -. supposedEndDate->Js.Date.getTime
             );
           let durationProgressTonight =
             (startDate->Js.Date.getTime -. endDateTonight->Js.Date.getTime)
             /. (
               startDate->Js.Date.getTime -. supposedEndDate->Js.Date.getTime
             );
           let proportionalGoal = durationPerWeek *. durationProgress;
           let proportionalGoalTonight =
             durationPerWeek *. durationProgressTonight;
           let totalProgress = currentTime /. durationPerWeek;
           let progress = currentTime /. proportionalGoal;
           let progressTonight = currentTime /. proportionalGoalTonight;
           let proportionalAverageTime =
             currentTime /. (numberOfDays *. durationProgressTonight);
           let remainingMinLimit = durationPerWeek -. currentTime;
           let (isAlreadyDone, canBeDone) =
             switch (goal.type_->Goal.Type.fromSerialized) {
             | Some(Goal) => (
                 totalProgress > 1.,
                 remainingMinLimit < remainingMinThisWeek,
               )
             | Some(Limit) => (
                 remainingMinLimit > remainingMinThisWeek,
                 totalProgress < 1.,
               )
             | _ => (false, false)
             };
           let (backgroundColor, title) =
             switch (goal.categoriesId, goal.activitiesId) {
             | ([|catId|], [||]) =>
               ActivityCategories.(
                 {
                   let (_, title, color, _) = catId->getFromId;
                   (color->getColor(`dark), title);
                 }
               )
             | ([||], [|actId|]) =>
               ActivityCategories.(
                 {
                   let act = actId->Activities.getFromId(settings.activities);
                   let catId = act.categoryId;
                   let (_, _, color, _) = catId->getFromId;
                   (color->getColor(`dark), act.title);
                 }
               )
             | (_, _) => (theme.colors.gray, "Unknown")
             };
           // backgroundColor with some black to approximatively
           // match the gradient in the background
           let backgroundColorAlt =
             BsTinycolor.TinyColor.(
               makeFromString(backgroundColor)
               ->Option.flatMap(color =>
                   makeFromRgb({r: 0, g: 0, b: 0})
                   ->Option.flatMap(black =>
                       mix(color, black, ~value=30)
                       ->Option.map(mixed => mixed->toRgbString)
                     )
                 )
             )
             ->Option.getWithDefault(backgroundColor);

           let (startColor, endColor) =
             Goal.Colors.(
               switch (goal.type_->Goal.Type.fromSerialized) {
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
             );
           <SpacedView key={goal.id} horizontal=XS vertical=XS>
             <SpacedView
               style=Style.(
                 viewStyle(
                   ~backgroundColor,
                   ~borderRadius=Theme.Radius.button,
                   ~overflow=`hidden,
                   (),
                 )
               )
               horizontal=M
               vertical=S>
               {!Global.__DEV__
                  ? React.null
                  : <View
                      style=Style.(
                        viewStyle(
                          ~position=`absolute,
                          ~bottom=5.->dp,
                          ~left=30.->pct,
                          (),
                        )
                      )>
                      <Text
                        style=Style.(
                          list([
                            Theme.styleSheets.dark##textLightOnBackgroundDark,
                            textStyle(~fontSize=7.5, ()),
                          ])
                        )>
                        "currentTime: "->React.string
                        {currentTime->Date.minToString->React.string}
                        "\n"->React.string
                        "remainingMinLimit: "->React.string
                        {remainingMinLimit->Date.minToString->React.string}
                        "\n"->React.string
                        "durationPerWeek: "->React.string
                        {durationPerWeek->Date.minToString->React.string}
                        "\n"->React.string
                        "proportionalGoal: "->React.string
                        {proportionalGoal->Date.minToString->React.string}
                        "\n"->React.string
                        "progress: "->React.string
                        {progress
                         ->Js.Float.toFixedWithPrecision(~digits=3)
                         ->React.string}
                        "\n"->React.string
                        "progressTonight: "->React.string
                        {progressTonight
                         ->Js.Float.toFixedWithPrecision(~digits=3)
                         ->React.string}
                        "\n"->React.string
                        "totalProgress: "->React.string
                        {totalProgress
                         ->Js.Float.toFixedWithPrecision(~digits=3)
                         ->React.string}
                        "\n"->React.string
                        "durationProgressTonight: "->React.string
                        {durationProgressTonight
                         ->Js.Float.toFixedWithPrecision(~digits=3)
                         ->React.string}
                        "\n"->React.string
                        "isAlreadyDone: "->React.string
                        {isAlreadyDone->string_of_bool->React.string}
                        "\n"->React.string
                        "canBeDone: "->React.string
                        {canBeDone->string_of_bool->React.string}
                      </Text>
                    </View>}
               <View style=Style.(list([StyleSheet.absoluteFill]))>
                 <LinearGradientView
                   width="100%"
                   height="100%"
                   stops=[|
                     {offset: "0", stopColor: "#000", stopOpacity: "0"},
                     {offset: "1", stopColor: "#000", stopOpacity: "0.5"},
                   |]
                 />
               </View>
               <View
                 style=Style.(
                   list([
                     Predefined.styles##rowSpaceBetween,
                     Predefined.styles##alignStart,
                   ])
                 )>
                 <View>
                   <Text
                     style=Style.(
                       list([
                         Theme.text##caption1,
                         Theme.styleSheets.dark##textLightOnBackgroundDark,
                         textStyle(~fontWeight=Theme.fontWeights.bold, ()),
                       ])
                     )>
                     {(
                        switch (goal.type_->Goal.Type.fromSerialized) {
                        | Some(Goal) => "Goal"
                        | Some(Limit) => "Limit"
                        | _ => ""
                        }
                      )
                      ->Js.String.toUpperCase
                      ->React.string}
                   </Text>
                   <Text
                     style=Style.(
                       list([
                         Theme.text##title1,
                         Theme.styleSheets.dark##textOnBackground,
                         textStyle(~fontWeight=Theme.fontWeights.medium, ()),
                       ])
                     )>
                     (
                       if (goal.title != "") {
                         goal.title;
                       } else {
                         title;
                       }
                     )
                     ->React.string
                   </Text>
                   <Text
                     style=Style.(
                       list([
                         Theme.text##footnote,
                         Theme.styleSheets.dark##textLightOnBackgroundDark,
                       ])
                     )>
                     {let durationInMinutes =
                        Js.Date.makeWithYMDHM(
                          ~year=0.,
                          ~month=0.,
                          ~date=0.,
                          ~hours=0.,
                          ~minutes=durationPerWeek,
                          (),
                        )
                        ->Date.durationInMs(Calendars.date0)
                        ->Date.msToMin;
                      (durationInMinutes /. numberOfDays)->Date.minToString}
                     ->React.string
                     ", "->React.string
                     {switch (goal.days) {
                      | [|true, true, true, true, true, true, true|] => "every day"
                      | [|false, true, true, true, true, true, false|] => "every weekday"
                      | [|false, false, true, true, true, true, false|] => "every weekday except monday"
                      | [|false, true, false, true, true, true, false|] => "every weekday except tuesday"
                      | [|false, true, true, false, true, true, false|] => "every weekday except wednesday"
                      | [|false, true, true, true, false, true, false|] => "every weekday except thursday"
                      | [|false, true, true, true, true, false, false|] => "every weekday except friday"
                      | [|true, false, false, false, false, false, true|] => "every day of the weekend"
                      | _ =>
                        goal.days
                        ->Array.reduceWithIndex("", (days, day, index) =>
                            if (day) {
                              days
                              ++ Date.dayShortString(index->float)
                              ++ (
                                index < goal.days->Array.length - 1 ? ", " : ""
                              );
                            } else {
                              days;
                            }
                          )
                      }}
                     ->React.string
                   </Text>
                 </View>
                 <TouchableOpacity
                   onPress={_ => onEditGoalPress(goal.id)}
                   style=Style.(
                     viewStyle(
                       ~backgroundColor="rgba(255,255,255,0.1)",
                       ~borderRadius=100.,
                       ~padding=2.->dp,
                       (),
                     )
                   )>
                   <SVGmore
                     width={24.->ReactFromSvg.Size.dp}
                     height={24.->ReactFromSvg.Size.dp}
                     fill="rgba(255,255,255,0.75)"
                   />
                 </TouchableOpacity>
               </View>
               <Spacer />
               <View
                 style=Style.(
                   list([
                     Predefined.styles##rowSpaceBetween,
                     Predefined.styles##alignEnd,
                   ])
                 )>
                 <ActivityRings
                   width=48.
                   strokeWidth=10.
                   spaceBetween=0.
                   backgroundColor=backgroundColorAlt
                   rings=[|
                     {
                       startColor,
                       endColor,
                       backgroundColor:
                         BsTinycolor.TinyColor.(
                           makeFromString(backgroundColorAlt)
                           ->Option.flatMap(color =>
                               makeFromString(startColor)
                               ->Option.flatMap(color2 =>
                                   mix(color, color2, ~value=20)
                                   ->Option.map(mixedColor =>
                                       mixedColor->toRgbString
                                     )
                                 )
                             )
                           ->Option.getWithDefault(backgroundColor)
                         ),
                       progress:
                         switch (goal.type_->Goal.Type.fromSerialized) {
                         | Some(Goal) => progressTonight
                         //  | Some(Limit) when progressTonight < 1. =>
                         //    1. -. progressTonight
                         //  | Some(Limit) => -. progressTonight
                         //  | Some(Limit) => -. (1. -. progressTonight)
                         | Some(Limit) => progressTonight
                         | _ => 0.
                         },
                     },
                   |]
                   //  <View
                   //    style=Style.(
                   //      list([
                   //        StyleSheet.absoluteFill,
                   //        Predefined.styles##center,
                   //      ])
                   //    )>
                   //    <Text
                   //      style=Style.(
                   //        list([
                   //          Theme.text##caption2,
                   //          Theme.styleSheets.dark##textLightOnBackgroundDark,
                   //        ])
                   //      )>
                   //      {(progress *. 100.)->Js.Float.toFixed->React.string}
                   //      <Text style=Style.(textStyle(~fontSize=9., ()))>
                   //        "%"->React.string
                   //      </Text>
                   //    </Text>
                   //  </View>
                 />
                 <View
                   style=Style.(
                     list([
                       Predefined.styles##row,
                       Predefined.styles##alignCenter,
                     ])
                   )>
                   {let width = 36.->ReactFromSvg.Size.dp;
                    let height = 36.->ReactFromSvg.Size.dp;
                    let fill = "rgba(255,255,255,0.1)";
                    switch (goal.type_->Goal.Type.fromSerialized) {
                    | Some(Goal) => <SVGscope width height fill />
                    | Some(Limit) => <SVGhourglass width height fill />
                    | _ => <SVGcheckmark width height fill />
                    }}
                   <Spacer size=XS />
                   <View>
                     <Text
                       style=Style.(
                         list([
                           Theme.text##caption1,
                           Theme.styleSheets.dark##textLightOnBackgroundDark,
                           textStyle(~fontWeight=Theme.fontWeights.light, ()),
                         ])
                       )>
                       "Daily Average"->React.string
                     </Text>
                     <Text
                       style=Style.(
                         list([
                           Theme.text##title2,
                           Theme.styleSheets.dark##textOnBackground,
                           textStyle(
                             //  ~fontWeight=Theme.fontWeights.light,
                             ~fontWeight=Theme.fontWeights.medium,
                             ~textAlign=`right,
                             (),
                           ),
                         ])
                       )>
                       {switch (proportionalAverageTime) {
                        | 0. => "-"->React.string
                        | _ =>
                          proportionalAverageTime
                          ->Date.minToString
                          ->React.string
                        }}
                     </Text>
                   </View>
                 </View>
               </View>
             </SpacedView>
           </SpacedView>;
           //  <Text
           //    style=Style.(
           //      list([
           //        Theme.text##caption2,
           //        Theme.styleSheets.dark##textLightOnBackgroundDark,
           //      ])
           //    )>
           //    {currentTime->Date.minToString->React.string}
           //    " / "->React.string
           //    {durationPerWeek->Date.minToString->React.string}
           //  </Text>
         })
       ->React.array}
    </SpacedView>
    <View style=Predefined.styles##rowSpaceBetween>
      <Row>
        <Spacer size=XS />
        <BlockHeading text="Minimum to achieve" />
      </Row>
      <Row> <Spacer size=XS /> </Row>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <TouchableOpacity
        onPress={_ => onNewGoalPress(Goal.Type.serializedGoal)}>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <NamedIcon name=`scope fill={theme.colors.green} />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flexGrow>
            <Text
              style=Style.(
                list([Theme.text##body, theme.styles##textOnBackground])
              )>
              "Add a Goal"->React.string
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <Spacer />
    <View style=Predefined.styles##rowSpaceBetween>
      <Row>
        <Spacer size=XS />
        <BlockHeading text="Maximum to respect" />
      </Row>
      <Row> <Spacer size=XS /> </Row>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <TouchableOpacity
        onPress={_ => onNewGoalPress(Goal.Type.serializedLimit)}>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <NamedIcon name=`hourglass fill={theme.colors.orange} />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flexGrow>
            <Text
              style=Style.(
                list([Theme.text##body, theme.styles##textOnBackground])
              )>
              "Add a Limit"->React.string
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <Spacer size=XL />
  </>;
};
