open Belt;
open ReactNative;
open ReactMultiversal;

let title = "Goals";

[@react.component]
let make = (~onNewGoalPress) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context);
  let theme = Theme.useTheme(AppSettings.useTheme());

  // let windowDimensions = Dimensions.useWindowDimensions();
  // let styleWidth = Style.(style(~width=windowDimensions##width->dp, ()));

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
                   viewStyle(
                     ~position=`absolute,
                     ~bottom=6.->dp,
                     ~right=6.->dp,
                     (),
                   )
                 )>
                 {let width = 76.->ReactFromSvg.Size.dp;
                  let height = 76.->ReactFromSvg.Size.dp;
                  let fill = "rgba(255,255,255,0.05)";
                  switch (goal.type_->Goal.Type.fromSerialized) {
                  | Some(Min) => <SVGscope width height fill />
                  | Some(Max) => <SVGhourglass width height fill />
                  | _ => <SVGcheckmark width height fill />
                  }}
               </View>
               <Text
                 style=Style.(
                   list([Theme.text##body, theme.styles##textOnBackground])
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
                 {let numberOfDays =
                    goal.days
                    ->Array.reduce(0., (total, dayOn) =>
                        dayOn ? total +. 1. : total
                      );
                  let durationInMinutes =
                    Js.Date.makeWithYMDHM(
                      ~year=0.,
                      ~month=0.,
                      ~date=0.,
                      ~hours=0.,
                      ~minutes=goal.durationPerWeek *. numberOfDays,
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
                          ++ (index < goal.days->Array.length - 1 ? ", " : "");
                        } else {
                          days;
                        }
                      )
                  }}
                 ->React.string
               </Text>
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
