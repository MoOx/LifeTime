open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "container": viewStyle(~flexGrow=1., ()),
      "content": viewStyle(~flexGrow=1., ~justifyContent=`center, ()),
      "pitch":
        viewStyle(~flexGrow=1., ~flexShrink=1., ~justifyContent=`center, ()),
      "icon":
        imageStyle(
          ~width=76.->dp,
          ~height=76.->dp,
          ~borderRadius=16.,
          ~alignSelf=`flexStart,
          (),
        ),
      "title":
        textStyle(~fontSize=58., ~lineHeight=58., ~fontWeight=`_100, ()),
      "appName":
        textStyle(
          ~fontSize=68.,
          ~lineHeight=68.,
          ~fontWeight=`_800,
          // ~color=Consts.Colors.color1,
          (),
        ),
      "baseline": textStyle(~fontSize=18., ~lineHeight=18. *. 1.4, ()),
      "bottom": viewStyle(),
      "iconCalendar": imageStyle(~width=48.->dp, ~height=48.->dp, ()),
      "bottomText": viewStyle(~flexShrink=1., ()),
      "permissions":
        textStyle(~flexShrink=1., ~fontSize=12., ~lineHeight=12. *. 1.4, ()),
      "permissionsLink":
        textStyle(
          ~flexShrink=1.,
          ~fontSize=14.,
          ~lineHeight=14. *. 1.4,
          ~fontWeight=`_600,
          (),
        ),
    })
  );

open Theme;
let themedStyles =
  Style.{
    light:
      StyleSheet.create({
        "wrapper":
          viewStyle(~backgroundColor=Theme.Colors.light.background, ()),
        "title": textStyle(~color=Theme.Colors.light.textOnBackground, ()),
        "appName": textStyle(~color=Theme.Colors.light.main, ()),
        "baseline": textStyle(~color=Theme.Colors.light.textOnBackground, ()),
        "permissions":
          textStyle(~color=Theme.Colors.light.textLightOnBackground, ()),
        "permissionsLink": textStyle(~color=Theme.Colors.light.main, ()),
      }),
    dark:
      StyleSheet.create({
        "wrapper":
          viewStyle(~backgroundColor=Theme.Colors.dark.background, ()),
        "title": textStyle(~color=Theme.Colors.dark.textOnBackground, ()),
        "appName": textStyle(~color=Theme.Colors.dark.main, ()),
        "baseline": textStyle(~color=Theme.Colors.dark.textOnBackground, ()),
        "permissions":
          textStyle(~color=Theme.Colors.dark.textLightOnBackground, ()),
        "permissionsLink": textStyle(~color=Theme.Colors.dark.main, ()),
      }),
  };

let icon = Packager.require("../../public/Icon.png");

[@react.component]
let make = () => {
  let dynamicStyles = Hooks.useStyles(themedStyles);
  let windowDimensions = Dimensions.useWindowDimensions();
  let animatedPitchOpacity = React.useRef(Animated.Value.create(0.));
  let animatedPitchScale = React.useRef(Animated.Value.create(0.75));
  let animatedBottomOpacity = React.useRef(Animated.Value.create(0.));
  let animatedBottomTranslateY = React.useRef(Animated.Value.create(200.));

  React.useEffect0(() => {
    Animated.(
      parallel(
        [|
          spring(
            animatedPitchScale->React.Ref.current,
            Value.Spring.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Spring.fromRawValue,
              ~delay=750.,
              ~tension=1.,
              (),
            ),
          ),
          timing(
            animatedPitchOpacity->React.Ref.current,
            Value.Timing.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Timing.fromRawValue,
              ~duration=1200.,
              ~delay=750.,
              (),
            ),
          ),
          spring(
            animatedBottomTranslateY->React.Ref.current,
            Value.Spring.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Spring.fromRawValue,
              ~delay=1250.,
              ~tension=1.,
              (),
            ),
          ),
          timing(
            animatedBottomOpacity->React.Ref.current,
            Value.Timing.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Timing.fromRawValue,
              ~duration=1200.,
              ~delay=1250.,
              (),
            ),
          ),
        |],
        {"stopTogether": false},
      )
      ->Animation.start()
    );
    None;
  });

  <ScrollView horizontal=true pagingEnabled=true style=dynamicStyles##wrapper>
    <SafeAreaView style=styles##container>
      <SpacedView
        horizontal=XL
        style=Style.(
          array([|
            styles##content,
            style(~width=windowDimensions##width->dp, ()),
          |])
        )>
        <Animated.View
          style=Style.(
            array([|
              styles##pitch,
              style(
                ~opacity=
                  animatedPitchOpacity
                  ->React.Ref.current
                  ->Animated.StyleProp.float,
                ~transform=[|
                  scale(
                    ~scale=
                      animatedPitchScale
                      ->React.Ref.current
                      ->Animated.StyleProp.float,
                  ),
                |],
                (),
              ),
            |])
          )>
          <Image style=styles##icon source={icon->Image.Source.fromRequired} />
          <Spacer size=L />
          <Text style=Style.(array([|styles##title, dynamicStyles##title|]))>
            "Welcome to"->React.string
          </Text>
          <Text
            style=Style.(array([|styles##appName, dynamicStyles##appName|]))>
            "LifeTime"->React.string
          </Text>
          <Spacer />
          <Text
            style=Style.(array([|styles##baseline, dynamicStyles##baseline|]))>
            "Your personal coach, helping you to reach your goals and spend your valuable time on things you love."
            ->React.string
          </Text>
        </Animated.View>
        <Spacer />
        <Animated.View
          style=Style.(
            array([|
              styles##bottom,
              style(
                ~opacity=
                  animatedBottomOpacity
                  ->React.Ref.current
                  ->Animated.StyleProp.float,
                ~transform=[|
                  translateY(
                    ~translateY=
                      animatedBottomTranslateY
                      ->React.Ref.current
                      ->Animated.StyleProp.float,
                  ),
                |],
                (),
              ),
            |])
          )>
          <Row>
            <IconCalendar style=styles##iconCalendar />
            <Spacer size=S />
            <View style=styles##bottomText>
              <Text
                style=Style.(
                  array([|styles##permissions, dynamicStyles##permissions|])
                )>
                "LifeTime needs access to your calendar to show activity reports & suggestions. Your data stay on your device."
                ->React.string
              </Text>
              <Spacer size=S />
              <TouchableOpacity onPress={_ => ()}>
                <Text
                  style=Style.(
                    array([|
                      styles##permissionsLink,
                      dynamicStyles##permissionsLink,
                    |])
                  )>
                  "About LifeTime & Privacy..."->React.string
                </Text>
              </TouchableOpacity>
            </View>
          </Row>
          <Spacer size=L />
          <TouchableButton text="Continue" onPress={_ => ()} />
        </Animated.View>
      </SpacedView>
    </SafeAreaView>
  </ScrollView>;
};
