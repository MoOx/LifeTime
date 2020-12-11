open ReactNative
open ReactMultiversal

let title = "Settings"

@react.component
let make = () => {
  let (settings, setSettings) = React.useContext(AppSettings.context)
  let theme = Theme.useTheme(AppSettings.useTheme())

  let (
    notificationStatus,
    requestNotificationPermission,
  ) = NotificationsHooks.useNotificationStatus()
  let notificationsGranted = notificationStatus === Some(ReactNativePermissions.granted)

  <>
    <Spacer size=L />
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <View style={Predefined.styles["rowCenter"]}>
        <Spacer size=S />
        <View style={Predefined.styles["flex"]}>
          <SpacedView vertical=XS horizontal=None>
            <View style={Predefined.styles["row"]}>
              <View
                style={
                  open Style
                  array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
                }>
                <Text style={Style.array([Theme.text["body"], theme.styles["text"]])}>
                  {"Allow Notifications"->React.string}
                </Text>
              </View>
              <Switch
                value=notificationsGranted
                onValueChange={value =>
                  if value {
                    requestNotificationPermission()
                  } else {
                    ReactNativePermissions.openSettings()->ignore
                  }}
              />
              <Spacer size=S />
            </View>
          </SpacedView>
        </View>
      </View>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer size=L />
    <Separator style={theme.styles["separatorOnBackground"]} />
    <View style={theme.styles["background"]}>
      <View style={Predefined.styles["rowCenter"]}>
        <Spacer size=S />
        <View style={Predefined.styles["flex"]}>
          <SpacedView vertical=XS horizontal=None>
            <View style={Predefined.styles["row"]}>
              <View
                style={
                  open Style
                  array([Predefined.styles["flex"], Predefined.styles["justifyCenter"]])
                }>
                <Text style={Style.array([Theme.text["body"], theme.styles["text"]])}>
                  {"Daily Reminders"->React.string}
                </Text>
              </View>
              <Switch
                disabled={!notificationsGranted}
                value=settings.notificationsRecurrentRemindersOn
                onValueChange={notificationsRecurrentRemindersOn => {
                  setSettings(settings => {
                    ...settings,
                    lastUpdated: Js.Date.now(),
                    notificationsRecurrentRemindersOn: notificationsRecurrentRemindersOn,
                  })
                  if !notificationsRecurrentRemindersOn {
                    ReactNativePushNotification.cancelLocalNotifications({
                      "id": Notifications.Ids.reminderDailyCheck,
                    })
                  }
                }}
              />
              <Spacer size=S />
            </View>
          </SpacedView>
        </View>
      </View>
    </View>
    <Separator style={theme.styles["separatorOnBackground"]} />
    <Spacer />
  </>
}
