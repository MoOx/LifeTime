open ReactNative;
open ReactMultiversal;

let styles =
  Style.{"container": viewStyle(~flexGrow=1., ())}->StyleSheet.create;

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
      style=Style.(
        array([|Theme.text##body, theme.styles##textOnBackground|])
      )>
      {j|LifeTime is designed to protect your information. It only runs computation on your device and does not share your information anywhere.

The calendars access we need to run our computation is read-only. All the informations retrieved from your calendars are only used on your device, to generate reports & offers you suggestions.
We don't collect anything. We don't track you with any kind of third-party services.

The settings of the application are stored on device, which includes:

- Names of activities that are assigned to categories,
- Categories of activities,
- Names of calendars skipped
- Goals information
- Application color theme

This mean, unless you backup your data, you cannot recover your personal settings if you remove the application.

In the future, if we need to share collect data to improve the application, this will be with your explicit consent and all the data will be anonymised to respect privacy.
|j}
      ->React.string
    </Text>
    <Spacer size=XXL />
  </SpacedView>;
};
