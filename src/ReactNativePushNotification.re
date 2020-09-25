type permissions = {
  alert: option(bool),
  badge: option(bool),
  sound: option(bool),
};
[@bs.obj]
external permissions:
  (~alert: bool=?, ~badge: bool=?, ~sound: bool=?) => permissions;

type notification('data, 'alert) = {
  foreground: bool,
  userInteraction: bool,
  message: string,
  data: 'data,
  subText: option(string),
  badge: int,
  alert: 'alert,
  sound: string,
  finish: ReactNativePushNotificationIOS.FetchResult.t => unit,
};

type tokenData = {
  os: string,
  token: string,
};
type configureOptions;
[@bs.obj]
external configureOptions:
  (
    ~onRegister: tokenData => unit=?,
    ~onNotification: notification('data, 'alert) => unit=?,
    ~onAction: notification('data, 'alert) => unit=?,
    ~onRegistrationError: Js.Exn.t => unit=?,
    ~onRemoteFetch: 'data => unit=?,
    ~permissions: permissions=?,
    ~popInitialNotification: bool=?,
    ~requestPermissions: bool=?,
    unit
  ) =>
  configureOptions;

[@bs.module "react-native-push-notification"]
external configure: configureOptions => unit = "configure";

type localNotificationOptions;
[@bs.obj]
// if you edit any of this below, please report to localNotificationScheduleOptions
external localNotificationOptions:
  (
    ~id: float=?,
    ~message: string,
    ~number: int=?,
    ~playSound: bool=?,
    ~repeatType: [@bs.string] [ | `week | `day | `hour | `minute | `time]=?,
    ~soundName: string=?,
    ~title: string=?,
    ~userInfo: 'userInfo=?,
    /* Android only properties */
    ~actions: string=?,
    ~autoCancel: bool=?,
    ~bigPictureUrl: string=?,
    ~bigText: string=?,
    ~channelId: string=?,
    ~color: string=?,
    ~group: string=?,
    ~groupSummary: bool=?,
    ~ignoreInForeground: bool=?,
    ~importance: [@bs.string] [
                   | `default
                   | `max
                   | `high
                   | `low
                   | `min
                   | `none
                   | `unspecified
                 ]
                   =?,
    ~invokeApp: bool=?,
    ~largeIcon: string=?,
    ~largeIconUrl: string=?,
    ~messageId: string=?,
    ~ongoing: bool=?,
    ~onlyAlertOnce: bool=?,
    ~priority: [@bs.string] [ | `max | `high | `low | `min | `default]=?,
    ~repeatTime: float=?,
    ~shortcutId: string=?,
    ~showWhen: bool=?,
    ~smallIcon: string=?,
    ~subText: string=?,
    ~tag: string=?,
    ~ticker: string=?,
    ~vibrate: bool=?,
    ~vibration: float=?,
    ~visibility: [@bs.string] [ | `private | `public | `secret]=?,
    /* iOS only properties */
    ~alertAction: string=?,
    ~category: string=?,
    unit
  ) =>
  localNotificationOptions;

[@bs.module "react-native-push-notification"]
external localNotification: localNotificationOptions => unit =
  "localNotification";

type localNotificationScheduleOptions;
[@bs.obj]
external localNotificationScheduleOptions:
  (
    ~date: Js.Date.t,
    // copy of localNotificationOptions below
    ~id: float=?,
    ~message: string,
    ~number: int=?,
    ~playSound: bool=?,
    ~repeatType: [@bs.string] [ | `week | `day | `hour | `minute | `time]=?,
    ~soundName: string=?,
    ~title: string=?,
    ~userInfo: 'userInfo=?,
    /* Android only properties */
    ~actions: string=?,
    ~autoCancel: bool=?,
    ~bigPictureUrl: string=?,
    ~bigText: string=?,
    ~channelId: string=?,
    ~color: string=?,
    ~group: string=?,
    ~groupSummary: bool=?,
    ~ignoreInForeground: bool=?,
    ~importance: [@bs.string] [
                   | `default
                   | `max
                   | `high
                   | `low
                   | `min
                   | `none
                   | `unspecified
                 ]
                   =?,
    ~invokeApp: bool=?,
    ~largeIcon: string=?,
    ~largeIconUrl: string=?,
    ~messageId: string=?,
    ~ongoing: bool=?,
    ~onlyAlertOnce: bool=?,
    ~priority: [@bs.string] [ | `max | `high | `low | `min | `default]=?,
    ~repeatTime: float=?,
    ~shortcutId: string=?,
    ~showWhen: bool=?,
    ~smallIcon: string=?,
    ~subText: string=?,
    ~tag: string=?,
    ~ticker: string=?,
    ~vibrate: bool=?,
    ~vibration: float=?,
    ~visibility: [@bs.string] [ | `private | `public | `secret]=?,
    /* iOS only properties */
    ~alertAction: string=?,
    ~category: string=?,
    unit
  ) =>
  localNotificationScheduleOptions;

