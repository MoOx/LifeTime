open Belt;
open ReactNative;
open ReactMultiversal;

let title = "Add a Goal";

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

[@bs.module "react"]
external useEffect6:
  ([@bs.uncurry] (unit => option(unit => unit)), ('a, 'b, 'c, 'd, 'e, 'f)) =>
  unit =
  "useEffect";

[@react.component]
let make = (~type_ as initialType=?, ~onChange) => {
  let (settings, _setSettings) = React.useContext(AppSettings.context);

  let theme = Theme.useTheme(AppSettings.useTheme());

  let (title, setTitle) = React.useState(() => "");
  let (type_, setType) = React.useState(() => initialType);
  let (minutes, setMinutes) = React.useState(() => 60.);
  let (days, setDays) =
    React.useState(() => Array.range(0, 6)->Array.map(_ => true));
  let (categoriesSelected, setCategoriesSelected) =
    React.useState(() => [||]);
  let (categoriesOpened, setCategoriesOpen) = React.useState(() => [||]);
  let (activitiesSelected, setActivitiesSelected) =
    React.useState(() => [||]);
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

  useEffect6(
    () => {
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
          when
            minutes > 0.
            && days->Array.some(day => day)
            && (
              categoriesSelected->Array.length > 0
              || activitiesSelected->Array.length > 0
            ) =>
        onChange(
          Some(
            Goal.make(
              title,
              type_,
              minutes,
              days,
              categoriesSelected,
              activitiesSelected,
            ),
          ),
        )
      | _ => onChange(None)
      };
      None;
    },
    (title, type_, minutes, days, categoriesSelected, activitiesSelected),
  );

  let dash =
    <View
      style=Style.(
        viewStyle(
          ~width=1.->dp,
          ~height=12.->dp,
          ~backgroundColor=theme.colors.gray5,
          (),
        )
      )
    />;

  let handleCategoryCheck =
    React.useCallback2(
      (id, selectedCategoryActivities) => {
        setCategoriesSelected(categoriesSelected =>
          if (categoriesSelected->Array.some(catKey => catKey == id)) {
            categoriesSelected->Array.keep(catKey => catKey != id);
          } else {
            categoriesSelected->Array.concat([|id|]);
          }
        );
        setActivitiesSelected(activitiesSelected =>
          activitiesSelected->Array.keep(act =>
            !
              selectedCategoryActivities->Array.some(selCatAct =>
                selCatAct == act
              )
          )
        );
      },
      (setCategoriesSelected, setActivitiesSelected),
    );
  let handleCategoryOpen =
    React.useCallback1(
      key =>
        setCategoriesOpen(categoriesOpened =>
          if (categoriesOpened->Array.some(catKey => catKey == key)) {
            categoriesOpened->Array.keep(catKey => catKey != key);
          } else {
            categoriesOpened->Array.concat([|key|]);
          }
        ),
      [|setCategoriesOpen|],
    );
  let handleActivityCheckPress =
    React.useCallback1(
      key =>
        setActivitiesSelected(activitiesSelected =>
          if (activitiesSelected->Array.some(act => act == key)) {
            activitiesSelected->Array.keep(act => act != key);
          } else {
            activitiesSelected->Array.concat([|key|]);
          }
        ),
      [|setActivitiesSelected|],
    );

  <SpacedView horizontal=None>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <SpacedView vertical=S>
        <TextInput
          autoCapitalize=`words
          autoComplete=`off
          autoCorrect=true
          // autoFocus=true
          clearButtonMode=`whileEditing
          keyboardAppearance={
            switch (theme.mode) {
            | `light => `light
            | `dark => `dark
            }
          }
          maxLength=100
          onChangeText={value => setTitle(_ => value)}
          placeholder="Title (Optional)"
          placeholderTextColor={theme.colors.gray3}
          returnKeyType=`done_
          value=title
          style=Style.(
            list([
              Predefined.styles##flex,
              Theme.text##body,
              theme.styles##textOnBackground,
              textStyle(
                ~height=Spacer.space->dp,
                ~lineHeight=Spacer.space,
                (),
              ),
            ])
          )
        />
      </SpacedView>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Type" /> </Row>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <TouchableWithoutFeedback
        onPress={_ => setType(_ => Some(Goal.Type.Min))}>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <NamedIcon name=`scope fill={theme.colors.green} />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flex,
                      Predefined.styles##justifyCenter,
                    ])
                  )>
                  <Text
                    style=Style.(
                      list([Theme.text##body, theme.styles##textOnBackground])
                    )>
                    "Goal to Reach"->React.string
                  </Text>
                </View>
                {switch (type_) {
                 | Some(Min) =>
                   <SVGcheckmark
                     width={22.->ReactFromSvg.Size.dp}
                     height={22.->ReactFromSvg.Size.dp}
                     fill={theme.colors.blue}
                   />
                 | _ => React.null
                 }}
                <Spacer size=S />
              </View>
            </SpacedView>
            <Separator style=theme.styles##separatorOnBackground />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        onPress={_ => setType(_ => Some(Goal.Type.Max))}>
        <View style=Predefined.styles##rowCenter>
          <Spacer size=S />
          <SpacedView vertical=XS horizontal=None>
            <NamedIcon name=`hourglass fill={theme.colors.orange} />
          </SpacedView>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
            <SpacedView vertical=XS horizontal=None>
              <View style=Predefined.styles##row>
                <View
                  style=Style.(
                    list([
                      Predefined.styles##flex,
                      Predefined.styles##justifyCenter,
                    ])
                  )>
                  <Text
                    style=Style.(
                      list([Theme.text##body, theme.styles##textOnBackground])
                    )>
                    "Limit to Respect"->React.string
                  </Text>
                </View>
                {switch (type_) {
                 | Some(Max) =>
                   <SVGcheckmark
                     width={22.->ReactFromSvg.Size.dp}
                     height={22.->ReactFromSvg.Size.dp}
                     fill={theme.colors.blue}
                   />
                 | _ => React.null
                 }}
                <Spacer size=S />
              </View>
            </SpacedView>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Separator style=theme.styles##separatorOnBackground />
    </View>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Days" /> </Row>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      <SpacedView style=Predefined.styles##rowSpaceBetween>
        {days
         ->Array.mapWithIndex((index, dayOn) =>
             <TouchableWithoutFeedback
               key={index->string_of_int}
               onPress={_ =>
                 setDays(days => {
                   let cp = days->Array.copy;
                   cp->Array.set(index, !dayOn)->ignore;
                   cp;
                 })
               }>
               <View>
                 <Text
                   style={Style.list([
                     Theme.text##caption1,
                     theme.styles##textVeryLightOnBackground,
                   ])}>
                   {index->float->Date.dayShortString->React.string}
                 </Text>
                 <Spacer size=XXS />
                 {if (!dayOn) {
                    <SVGcircle
                      width={26.->ReactFromSvg.Size.dp}
                      height={26.->ReactFromSvg.Size.dp}
                      fill={theme.colors.gray}
                    />;
                  } else {
                    <SVGcheckmarkcircle
                      width={26.->ReactFromSvg.Size.dp}
                      height={26.->ReactFromSvg.Size.dp}
                      fill={theme.colors.blue}
                    />;
                  }}
               </View>
             </TouchableWithoutFeedback>
           )
         ->React.array}
      </SpacedView>
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <BlockFootnote>
      "Select the days where you would like to respect this goal."
      ->React.string
    </BlockFootnote>
    <Spacer />
    <Row> <Spacer size=XS /> <BlockHeading text="Duration" /> </Row>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
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
                         ~color=theme.colors.blue,
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
              theme.styles##textVeryLightOnBackground,
            ])}>
            "0"->React.string
          </Text>
          <Spacer size=XS />
          <View style=Predefined.styles##flex>
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
              style=Predefined.styles##flex
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
              theme.styles##textVeryLightOnBackground,
            ])}>
            "24"->React.string
          </Text>
        </View>
      </SpacedView>
      <View style=Predefined.styles##rowSpaceBetween>
        <Spacer />
        <View style=Predefined.styles##flex>
          <Separator style=theme.styles##separatorOnBackground />
          <SpacedView horizontal=None vertical=S style=Predefined.styles##row>
            <Text
              style=Style.(
                list([
                  Predefined.styles##flex,
                  Theme.text##callout,
                  theme.styles##textOnBackground,
                ])
              )>
              "Average Time per Day"->React.string
            </Text>
            <Text
              style=Style.(
                list([
                  Theme.text##callout,
                  theme.styles##textLightOnBackground,
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
        <View style=Predefined.styles##flex>
          <Separator style=theme.styles##separatorOnBackground />
          <SpacedView horizontal=None vertical=S style=Predefined.styles##row>
            <Text
              style=Style.(
                list([
                  Predefined.styles##flex,
                  Theme.text##callout,
                  theme.styles##textOnBackground,
                  textStyle(~fontWeight=Theme.fontWeights.medium, ()),
                ])
              )>
              "Weekly Goal"->React.string
            </Text>
            <Text
              style=Style.(
                list([
                  Theme.text##callout,
                  theme.styles##textLightOnBackground,
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
    <Separator style=theme.styles##separatorOnBackground />
    <BlockFootnote>
      {j|Goals are mesured on a weekly basis. The time spent on an entire week is what matters to achieve your goal.|j}
      ->React.string
    </BlockFootnote>
    <Spacer />
    <Row>
      <Spacer size=XS />
      <BlockHeading text="Category or Activity" />
    </Row>
    <Separator style=theme.styles##separatorOnBackground />
    <View style=theme.styles##background>
      {ActivityCategories.defaults
       ->List.toArray
       ->Array.mapWithIndex((index, category) => {
           let (id, name, colorName, iconName) = category;
           let color = ActivityCategories.getColor(theme.mode, colorName);
           let selectedCat =
             categoriesSelected->Array.some(catKey => catKey == id);
           let opened = categoriesOpened->Array.some(catKey => catKey == id);
           let separator =
             index != ActivityCategories.defaults->List.length - 1;
           let categoryActivities =
             settings.activities
             ->Array.keep(activity => activity.categoryId == id);
           let selectedCategoryActivities =
             categoryActivities->Array.reduce([||], (selActs, activity) =>
               if (activitiesSelected->Array.some(acti =>
                     Activities.isSimilar(acti, activity.title)
                   )) {
                 selActs->Array.concat([|activity.title|]);
               } else {
                 selActs;
               }
             );
           let canOpenCategory =
             id != ActivityCategories.unknown
             && categoryActivities->Array.length > 0;
           <React.Fragment key=id>
             <View style=Predefined.styles##rowCenter>
               <Spacer size=S />
               <TouchableWithoutFeedback
                 onPress={_ =>
                   handleCategoryCheck(id, selectedCategoryActivities)
                 }>
                 <View>
                   <SpacedView vertical=XS horizontal=None>
                     {if (!selectedCat) {
                        <SVGcircle
                          width={22.->ReactFromSvg.Size.dp}
                          height={22.->ReactFromSvg.Size.dp}
                          fill={theme.colors.gray}
                        />;
                      } else {
                        <SVGcheckmarkcircle
                          width={22.->ReactFromSvg.Size.dp}
                          height={22.->ReactFromSvg.Size.dp}
                          fill={theme.colors.blue}
                        />;
                      }}
                   </SpacedView>
                 </View>
               </TouchableWithoutFeedback>
               <Spacer size=XS />
               <TouchableWithoutFeedback
                 onPress={_ =>
                   canOpenCategory
                     ? handleCategoryOpen(id)
                     : handleCategoryCheck(id, selectedCategoryActivities)
                 }>
                 <View style=Predefined.styles##flex>
                   <View style=Predefined.styles##rowCenter>
                     <SpacedView vertical=XS horizontal=None>
                       <NamedIcon name=iconName fill=color />
                     </SpacedView>
                     <Spacer size=XS />
                     <View style=Predefined.styles##flex>
                       <SpacedView
                         vertical=XS
                         horizontal=None
                         style=Style.(
                           list([
                             Predefined.styles##flex,
                             Predefined.styles##center,
                           ])
                         )>
                         <View style=Predefined.styles##rowCenter>
                           <View style=Predefined.styles##flex>
                             <Text
                               style={Style.list([
                                 Theme.text##body,
                                 theme.styles##textOnBackground,
                               ])}>
                               name->React.string
                             </Text>
                           </View>
                           {selectedCat
                            || selectedCategoryActivities->Array.length > 0
                              ? <>
                                  <Text
                                    style={Style.list([
                                      Theme.text##subhead,
                                      theme.styles##textVeryLightOnBackground,
                                    ])}>
                                    (
                                      selectedCat
                                        ? "All"
                                        : {
                                          let numberOfActivities =
                                            selectedCategoryActivities->Array.length;
                                          switch (numberOfActivities) {
                                          | 1 =>
                                            numberOfActivities->string_of_int
                                            ++ " activity"
                                          | _ =>
                                            numberOfActivities->string_of_int
                                            ++ " activities"
                                          };
                                        }
                                    )
                                    ->React.string
                                  </Text>
                                  <Spacer size=S />
                                </>
                              : React.null}
                           // using a key because (at least in simulator, it seems to be buggy)
                           <Animated.View
                             key={opened ? "opened" : "unopened"}
                             style=Style.(
                               viewStyle(
                                 ~opacity=canOpenCategory ? 1. : 0.05,
                                 ~transform=[|
                                   rotate(~rotate=(opened ? 90. : 0.)->deg),
                                 |],
                                 (),
                               )
                             )>
                             <SVGchevronright
                               width={14.->ReactFromSvg.Size.dp}
                               height={14.->ReactFromSvg.Size.dp}
                               fill={Predefined.Colors.Ios.light.gray4}
                             />
                           </Animated.View>
                           <Spacer size=S />
                         </View>
                       </SpacedView>
                       {separator
                          ? <Separator
                              style=theme.styles##separatorOnBackground
                            />
                          : React.null}
                     </View>
                   </View>
                 </View>
               </TouchableWithoutFeedback>
             </View>
             {opened
                ? {
                  categoryActivities
                  ->Array.mapWithIndex((index, activity) => {
                      let selected =
                        selectedCat
                        || activitiesSelected->Array.some(key =>
                             Activities.isSimilar(key, activity.title)
                           );
                      let separator =
                        separator
                        || index != categoryActivities->Array.length
                        - 1;
                      <View
                        key={activity.title}
                        style=Style.(
                          list([
                            Predefined.styles##rowCenter,
                            viewStyle(
                              ~backgroundColor="rgba(125,125,125,0.03)",
                              ~opacity=selectedCat ? 0.5 : 1.,
                              (),
                            ),
                          ])
                        )>
                        <Spacer size=S />
                        <TouchableWithoutFeedback
                          disabled=selectedCat
                          onPress={_ =>
                            handleActivityCheckPress(activity.title)
                          }>
                          <View>
                            <SpacedView vertical=XS horizontal=None>
                              {if (!selected) {
                                 <SVGcircle
                                   width={22.->ReactFromSvg.Size.dp}
                                   height={22.->ReactFromSvg.Size.dp}
                                   fill={theme.colors.gray}
                                 />;
                               } else {
                                 <SVGcheckmarkcircle
                                   width={22.->ReactFromSvg.Size.dp}
                                   height={22.->ReactFromSvg.Size.dp}
                                   fill={theme.colors.blue}
                                 />;
                               }}
                            </SpacedView>
                          </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          disabled=selectedCat
                          onPress={_ =>
                            handleActivityCheckPress(activity.title)
                          }>
                          <View style=Predefined.styles##flex>
                            <View style=Predefined.styles##rowCenter>
                              <SpacedView
                                vertical=XS
                                horizontal={Custom(13.)}
                                style=Predefined.styles##center>
                                <NamedIcon
                                  name=iconName
                                  fill=color
                                  width={22.->Style.dp}
                                  height={22.->Style.dp}
                                />
                              </SpacedView>
                              <View style=Predefined.styles##flex>
                                <SpacedView vertical=XS horizontal=None>
                                  <View style=Predefined.styles##rowCenter>
                                    <View style=Predefined.styles##flex>
                                      <Text
                                        style=Style.(
                                          list([
                                            Predefined.styles##flex,
                                            Theme.text##body,
                                            theme.styles##textOnBackground,
                                          ])
                                        )
                                        numberOfLines=1>
                                        activity.title->React.string
                                      </Text>
                                    </View>
                                    <Spacer size=S />
                                  </View>
                                </SpacedView>
                                {separator
                                   ? <Separator
                                       style=
                                         theme.styles##separatorOnBackground
                                     />
                                   : React.null}
                              </View>
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      </View>;
                    })
                  ->React.array;
                }
                : React.null}
           </React.Fragment>;
         })
       ->React.array}
    </View>
    <Separator style=theme.styles##separatorOnBackground />
    <BlockFootnote>
      {j|By selecting a category, all future activities in that category will be included.|j}
      ->React.string
    </BlockFootnote>
  </SpacedView>;
};
