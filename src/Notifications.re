module Ids = {
  let reminderCheckGoals = 1->Js.Int.toString;
};
let useNotificationStatus = () => {
  let (notificationStatus, notificationStatus_set) =
    React.useState(() => None);
  React.useEffect1(
    () => {
      ReactNativePermissions.(
        checkNotifications()
        ->FutureJs.fromPromise(error => {Js.Console.error(error)})
        ->Future.tapOk(res => {notificationStatus_set(_ => Some(res.status))})
        ->ignore
      );
      None;
    },
    [||],
  );
  (notificationStatus, notificationStatus_set);
};
