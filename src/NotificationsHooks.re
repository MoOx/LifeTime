let useNotificationStatus = () => {
  let (notificationStatus, notificationStatus_set) =
    React.useState(() => None);
  let appState = ReactNativeHooks.useAppState();
  React.useEffect1(
    () => {
      if (appState === `active) {
        ReactNativePermissions.(
          checkNotifications()
          ->FutureJs.fromPromise(error => {Js.Console.error(error)})
          ->Future.tapOk(res => {
              notificationStatus_set(_ => Some(res.status))
            })
          ->ignore
        );
      };
      None;
    },
    [|appState|],
  );

  let requestNotificationPermission =
    React.useCallback(() => {
      notificationStatus !== Some(ReactNativePermissions.blocked)
        ? ReactNativePermissions.(
            requestNotifications([|"alert", "badge", "sound"|])
            ->FutureJs.fromPromise(error => {Js.Console.error(error)})
            ->Future.tapOk(res => {
                notificationStatus_set(_ => Some(res.status))
              })
            ->ignore
          )
        : ReactNativePermissions.openSettings()->ignore
    });

  (notificationStatus, requestNotificationPermission);
};
