open ReactNative
open ReactNative.Style
open ReactMultiversal

let styles = {
  "content": viewStyle(
    ~flexShrink=1.,
    ~justifyContent=#center,
    ~borderRadius=Theme.Radius.card,
    (),
  ),
  "iconCalendar": imageStyle(~width=48.->dp, ~height=48.->dp, ()),
}->StyleSheet.create

let icon = Packager.require("../../public/Icon.png")

@react.component
let make = (~onAboutPrivacyPress, ~onContinuePress) => {
  let theme = Theme.useTheme(AppSettings.useTheme())
  let animatedBottomTranslateY = React.useRef(Animated.Value.create(1000.))

  React.useEffect0(() => {
    open Animated
    spring(
      animatedBottomTranslateY.current,
      Value.Spring.config(
        ~useNativeDriver=true,
        ~toValue=1.->Value.Spring.fromRawValue,
        ~tension=1.,
        ~delay=150.,
        (),
      ),
    )->Animation.start()

    None
  })

  <Animated.View
    style={array([
      style(
        ~transform=[
          translateY(~translateY=animatedBottomTranslateY.current->Animated.StyleProp.float),
        ],
        (),
      ),
      Predefined.styles["flex"],
    ])}>
    <SpacedView style={array([styles["content"], theme.styles["background"]])}>
      <View style={Predefined.styles["center"]}>
        <IconCalendar style={styles["iconCalendar"]} />
      </View>
      <Spacer />
      <Text style={array([Theme.text["title2"], Theme.text["weight700"], theme.styles["text"]])}>
        {"Set Up Calendars Access"->React.string}
      </Text>
      <Spacer size=S />
      <ScrollView style={Predefined.styles["flex"]}>
        <Text style={array([Theme.text["body"], theme.styles["text"]])}>
          {("LifeTime has been designed to protect your personal data and respect your privacy. " ++
          "It has been built as an on-device service that you can trust. " ++
          "\n" ++
          "\n" ++ "Calendars are used as the primary source of informations to follow your activities. LifeTime must have read access to them to be able to show reports and suggestions.")
            ->React.string}
        </Text>
        <Spacer />
        <TouchableOpacity onPress=onAboutPrivacyPress>
          <Text style={array([Theme.text["body"], theme.styles["textBlue"]])}>
            {"Learn more about LifeTime & Privacy..."->React.string}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Spacer />
      <TouchableButton
        testID="AllowCalendarsAccess"
        text="Allow Calendars Access"
        onPress=onContinuePress
        styleBackground={viewStyle(~backgroundColor=theme.colors.blue, ())}
      />
    </SpacedView>
  </Animated.View>
}
