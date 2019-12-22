// Android permissions

type permission;

module Android = {
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external accept_handover: permission = "ACCEPT_HANDOVER";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external access_background_location: permission =
    "ACCESS_BACKGROUND_LOCATION";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external access_coarse_location: permission = "ACCESS_COARSE_LOCATION";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external access_fine_location: permission = "ACCESS_FINE_LOCATION";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external activity_recognition: permission = "ACTIVITY_RECOGNITION";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external add_voicemail: permission = "ADD_VOICEMAIL";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external answer_phone_calls: permission = "ANSWER_PHONE_CALLS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external body_sensors: permission = "BODY_SENSORS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external call_phone: permission = "CALL_PHONE";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external camera: permission = "CAMERA";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external get_accounts: permission = "GET_ACCOUNTS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external process_outgoing_calls: permission = "PROCESS_OUTGOING_CALLS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external read_calendar: permission = "READ_CALENDAR";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external read_call_log: permission = "READ_CALL_LOG";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external read_contacts: permission = "READ_CONTACTS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external read_external_storage: permission = "READ_EXTERNAL_STORAGE";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external read_phone_numbers: permission = "READ_PHONE_NUMBERS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external read_phone_state: permission = "READ_PHONE_STATE";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external read_sms: permission = "READ_SMS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external receive_mms: permission = "RECEIVE_MMS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external receive_sms: permission = "RECEIVE_SMS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external receive_wap_push: permission = "RECEIVE_WAP_PUSH";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external record_audio: permission = "RECORD_AUDIO";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external send_sms: permission = "SEND_SMS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external use_sip: permission = "USE_SIP";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external write_calendar: permission = "WRITE_CALENDAR";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external write_call_log: permission = "WRITE_CALL_LOG";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external write_contacts: permission = "WRITE_CONTACTS";
  [@bs.module "react-native-permissions"]
  [@bs.scope ("PERMISSIONS", "ANDROID")]
  external write_external_storage: permission = "WRITE_EXTERNAL_STORAGE";
};

// iOS permissions
module Ios = {
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external bluetooth_peripheral: permission = "BLUETOOTH_PERIPHERAL";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external calendars: permission = "CALENDARS";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external camera: permission = "CAMERA";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external contacts: permission = "CONTACTS";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external face_id: permission = "FACE_ID";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external location_always: permission = "LOCATION_ALWAYS";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external location_when_in_use: permission = "LOCATION_WHEN_IN_USE";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external media_library: permission = "MEDIA_LIBRARY";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external microphone: permission = "MICROPHONE";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external motion: permission = "MOTION";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external photo_library: permission = "PHOTO_LIBRARY";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external reminders: permission = "REMINDERS";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external siri: permission = "SIRI";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external speech_recognition: permission = "SPEECH_RECOGNITION";
  [@bs.module "react-native-permissions"] [@bs.scope ("PERMISSIONS", "IOS")]
  external storekit: permission = "STOREKIT";
};

type permissionStatus;

/* This feature is not available (on this device / in this context) */
[@bs.module "react-native-permissions"] [@bs.scope "RESULTS"]
external unavailable: permissionStatus = "UNAVAILABLE";

/* The permission has not been requested / is denied but requestable */
[@bs.module "react-native-permissions"] [@bs.scope "RESULTS"]
external denied: permissionStatus = "DENIED";

/* The permission is granted */
[@bs.module "react-native-permissions"] [@bs.scope "RESULTS"]
external granted: permissionStatus = "GRANTED";

/* The permission is denied and not requestable anymore */
[@bs.module "react-native-permissions"] [@bs.scope "RESULTS"]
external blocked: permissionStatus = "BLOCKED";

// methods

[@bs.module "react-native-permissions"]
external check: permission => Js.Promise.t(permissionStatus) = "check";

type requestRationale = {
  .
  "title": string,
  "message": string,
  "buttonPositive": option(string),
  "buttonNegative": option(string),
  "buttonNeutral": option(string),
};

[@bs.module "react-native-permissions"]
external request: permission => Js.Promise.t(permissionStatus) = "request";

[@bs.module "react-native-permissions"]
external requestWithRational:
  (permission, requestRationale) => Js.Promise.t(permissionStatus) =
  "request";

type notificationSettings = {
  .
  // properties only availables on iOS
  // unavailable settings will not be included in the response object
  "alert": option(bool),
  "badge": option(bool),
  "sound": option(bool),
  "lockScreen": option(bool),
  "carPlay": option(bool),
  "notificationCenter": option(bool),
  "criticalAlert": option(bool),
};

[@bs.module "react-native-permissions"]
external checkNotifications:
  unit =>
  Js.Promise.t({
    .
    "status": permissionStatus,
    "settings": notificationSettings,
  }) =
  "checkNotifications";

// only used on iOS
type notificationOption =
  [@bs.string] [
    | `alert
    | `badge
    | `sound
    | `criticalAlert
    | `carPlay
    | `provisional
  ];

[@bs.module "react-native-permissions"]
external requestNotifications:
  array(notificationOption) =>
  Js.Promise.t({
    .
    "status": permissionStatus,
    "settings": notificationSettings,
  }) =
  "requestNotifications";

[@bs.module "react-native-permissions"]
external openSettings: unit => Js.Promise.t(unit) = "openSettings";
