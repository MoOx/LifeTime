let useNotificationStatus = () => {
  let (notificationStatus, notificationStatus_set) = React.useState(() => None)
  let (appState, _previousAppState) = ReactNativeHooks.useAppState()
  React.useEffect2(() => {
    if appState === #active {
      Log.info("NotificationsHooks: checkNotifications request")
      open ReactNativePermissions
      checkNotifications()
      ->FuturePromise.fromPromise
      ->Future.mapError(error => Log.error(("NotificationsHooks: checkNotifications", error)))
      ->Future.tapOk(res => notificationStatus_set(_ => Some(res.status)))
      ->ignore
    }
    None
  }, (appState, notificationStatus_set))

  let requestNotificationPermission = React.useCallback2(() =>
    notificationStatus !== Some(ReactNativePermissions.blocked)
      ? {
          open ReactNativePermissions
          requestNotifications(["alert", "badge", "sound"])
          ->FuturePromise.fromPromise
          ->Future.mapError(error =>
            Log.error(("NotificationsHooks: requestNotificationPermission", error))
          )
          ->Future.tapOk(res => notificationStatus_set(_ => Some(res.status)))
          ->ignore
        }
      : ReactNativePermissions.openSettings()->ignore
  , (notificationStatus, notificationStatus_set))

  (notificationStatus, requestNotificationPermission)
}
