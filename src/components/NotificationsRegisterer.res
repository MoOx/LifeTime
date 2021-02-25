open Belt
open ReactNative

@react.component
let make = (~notificationsRecurrentRemindersOn, ~notificationsRecurrentReminders) => {
  // clean badges when app is active
  let appState = ReactNativeHooks.useAppState()
  React.useEffect1(() => {
    if appState === #active {
      ReactNativePushNotification.setApplicationIconBadgeNumber(0)
    }
    None
  }, [appState])

  // update daily notification when opening the app
  let (
    notificationStatus,
    _requestNotificationPermission,
  ) = NotificationsHooks.useNotificationStatus()
  React.useEffect3(() => {
    if notificationStatus === Some(ReactNativePermissions.granted) {
      ReactNativePushNotification.cancelLocalNotifications({
        "id": Notifications.Ids.reminderDailyCheck,
      })

      if notificationsRecurrentRemindersOn {
        notificationsRecurrentReminders->Array.forEach(notifTime => {
          open ReactNativePushNotification
          localNotificationScheduleOptions(
            ~channelId="reminders",
            ~id=Notifications.Ids.reminderDailyCheck,
            ~userInfo={"id": Notifications.Ids.reminderDailyCheck},
            ~date=Notifications.appropriateTimeForNextNotification(Js.Date.now(), notifTime),
            ~message="Check at your goals progress",
            ~repeatType=#day,
            ~number=1,
            ~priority=#low,
            ~importance=#default,
            // let foreground notif in dev, for convenience
            // ~ignoreInForeground=true,
            ~ignoreInForeground=!Global.__DEV__,
            (),
          )->localNotificationSchedule
        })
      }
    }
    None
  }, (notificationStatus, notificationsRecurrentReminders, notificationsRecurrentRemindersOn))
  React.null
}
