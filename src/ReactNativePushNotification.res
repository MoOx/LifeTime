type permissions = {
  alert: option<bool>,
  badge: option<bool>,
  sound: option<bool>,
}
@obj
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
@obj
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

@module("react-native-push-notification")
external configure: configureOptions => unit = "configure"

type localNotificationOptions
@obj
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

@module("react-native-push-notification")
external localNotification: localNotificationOptions => unit = "localNotification"

type localNotificationScheduleOptions
@obj
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

@module("react-native-push-notification")
external localNotificationSchedule: localNotificationScheduleOptions => unit =
  "localNotificationSchedule"

@module("react-native-push-notification")
external popInitialNotification: notification<'data, 'alert> => unit = "popInitialNotification"

type channel = {
  channelId: string,
  channelName: string,
  channelDescription: option<string>,
  soundName: option<string>,
  importance: option<int>,
  vibrate: option<bool>,
}

@obj
external channel: (
  ~channelId: string,
  ~channelName: string,
  ~channelDescription: string=?,
  ~soundName: string=?,
  ~importance: int=?,
  ~vibrate: bool=?,
  unit,
) => channel = ""

@module("react-native-push-notification")
external getChannels: (array<string> => unit) => unit = "getChannels"
@module("react-native-push-notification")
external channelExists: (string, bool => unit) => unit = "channelExists"
@module("react-native-push-notification")
external createChannel: channel => unit = "createChannel"
external createChannelWithCallback: (channel, bool => unit) => unit = "createChannel"
@module("react-native-push-notification")
external channelBlocked: (string, bool => unit) => unit = "channelBlocked"
@module("react-native-push-notification")
external deleteChannel: string => unit = "deleteChannel"

@module("react-native-push-notification")
external cancelAllLocalNotifications: unit => unit = "cancelAllLocalNotifications"
@module("react-native-push-notification")
external removeAllDeliveredNotifications: unit => unit = "removeAllDeliveredNotifications"

type deliveredNotification = {
  identifier: string,
  title: string,
  body: string,
  tag: string,
  group: string,
}
@module("react-native-push-notification")
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
@module("react-native-push-notification")
external getScheduledLocalNotifications: (array<scheduledNotification> => unit) => unit =
  "getScheduledLocalNotifications"

@module("react-native-push-notification")
external removeDeliveredNotifications: array<string> => unit = "removeDeliveredNotifications"

@module("react-native-push-notification")
external cancelLocalNotifications: 'userInfo => unit = "cancelLocalNotifications"

@module("react-native-push-notification")
external clearLocalNotification: (string, int) => unit = "clearLocalNotification"
@module("react-native-push-notification")
external clearAllNotifications: unit => unit = "clearAllNotifications"

// [@module "react-native-push-notification"] external unregister :unit => unit = "unregister";
// [@module "react-native-push-notification"] external requestPermissions :(
//     permissions?: Array<"alert" | "badge" | "sound">
// )=> Promise<PushNotificationPermissions> = "requestPermissions",
// [@module "react-native-push-notification"] external subscribeToTopic:(topic: string)=> unit = "subscribeToTopic";
// [@module "react-native-push-notification"] external unsubscribeFromTopic:(topic: string)=> unit = "unsubscribeFromTopic";
// [@module "react-native-push-notification"] external presentLocalNotification:(notification: PushNotificationObject)=> unit = "presentLocalNotification";
// [@module "react-native-push-notification"] external scheduleLocalNotification:(notification: PushNotificationScheduleObject)=> unit = "scheduleLocalNotification";

@module("react-native-push-notification")
external setApplicationIconBadgeNumber: int => unit = "setApplicationIconBadgeNumber"
@module("react-native-push-notification")
external getApplicationIconBadgeNumber: (int => unit) => unit = "getApplicationIconBadgeNumber"

// [@module "react-native-push-notification"] external abandonPermissions:unit => unit = "abandonPermissions";
// [@module "react-native-push-notification"] external checkPermissions:(
//     callback: (permissions: PushNotificationPermissions) => unit
// )=> unit = "checkPermissions";

// [@module "react-native-push-notification"] external invokeApp:(notification: PushNotificationObject)=> unit ="invokeApp";
