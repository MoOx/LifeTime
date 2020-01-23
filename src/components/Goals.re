open Belt;
open ReactNative;
open ReactMultiversal;

let title = "Goals";

[@react.component]
let make = (~onNewGoalPress) => {
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
      {settings.goals
       ->Array.map(goal => {
           let now = Js.Date.now();
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
             (startDate->Js.Date.getTime -. now)
             /. (
               startDate->Js.Date.getTime -. supposedEndDate->Js.Date.getTime
             );
           let proportionalGoal = durationPerWeek *. durationProgress;
           let progress = currentTime /. proportionalGoal;
           let remainingMinToDo = durationPerWeek -. currentTime;
           let remainingMinThisWeek =
             (supposedEndDate->Js.Date.getTime -. now)->Date.msToMin;
           let canBeDone = remainingMinToDo < remainingMinThisWeek;
           let (backgroundColor, title) =
             switch (goal.categoriesId, goal.activitiesId) {
             | ([|catId|], [||]) =>
               ActivityCategories.(
                 {
                   let (_, title, color, _) = catId->getFromId;
                   (color->getColor(theme.mode), title);
                 }
               )
             | ([||], [|actId|]) =>
               ActivityCategories.(
                 {
                   let act = actId->Activities.getFromId(settings.activities);
                   let catId = act.categoryId;
                   let (_, _, color, _) = catId->getFromId;
                   (color->getColor(theme.mode), act.title);
                 }
               )
             | (_, _) => (theme.colors.gray, "Unknown")
             };
           let (startColor, endColor) =
             Goal.Colors.(
               switch (goal.type_->Goal.Type.fromSerialized) {
               | Some(_) when !canBeDone => (bad, bad)
               | Some(Min) when progress <= 0.25 => (bad, bad)
               | Some(Min) when progress <= 0.5 => (danger, bad)
               | Some(Min) when progress <= 0.75 => (alert, danger)
               | Some(Min) when progress < 1. => (ok, alert)
               | Some(Min) when progress > 1. => (ok, good)
               //  | Some(Max) when progress <= 0.25 => (ok, good)
               | Some(Max) when progress <= 0.5 => (ok, good)
               | Some(Max) when progress <= 0.75 => (ok, alert)
               | Some(Max) when progress < 1. => (ok, danger)
               | Some(Max) when progress >= 1. => (danger, bad)
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
               horizontal=S
               vertical=S>
               <View
                 style=Style.(
                   list([
                     StyleSheet.absoluteFill,
                     Predefined.styles##row,
                     viewStyle(
                       ~justifyContent=`flexEnd,
                       ~alignItems=`center,
                       (),
                     ),
                   ])
                 )>
                 <ActivityRings
                   width=48.
                   strokeWidth=10.
                   spaceBetween=0.
                   backgroundColor
                   rings=[|
                     {
                       startColor,
                       endColor,
                       backgroundColor:
                         BsTinycolor.TinyColor.(
                           makeFromString(backgroundColor)
                           ->Option.flatMap(color =>
                               makeFromString("rgb(153, 255, 0)")
                               ->Option.flatMap(color2 =>
                                   mix(color, color2, ~value=20)
                                   ->Option.map(mixedColor =>
                                       mixedColor->toRgbString
                                     )
                                 )
                             )
                           ->Option.getWithDefault(backgroundColor)
                         ),
                       progress,
                     },
                   |]
                 />
                 <Spacer size=S />
               </View>
               <View
                 style=Style.(
                   list([
                     Predefined.styles##row,
                     //  Predefined.styles##alignCenter,
                   ])
                 )>
                 <View>
                   <Spacer size={Custom(3.)} />
                   {let width = 24.->ReactFromSvg.Size.dp;
                    let height = 24.->ReactFromSvg.Size.dp;
                    let fill = "rgba(255,255,255,0.25)";
                    switch (goal.type_->Goal.Type.fromSerialized) {
                    | Some(Min) => <SVGscope width height fill />
                    | Some(Max) => <SVGhourglass width height fill />
                    | _ => <SVGcheckmark width height fill />
                    }}
                 </View>
                 <Spacer size=XS />
                 <View>
                   <Text
                     style=Style.(
                       list([
                         Theme.text##body,
                         theme.styles##textOnBackground,
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
                         theme.styles##textLightOnBackground,
                       ])
                     )>
                     (
                       switch (goal.type_->Goal.Type.fromSerialized) {
                       | Some(Min) => "Goal of"
                       | Some(Max) => "Limit of"
                       | _ => ""
                       }
                     )
                     ->React.string
                     " "->React.string
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
                   <Text
                     style=Style.(
                       list([
                         Theme.text##footnote,
                         theme.styles##textLightOnBackground,
                       ])
                     )>
                     {currentTime->Date.minToString->React.string}
                     " done on "->React.string
                     {durationPerWeek->Date.minToString->React.string}
                   </Text>
                 </View>
               </View>
             </SpacedView>
           </SpacedView>;
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
        onPress={_ => onNewGoalPress(Some(Goal.Type.serializedMin))}>
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
        onPress={_ => onNewGoalPress(Some(Goal.Type.serializedMax))}>
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
  </>;
};
