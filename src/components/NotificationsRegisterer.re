open Belt;
open ReactNative;

[@react.component]
let make = () => {
  // clean badges when app is active
  let appState = ReactNativeHooks.useAppState();
  React.useEffect1(
    () => {
      if (appState === AppState.active) {
        ReactNativePushNotification.setApplicationIconBadgeNumber(0);
      };
      None;
    },
    [|appState|],
  );

  let (settings, _setSettings) = React.useContext(AppSettings.context);
  // update daily notification when opening the app
  let (notificationStatus, _requestNotificationPermission) =
    NotificationsHooks.useNotificationStatus();
  React.useEffect1(
    () => {
      if (notificationStatus === Some(ReactNativePermissions.granted)) {
        ReactNativePushNotification.cancelLocalNotifications({
          "id": Notifications.Ids.reminderDailyCheck,
        });

        if (settings.notificationsRecurrentRemindersOn) {
          settings.notificationsRecurrentReminders
          ->Array.forEach(notifTime => {
              ReactNativePushNotification.(
                localNotificationScheduleOptions(
                  ~id=Notifications.Ids.reminderDailyCheck,
                  ~userInfo={"id": Notifications.Ids.reminderDailyCheck},
                  ~date=
                    Notifications.appropriateTimeForNextNotification(
                      Js.Date.now(),
                      notifTime,
                    ),
                  ~message="Check at your goals progress",
                  ~repeatType=`day,
                  ~number=1,
                  ~priority=`low,
                  ~importance=`default,
                  // let foreground notif in dev, for convenience
                  // ~ignoreInForeground=true,
                  ~ignoreInForeground=!Global.__DEV__,
                  (),
                )
                ->localNotificationSchedule
              )
            });
        };
      };
      None;
    },
    [|notificationStatus|],
  );
  React.null;
};
