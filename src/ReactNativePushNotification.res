type permissions = {
  alert: option<bool>,
  badge: option<bool>,
  sound: option<bool>,
}
@bs.obj
external permissions: (~alert: bool=?, ~badge: bool=?, ~sound: bool=?) => permissions = ""

type notification<'data, 'alert> = {
  alert: 'alert,
  badge: option<int>,
  data: 'data,
  finish: ReactNativePushNotificationIOS.FetchResult.t => unit,
  foreground: bool,
  id: option<string>,
  message: string,
  soundName: option<string>,
  title: string,
  userInteraction: bool,
}

type tokenData = {
  os: string,
  token: string,
}
type configureOptions
@bs.obj
external configureOptions: (
  ~onRegister: tokenData => unit=?,
  ~onNotification: notification<'data, 'alert> => unit=?,
  ~onAction: notification<'data, 'alert> => unit=?,
  ~onRegistrationError: Js.Exn.t => unit=?,
  ~onRemoteFetch: 'data => unit=?,
  ~permissions: permissions=?,
  ~popInitialNotification: bool=?,
  ~requestPermissions: bool=?,
  unit,
) => configureOptions = ""

@bs.module("react-native-push-notification")
external configure: configureOptions => unit = "configure"

type localNotificationOptions
@bs.obj
external // if you edit any of this below, please report to localNotificationScheduleOptions
localNotificationOptions: (
  ~id: string=?, // int as string
  ~message: string,
  ~number: int=?,
  ~playSound: bool=?,
  ~repeatType: [#week | #day | #hour | #minute | #time]=?,
  ~soundName: string=?,
  ~title: string=?,
  ~userInfo: 'userInfo=?,
  ~actions: /* Android only properties */
  string=?,
  ~autoCancel: bool=?,
  ~bigPictureUrl: string=?,
  ~bigText: string=?,
  ~channelId: string=?,
  ~color: string=?,
  ~group: string=?,
  ~groupSummary: bool=?,
  ~ignoreInForeground: bool=?,
  ~importance: [#default | #max | #high | #low | #min | #none | #unspecified]=?,
  ~invokeApp: bool=?,
  ~largeIcon: string=?,
  ~largeIconUrl: string=?,
  ~messageId: string=?,
  ~ongoing: bool=?,
  ~onlyAlertOnce: bool=?,
  ~priority: [#max | #high | #low | #min | #default]=?,
  ~repeatTime: float=?,
  ~shortcutId: string=?,
  ~showWhen: bool=?,
  ~smallIcon: string=?,
  ~subText: string=?,
  ~tag: string=?,
  ~ticker: string=?,
  ~vibrate: bool=?,
  ~vibration: float=?,
  ~visibility: [#private_ | #public | #secret]=?,
  ~alertAction: /* iOS only properties */
  string=?,
  ~category: string=?,
  unit,
) => localNotificationOptions = ""

@bs.module("react-native-push-notification")
external localNotification: localNotificationOptions => unit = "localNotification"

type localNotificationScheduleOptions
@bs.obj
external localNotificationScheduleOptions: (
  ~date: Js.Date.t,
  ~id: // copy of localNotificationOptions below
  string=?, // int as string
  ~message: string,
  ~number: int=?,
  ~playSound: bool=?,
  ~repeatType: [#week | #day | #hour | #minute | #time]=?,
  ~soundName: string=?,
  ~title: string=?,
  ~userInfo: 'userInfo=?,
  ~actions: /* Android only properties */
  string=?,
  ~autoCancel: bool=?,
  ~bigPictureUrl: string=?,
  ~bigText: string=?,
  ~channelId: string=?,
  ~color: string=?,
  ~group: string=?,
  ~groupSummary: bool=?,
  ~ignoreInForeground: bool=?,
  ~importance: [#default | #max | #high | #low | #min | #none | #unspecified]=?,
  ~invokeApp: bool=?,
  ~largeIcon: string=?,
  ~largeIconUrl: string=?,
  ~messageId: string=?,
  ~ongoing: bool=?,
  ~onlyAlertOnce: bool=?,
  ~priority: [#max | #high | #low | #min | #default]=?,
  ~repeatTime: float=?,
  ~shortcutId: string=?,
  ~showWhen: bool=?,
  ~smallIcon: string=?,
  ~subText: string=?,
  ~tag: string=?,
  ~ticker: string=?,
  ~vibrate: bool=?,
  ~vibration: float=?,
  ~visibility: [#private_ | #public | #secret]=?,
  ~alertAction: /* iOS only properties */
  string=?,
  ~category: string=?,
  unit,
) => localNotificationScheduleOptions = ""

@bs.module("react-native-push-notification")
external localNotificationSchedule: localNotificationScheduleOptions => unit =
  "localNotificationSchedule"

@bs.module("react-native-push-notification")
external popInitialNotification: notification<'data, 'alert> => unit = "popInitialNotification"

type channel = {
  channelId: string,
  channelName: string,
  channelDescription: option<string>,
  soundName: option<string>,
  importance: option<int>,
  vibrate: option<bool>,
}

@bs.obj
external channel: (
  ~channelId: string,
  ~channelName: string,
  ~channelDescription: string=?,
  ~soundName: string=?,
  ~importance: int=?,
  ~vibrate: bool=?,
  unit,
) => channel = ""

@bs.module("react-native-push-notification")
external getChannels: (array<string> => unit) => unit = "getChannels"
@bs.module("react-native-push-notification")
external channelExists: (string, bool => unit) => unit = "channelExists"
@bs.module("react-native-push-notification")
external createChannel: channel => unit = "createChannel"
external createChannelWithCallback: (channel, bool => unit) => unit = "createChannel"
@bs.module("react-native-push-notification")
external channelBlocked: (string, bool => unit) => unit = "channelBlocked"
@bs.module("react-native-push-notification")
external deleteChannel: string => unit = "deleteChannel"

@bs.module("react-native-push-notification")
external cancelAllLocalNotifications: unit => unit = "cancelAllLocalNotifications"
@bs.module("react-native-push-notification")
external removeAllDeliveredNotifications: unit => unit = "removeAllDeliveredNotifications"

type deliveredNotification = {
  identifier: string,
  title: string,
  body: string,
  tag: string,
  group: string,
}
@bs.module("react-native-push-notification")
external getDeliveredNotifications: (array<deliveredNotification> => unit) => unit =
  "getDeliveredNotifications"

type scheduledNotification = {
  id: int,
  date: Js.Date.t,
  title: string,
  body: string,
  soundName: string,
  repeatInterval: int,
  number: int,
}
@bs.module("react-native-push-notification")
external getScheduledLocalNotifications: (array<scheduledNotification> => unit) => unit =
  "getScheduledLocalNotifications"

@bs.module("react-native-push-notification")
external removeDeliveredNotifications: array<string> => unit = "removeDeliveredNotifications"

@bs.module("react-native-push-notification")
external cancelLocalNotifications: 'userInfo => unit = "cancelLocalNotifications"

@bs.module("react-native-push-notification")
external clearLocalNotification: (string, int) => unit = "clearLocalNotification"
@bs.module("react-native-push-notification")
external clearAllNotifications: unit => unit = "clearAllNotifications"

// [@bs.module "react-native-push-notification"] external unregister :unit => unit = "unregister";
// [@bs.module "react-native-push-notification"] external requestPermissions :(
//     permissions?: Array<"alert" | "badge" | "sound">
// )=> Promise<PushNotificationPermissions> = "requestPermissions",
// [@bs.module "react-native-push-notification"] external subscribeToTopic:(topic: string)=> unit = "subscribeToTopic";
// [@bs.module "react-native-push-notification"] external unsubscribeFromTopic:(topic: string)=> unit = "unsubscribeFromTopic";
// [@bs.module "react-native-push-notification"] external presentLocalNotification:(notification: PushNotificationObject)=> unit = "presentLocalNotification";
// [@bs.module "react-native-push-notification"] external scheduleLocalNotification:(notification: PushNotificationScheduleObject)=> unit = "scheduleLocalNotification";

@bs.module("react-native-push-notification")
external setApplicationIconBadgeNumber: int => unit = "setApplicationIconBadgeNumber"
@bs.module("react-native-push-notification")
external getApplicationIconBadgeNumber: (int => unit) => unit = "getApplicationIconBadgeNumber"

// [@bs.module "react-native-push-notification"] external abandonPermissions:unit => unit = "abandonPermissions";
// [@bs.module "react-native-push-notification"] external checkPermissions:(
//     callback: (permissions: PushNotificationPermissions) => unit
// )=> unit = "checkPermissions";

// [@bs.module "react-native-push-notification"] external invokeApp:(notification: PushNotificationObject)=> unit ="invokeApp";
