open Belt
open ReactNative

let reccurentRemindersCatchPhrase_default = "Check at your goals progress"
let reccurentRemindersCatchPhrases = [
  reccurentRemindersCatchPhrase_default,
  "Take a look at your progress",
  "How are your goals rings today?",
  "What about taking a look to your goals and summary?",
  "It's time to check your rings",
]

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
    if notificationStatus === Some(ReactNativePermissions.granted) {
      ReactNativePushNotification.cancelLocalNotifications({
        "id": Notifications.Ids.reminderDailyCheck,
      })

      if notificationsRecurrentRemindersOn {
        notificationsRecurrentReminders->Array.forEach(notifTime => {
          let date = Notifications.appropriateTimeForNextNotification(Js.Date.now(), notifTime)
          // let date = (Js.Date.now() +. 1000. *. 20.)->Js.Date.fromFloat
          Log.info(("Notifications:", notifTime, "planned at", date->Js.Date.toISOString))
          open ReactNativePushNotification
          localNotificationScheduleOptions(
            ~channelId="reminders",
            ~id=Notifications.Ids.reminderDailyCheck,
            ~userInfo={"id": Notifications.Ids.reminderDailyCheck},
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
