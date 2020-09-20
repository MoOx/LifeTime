open ReactNative;
open ReactMultiversal;

let styles =
  Style.{
    "content":
      viewStyle(
        ~flexShrink=1.,
        ~justifyContent=`center,
        ~borderRadius=Theme.Radius.card,
        (),
      ),
    "iconCalendar": imageStyle(~width=48.->dp, ~height=48.->dp, ()),
  }
  ->StyleSheet.create;

let icon = Packager.require("../../public/Icon.png");

[@react.component]
let make = (~onAboutPrivacyPress, ~onContinuePress) => {
  let theme = Theme.useTheme(AppSettings.useTheme());
  let animatedBottomTranslateY = React.useRef(Animated.Value.create(1000.));

  React.useEffect0(() => {
    Animated.(
      spring(
        animatedBottomTranslateY.current,
        Value.Spring.config(
          ~useNativeDriver=true,
          ~toValue=1.->Value.Spring.fromRawValue,
          ~tension=1.,
          ~delay=150.,
          (),
        ),
      )
      ->Animation.start()
    );
    None;
  });

  <Animated.View
    style=Style.(
      array([|
        style(
          ~transform=[|
            translateY(
              ~translateY=
                animatedBottomTranslateY.current->Animated.StyleProp.float,
            ),
          |],
          (),
        ),
      |])
    )>
    <View style=Style.(array([|styles##content, theme.styles##background|]))>
      <SpacedView>
        <View style=Predefined.styles##center>
          <IconCalendar style=styles##iconCalendar />
        </View>
        <Spacer />
        <Text
          style=Style.(
            array([|
              Theme.text##title2,
              Theme.text##bold,
              theme.styles##textOnBackground,
            |])
          )>
          "Set Up Calendars Access"->React.string
        </Text>
        <Spacer size=S />
        <Text
          style=Style.(
            array([|Theme.text##body, theme.styles##textOnBackground|])
          )>
          {(
             "LifeTime has been designed to protect your personal data and respect your privacy. "
             ++ "It has been built as an on-device service that you can trust. "
             ++ "\n"
             ++ "\n"
             ++ "We decided to rely on calendars as primary source of informations to follow your activities. "
             ++ "That's why LifeTime must read your calendars to be able to show you personal summary of your activities. "
           )
           ->React.string}
        </Text>
        <Spacer />
        <TouchableOpacity onPress=onAboutPrivacyPress>
          <Text
            style=Style.(array([|Theme.text##body, theme.styles##textBlue|]))>
            "Learn more about LifeTime & Privacy..."->React.string
          </Text>
        </TouchableOpacity>
        <Spacer />
        <TouchableButton
          text="Allow Calendars Access"
          onPress=onContinuePress
          styleBackground=Style.(
            viewStyle(~backgroundColor=theme.colors.blue, ())
          )
        />
      </SpacedView>
    </View>
  </Animated.View>;
};
