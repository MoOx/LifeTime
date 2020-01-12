open Belt;
open ReactNative;
open ReactMultiversal;

let title = "Add a goal";

let date0 =
  Js.Date.makeWithYMDHM(
    ~year=0.,
    ~month=0.,
    ~date=0.,
    ~hours=0.,
    ~minutes=0.,
    (),
  );

let quickDurations = [|30., 45., 60., 90.|];

[@react.component]
let make = () => {
  //   let (settings, setSettings) = React.useContext(AppSettings.context);
  //   let theme = Theme.useTheme();
  let themeStyles = Theme.useStyles();
  let themeColors = Theme.useColors();
  let (minutes, setMinutes) = React.useState(() => 60.);
  let (days, setDays) =
    React.useState(() => Array.range(0, 6)->Array.map(_ => true));
  // let (categories, setCategories) = React.useState(() => [||]);
  let numberOfDays =
    days->Array.reduce(0., (total, dayOn) => dayOn ? total +. 1. : total);
  let durationInMinutes =
    Js.Date.makeWithYMDHM(
      ~year=0.,
      ~month=0.,
      ~date=0.,
      ~hours=0.,
      ~minutes=minutes *. numberOfDays,
      (),
    )
    ->Date.durationInMs(date0)
    ->Date.msToMin;

  let dash =
    <View
      style=Style.(
        viewStyle(
          ~width=1.->dp,
          ~height=12.->dp,
          ~backgroundColor=themeColors.gray5,
          (),
        )
      )
    />;

  <SpacedView horizontal=None>
    <Row> <Spacer size=XS /> <BlockHeading text="Days" /> </Row>
    <Separator style=themeStyles##separatorOnBackground />
    <View style=themeStyles##background>
      <SpacedView style=Predefined.styles##rowSpaceBetween>
        {days
         ->Array.mapWithIndex((index, dayOn) =>
             <TouchableOpacity
               key={index->string_of_int}
               onPress={_ =>
                 setDays(days => {
                   let cp = days->Array.copy;
                   cp->Array.set(index, !dayOn)->ignore;
                   cp;
                 })
               }>
               <Text
                 style={Style.list([
                   Theme.text##caption1,
                   themeStyles##textVeryLightOnBackground,
                 ])}>
                 {index->float->Date.dayShortString->React.string}
               </Text>
               <Spacer size=XXS />
               {if (!dayOn) {
                  <SVGcircle
                    width={26.->ReactFromSvg.Size.dp}
                    height={26.->ReactFromSvg.Size.dp}
                    fill={themeColors.gray}
                  />;
                } else {
                  <SVGcheckmarkcircle
                    width={26.->ReactFromSvg.Size.dp}
                    height={26.->ReactFromSvg.Size.dp}
                    fill={themeColors.blue}
                  />;
                }}
             </TouchableOpacity>
           )
         ->React.array}
      </SpacedView>
    </View>
    <Separator style=themeStyles##separatorOnBackground />
    <BlockFootnote>
      "Select the days where you would like to respect this goal."
      ->React.string
    </BlockFootnote>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Duration" /> </Row>
    <Separator style=themeStyles##separatorOnBackground />
    <View style=themeStyles##background>
      <Spacer size=S />
      <View style=Predefined.styles##rowSpaceBetween>
        <Spacer />
        {quickDurations
         ->Array.map(quickDuration =>
             <TouchableOpacity
               key={quickDuration->Js.Float.toString}
               onPress={_ => setMinutes(_ => quickDuration)}>
               <SpacedView vertical=XS horizontal=XS>
                 <Text
                   style=Style.(
                     list([
                       Theme.text##subhead,
                       textStyle(
                         ~color=themeColors.blue,
                         ~fontWeight=Theme.fontWeights.semiBold,
                         (),
                       ),
                     ])
                   )>
                   {(quickDuration->Js.Float.toFixed ++ "min")->React.string}
                 </Text>
               </SpacedView>
             </TouchableOpacity>
           )
         ->React.array}
        <Spacer />
      </View>
      <SpacedView vertical=XS>
        <View style=Predefined.styles##rowCenter>
          <Text
            style={Style.list([
              Theme.text##caption1,
              themeStyles##textVeryLightOnBackground,
            ])}>
            "0"->React.string
          </Text>
          <Spacer size=XS />
          <View style=Predefined.styles##flexGrow>
            <View
              style=Style.(
                list([
                  StyleSheet.absoluteFill,
                  viewStyle(~marginHorizontal=15.->dp, ()),
                  Predefined.styles##rowSpaceBetween,
                ])
              )>
              dash
              dash
              dash
              dash
              dash
            </View>
            <ReactNativeSlider
              style=Predefined.styles##flexGrow
              minimumValue=0.
              maximumValue={24. *. 60.}
              step=15.
              value=minutes
              onValueChange={value => setMinutes(_ => value)}
            />
          </View>
          <Spacer size=XS />
          <Text
            style={Style.list([
              Theme.text##caption1,
              themeStyles##textVeryLightOnBackground,
            ])}>
            "24"->React.string
          </Text>
        </View>
      </SpacedView>
      <View style=Predefined.styles##rowSpaceBetween>
        <Spacer />
        <View style=Predefined.styles##flexGrow>
          <Separator style=themeStyles##separatorOnBackground />
          <SpacedView horizontal=None vertical=S style=Predefined.styles##row>
            <Text
              style=Style.(
                list([
                  Predefined.styles##flexGrow,
                  Theme.text##callout,
                  themeStyles##textOnBackground,
                ])
              )>
              "Average Time per Day"->React.string
            </Text>
            <Text
              style=Style.(
                list([
                  Theme.text##callout,
                  themeStyles##textLightOnBackground,
                ])
              )
              numberOfLines=1
              adjustsFontSizeToFit=true>
              {(durationInMinutes /. numberOfDays)
               ->Date.minToString
               ->React.string}
            </Text>
            <Spacer />
          </SpacedView>
        </View>
      </View>
      <View style=Predefined.styles##rowSpaceBetween>
        <Spacer />
        <View style=Predefined.styles##flexGrow>
          <Separator style=themeStyles##separatorOnBackground />
          <SpacedView horizontal=None vertical=S style=Predefined.styles##row>
            <Text
              style=Style.(
                list([
                  Predefined.styles##flexGrow,
                  Theme.text##callout,
                  themeStyles##textOnBackground,
                  textStyle(~fontWeight=Theme.fontWeights.medium, ()),
                ])
              )>
              "Weekly Goal"->React.string
            </Text>
            <Text
              style=Style.(
                list([
                  Theme.text##callout,
                  themeStyles##textLightOnBackground,
                  textStyle(~fontWeight=Theme.fontWeights.semiBold, ()),
                ])
              )
              numberOfLines=1
              adjustsFontSizeToFit=true>
              {durationInMinutes->Date.minToString->React.string}
            </Text>
            <Spacer />
          </SpacedView>
        </View>
      </View>
    </View>
    <Separator style=themeStyles##separatorOnBackground />
    <BlockFootnote>
      {j|Goals are mesured on a weekly basis. The time spent on an entire week is what matters to achieve your goal.|j}
      ->React.string
    </BlockFootnote>
    <Spacer />
    <Row>
      <Spacer size=XS />
      <BlockHeading text="Category or Activity" />
    </Row>
    <Separator style=themeStyles##separatorOnBackground />
    <View style=themeStyles##background>
      {Calendars.Categories.defaults
       ->List.map(category => {
           let (_, key, _, _) = category;
           <CategorySelectable
             key
             category
             selected=true
             onPress={_ => ()}
             separator=true
           />;
         })
       ->List.toArray
       ->React.array}
    </View>
    <Separator style=themeStyles##separatorOnBackground />
    <BlockFootnote>
      {j|By selecting a category, all future activities in that category will be included.|j}
      ->React.string
    </BlockFootnote>
  </SpacedView>;
};
