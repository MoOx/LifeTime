open ReactNative
open ReactNative.Style
open ReactMultiversal

let styles = {
  {
    "content": viewStyle(~flexGrow=1., ~justifyContent=#center, ()),
    "pitch": viewStyle(~flexGrow=1., ~flexShrink=1., ~justifyContent=#center, ()),
    "title": Platform.os === Platform.ios
      ? textStyle(~fontSize=58., ~lineHeight=60., ())
      : textStyle(~fontSize=48., ~lineHeight=50., ()),
    "appName": Platform.os === Platform.ios
      ? textStyle(~fontSize=68., ~lineHeight=70., ())
      : textStyle(~fontSize=58., ~lineHeight=60., ()),
    "baseline": textStyle(~fontSize=18., ~lineHeight=18. *. 1.4, ()),
    "bottom": viewStyle(),
    "iconCalendar": imageStyle(~width=48.->dp, ~height=48.->dp, ~marginTop=2.->dp, ()),
    "permissions": textStyle(~flexShrink=1., ~fontSize=12., ~lineHeight=12. *. 1.4, ()),
    "permissionsLink": textStyle(~textAlign=#center, ~fontSize=14., ~lineHeight=14. *. 1.4, ()),
  }
}->StyleSheet.create

let icon = Packager.require("../../public/Icon.png")

@react.component
let make = (~onAboutPrivacyPress, ~onContinuePress) => {
  let windowDimensions = Dimensions.useWindowDimensions()
  let theme = Theme.useTheme(AppSettings.useTheme())
  let animatedPitchOpacity = React.useRef(Animated.Value.create(0.))
  let animatedPitchScale = React.useRef(Animated.Value.create(0.75))
  let animatedBottomOpacity = React.useRef(Animated.Value.create(0.))
  let animatedBottomTranslateY = React.useRef(Animated.Value.create(200.))

  React.useEffect0(() => {
    {
      open Animated
      parallel(
        [
          spring(
            animatedPitchScale.current,
            Value.Spring.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Spring.fromRawValue,
              ~delay=750.,
              ~tension=1.,
              (),
            ),
          ),
          timing(
            animatedPitchOpacity.current,
            Value.Timing.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Timing.fromRawValue,
              ~duration=1200.,
              ~delay=750.,
              (),
            ),
          ),
          spring(
            animatedBottomTranslateY.current,
            Value.Spring.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Spring.fromRawValue,
              ~delay=1250.,
              ~tension=1.,
              (),
            ),
          ),
          timing(
            animatedBottomOpacity.current,
            Value.Timing.config(
              ~useNativeDriver=true,
              ~toValue=1.->Value.Timing.fromRawValue,
              ~duration=1200.,
              ~delay=1250.,
              (),
            ),
          ),
        ],
        {stopTogether: false},
      )->Animation.start()
    }

    None
  })
  let isWindowTall = windowDimensions.height > 650.
  <SpacedView horizontal={isWindowTall ? XL : L} vertical=M style={Predefined.styles["flexGrow"]}>
    <Animated.View
      style={array([
        styles["pitch"],
        style(
          ~opacity=animatedPitchOpacity.current->Animated.StyleProp.float,
          ~transform=[scale(~scale=animatedPitchScale.current->Animated.StyleProp.float)],
          (),
        ),
      ])}>
      <Pressable onPress=onContinuePress>
        {_ => <>
          <Image
            style={
              let size = windowDimensions.height > 650. ? 76. : 52.
              imageStyle(
                ~width=size->dp,
                ~height=size->dp,
                ~borderRadius=size /. 5.,
                ~alignSelf=#flexStart,
                (),
              )
            }
            source={icon->Image.Source.fromRequired}
          />
          <Spacer size={isWindowTall ? M : XXS} />
          <Text
            style={array([styles["title"], theme.styles["text"], Theme.text["weight100"]])}
            numberOfLines=1
            adjustsFontSizeToFit=true
            allowFontScaling=false>
            {"Welcome to"->React.string}
          </Text>
          <Text
            style={array([styles["appName"], theme.styles["textMain"], Theme.text["weight800"]])}
            numberOfLines=1
            adjustsFontSizeToFit=true
            allowFontScaling=false>
            {"LifeTime"->React.string}
          </Text>
          <Spacer size={isWindowTall ? M : XXS} />
          <Text style={array([styles["baseline"], theme.styles["text"]])}>
            {"Your personal coach, helping you to reach your goals and spend your valuable time on things you love."->React.string}
          </Text>
        </>}
      </Pressable>
    </Animated.View>
    <Spacer />
    <Animated.View
      style={array([
        styles["bottom"],
        style(
          ~opacity=animatedBottomOpacity.current->Animated.StyleProp.float,
          ~transform=[
            translateY(~translateY=animatedBottomTranslateY.current->Animated.StyleProp.float),
          ],
          (),
        ),
      ])}>
      <Pressable onPress=onContinuePress>
        {_ =>
          <Row>
            <IconCalendar style={styles["iconCalendar"]} />
            <Spacer size=S />
            <Text style={array([styles["permissions"], theme.styles["textGray"]])}>
              {"LifeTime needs access to your calendar to show activity reports & suggestions. Your data stay on your device."->React.string}
            </Text>
          </Row>}
      </Pressable>
      <TouchableOpacity onPress=onAboutPrivacyPress>
        <SpacedView horizontal=None vertical=S>
          <Text
            style={array([
              Theme.text["weight600"],
              styles["permissionsLink"],
              theme.styles["textMain"],
            ])}>
            {"About LifeTime & Privacy..."->React.string}
          </Text>
        </SpacedView>
      </TouchableOpacity>
      <Spacer size=S />
      <Spacer size=XS />
      <TouchableButton testID="WelcomeContinue" text="Continue" onPress=onContinuePress />
      <Spacer />
    </Animated.View>
  </SpacedView>
}