[@bs.module "react-native-push-notification"]
external localNotificationSchedule: localNotificationScheduleOptions => unit =
  "localNotificationSchedule";

[@bs.module "react-native-push-notification"]
external popInitialNotification: notification('data, 'alert) => unit =
  "popInitialNotification";

// export class ChannelObject {
// channelId: string,
// channelName: string,
// channelDescription?: string,
// soundName?: string,
// importance?: number,
// vibrate?: bool,
// }
// [@bs.module "react-native-push-notification"] external getChannels:(
//     callback: (channel_ids: string[]) => unit
// )=> unit ="getChannels";
// [@bs.module "react-native-push-notification"] external channelExists:(
//     channel_id: string,
//     callback: (exists: bool) => unit
// )=> unit ="channelExists";
// [@bs.module "react-native-push-notification"] external createChannel:(
//     channel: ChannelObject,
//     callback: (created: bool) => unit
// )=> unit="createChannel";
// [@bs.module "react-native-push-notification"] external channelBlocked:(
//     channel_id: string,
//     callback: (blocked: bool) => unit
// )=> unit="channelBlocked";
// [@bs.module "react-native-push-notification"] external deleteChannel:(channel_id: string)=> unit="deleteChannel";

[@bs.module "react-native-push-notification"]
external cancelAllLocalNotifications: unit => unit =
  "cancelAllLocalNotifications";
[@bs.module "react-native-push-notification"]
external removeAllDeliveredNotifications: unit => unit =
  "removeAllDeliveredNotifications";

type deliveredNotification = {
  identifier: string,
  title: string,
  body: string,
  tag: string,
  group: string,
};
[@bs.module "react-native-push-notification"]
external getDeliveredNotifications:
  (array(deliveredNotification) => unit) => unit =
  "getDeliveredNotifications";

type scheduledNotification = {
  id: int,
  date: Js.Date.t,
  title: string,
  body: string,
  soundName: string,
  repeatInterval: int,
  number: int,
};
[@bs.module "react-native-push-notification"]
external getScheduledLocalNotifications:
  (array(scheduledNotification) => unit) => unit =
  "getScheduledLocalNotifications";

[@bs.module "react-native-push-notification"]
external removeDeliveredNotifications: array(string) => unit =
  "removeDeliveredNotifications";

[@bs.module "react-native-push-notification"]
external cancelLocalNotifications: 'userInfo => unit =
  "cancelLocalNotifications";

[@bs.module "react-native-push-notification"]
external clearLocalNotification: (string, int) => unit =
  "clearLocalNotification";
[@bs.module "react-native-push-notification"]
external clearAllNotifications: unit => unit = "clearAllNotifications";

// [@bs.module "react-native-push-notification"] external unregister :unit => unit = "unregister";
// [@bs.module "react-native-push-notification"] external requestPermissions :(
//     permissions?: Array<"alert" | "badge" | "sound">
// )=> Promise<PushNotificationPermissions> = "requestPermissions",
// [@bs.module "react-native-push-notification"] external subscribeToTopic:(topic: string)=> unit = "subscribeToTopic";
// [@bs.module "react-native-push-notification"] external unsubscribeFromTopic:(topic: string)=> unit = "unsubscribeFromTopic";
// [@bs.module "react-native-push-notification"] external presentLocalNotification:(notification: PushNotificationObject)=> unit = "presentLocalNotification";
// [@bs.module "react-native-push-notification"] external scheduleLocalNotification:(notification: PushNotificationScheduleObject)=> unit = "scheduleLocalNotification";

// [@bs.module "react-native-push-notification"] external setApplicationIconBadgeNumber:(badgeCount: number)=> unit = "setApplicationIconBadgeNumber";
// [@bs.module "react-native-push-notification"] external getApplicationIconBadgeNumber:(
//     callback: (badgeCount: number) => unit
// )=> unit ="getApplicationIconBadgeNumber";

// [@bs.module "react-native-push-notification"] external abandonPermissions:unit => unit = "abandonPermissions";
// [@bs.module "react-native-push-notification"] external checkPermissions:(
//     callback: (permissions: PushNotificationPermissions) => unit
// )=> unit = "checkPermissions";

// [@bs.module "react-native-push-notification"] external invokeApp:(notification: PushNotificationObject)=> unit ="invokeApp";
