open ReactNative
open ReactMultiversal

let styles = {
  open Style
  {"container": viewStyle(~flexGrow=1., ())}
}->StyleSheet.create

let title = "LifeTime & Privacy"

@react.component
let make = () => {
  let theme = Theme.useTheme(AppSettings.useTheme())

  <SpacedView horizontal=L vertical=XL style={styles["container"]}>
    <Center>
      <Text
        allowFontScaling=false
        style={Style.array([
          Theme.text["largeTitle"],
          Theme.text["weight700"],
          theme.styles["text"],
        ])}>
        {title->React.string}
      </Text>
    </Center>
    <Spacer size=L />
    <Text
      style={
        open Style
        array([Theme.text["body"], theme.styles["text"]])
      }>
      {j`LifeTime is designed to protect your information. It only runs computation on your device and does not share your information anywhere.

The calendars access we need to run our computation is mostly read-only. All the informations retrieved from your calendars are only used on your device, to generate reports & offers you suggestions.
We don't collect anything. We don't track you with any kind of third-party services.

The settings of the application are stored on device, which includes things like:

- Names of activities that are assigned to categories,
- Categories of activities,
- Names of calendars skipped
- Goals informations
- Application settings like color theme & notifications preferences

This mean, unless you backup your data, you cannot recover your personal settings if you remove the application.

In the future, if we need to share collect data to improve the application, this will be with your explicit consent and all the data will be anonymised to respect privacy.
`->React.string}
    </Text>
  </SpacedView>
}
