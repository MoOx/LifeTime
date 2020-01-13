open ReactNative;
open ReactMultiversal;

let styles =
  Style.{
    "container": viewStyle(~flexGrow=1., ()),
    "text": textStyle(~fontSize=16., ~lineHeight=16. *. 1.4, ()),
  }
  ->StyleSheet.create;

let title = "LifeTime & Privacy";

[@react.component]
let make = () => {
  let theme = Theme.useTheme(AppSettings.useTheme());

  <SpacedView horizontal=L vertical=XL style=styles##container>
    <Center>
      <Title style=theme.styles##textOnBackground> title->React.string </Title>
    </Center>
    <Spacer size=L />
    <Text
      style=Style.(array([|styles##text, theme.styles##textOnBackground|]))>
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
