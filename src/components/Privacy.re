open ReactNative;
open ReactMultiversal;

let styles =
  Style.(
    StyleSheet.create({
      "container": viewStyle(~flexGrow=1., ()),
      "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
    })
  );

open Theme;
let themedStyles =
  Style.{
    light:
      StyleSheet.create({
        "wrapper":
          viewStyle(~backgroundColor=Theme.Colors.light.background, ()),

        "titleText":
          textStyle(~color=Theme.Colors.light.textOnBackground, ()),
        "text": textStyle(~color=Theme.Colors.light.textOnBackground, ()),
      }),
    dark:
      StyleSheet.create({
        "wrapper":
          viewStyle(~backgroundColor=Theme.Colors.dark.background, ()),
        "titleText": textStyle(~color=Theme.Colors.dark.textOnBackground, ()),
        "text": textStyle(~color=Theme.Colors.dark.textOnBackground, ()),
      }),
  };

let title = "LifeTime & Privacy";

[@react.component]
let make = () => {
  let dynamicStyles = Theme.useYourStyles(themedStyles);

  <SpacedView horizontal=L vertical=XL style=styles##container>
    <Center>
      <Title style=dynamicStyles##titleText> title->React.string </Title>
    </Center>
    <Spacer size=L />
    <Text style=Style.(array([|styles##text, dynamicStyles##text|]))>
      {j|LifeTime is designed to protect your information.

LifeTime only run computation on your device and does not share your information anywhere.

All the informations retrieved from your calendars are only used on your devices, to generate reports & offers you suggestions.

It's that simple for now.
|j}
      ->React.string
    </Text>
    <Spacer size=XXL />
  </SpacedView>;
};
