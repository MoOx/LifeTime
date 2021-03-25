open Belt
open ReactNative

let reccurentRemindersCatchPhrases = [
  "What about checking how your time is being spent?",
  "What about taking a look at your progress?",
  "What about taking a look to your goals and summary?",
  "What about checking your rings?",
  "What about checking your progress?",
  "Want to know how your time is being spent?",
  "Want to know if you are doing good with your goals?",
  "How are your goals rings?",
  "How is your progress today?",
  "How is your time being spend this days?",
  "If you have some time, try to check your progress",
  "If you have some time, try to check your goals",
]
let reccurentRemindersCatchPhrase_default = reccurentRemindersCatchPhrases->Array.getUnsafe(0)

@react.component
let make = (~notificationsRecurrentRemindersOn, ~notificationsRecurrentReminders) => {
  // clean badges when app is active
  let (appState, _previousAppState) = ReactNativeHooks.useAppState()
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
    Log.info(("Notifications: status", notificationStatus))
    if notificationStatus === Some(ReactNativePermissions.granted) {
      ReactNativePushNotification.cancelAllLocalNotifications()
      Log.info((
        "Notifications: notificationsRecurrentRemindersOn",
        notificationsRecurrentRemindersOn,
      ))
      if notificationsRecurrentRemindersOn {
        notificationsRecurrentReminders->Array.forEach(notifTime => {
          let date = Notifications.appropriateTimeForNextNotification(Js.Date.now(), notifTime)
          // let date = (Js.Date.now() +. 1000. *. 20.)->Js.Date.fromFloat
          Log.info(("Notifications:", notifTime, "planned at", date->Js.Date.toISOString))
          open ReactNativePushNotification
          localNotificationScheduleOptions(
            ~channelId="reminders",
            ~smallIcon="ic_notification",
            ~largeIcon="ic_launcher",
            // ~bigLargeIcon="ic_launcher",
            ~date,
            ~title=Platform.os === Platform.android ? "Reminder" : "",
            ~message=reccurentRemindersCatchPhrases
            ->Array.shuffle
            ->Array.get(0)
            ->Option.getWithDefault(reccurentRemindersCatchPhrase_default),
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
