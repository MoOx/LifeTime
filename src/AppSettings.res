open Belt

type calendarSkipped = {
  id: string,
  title: string,
  color: string,
  source: string,
}

type t = {
  theme: string,
  lastUpdated: float,
  notificationsPermissionsDismissed: float,
  notificationsRecurrentRemindersOn: bool,
  // https://stackoverflow.com/questions/1548031/data-structure-for-storing-recurring-events
  // array of reminders that are an array of int (for now, minutes and hours)
  notificationsRecurrentReminders: array<array<option<int>>>,
  calendarsSkipped: array<calendarSkipped>,
  activities: array<Activities.t>,
  activitiesSkipped: array<string>,
  activitiesSkippedFlag: bool,
  goals: array<Goal.t>,
}

let themeToThemeString = x =>
  switch x {
  | #light => "light"
  | #dark => "dark"
  // | `auto => "auto"
  | _ => "auto"
  }

let themeStringToTheme = x =>
  switch x {
  | "light" => #light
  | "dark" => #dark
  // | "auto" =>`auto
  | _ => #auto
  }

let defaultSettings = {
  theme: "auto",
  lastUpdated: 0.,
  notificationsPermissionsDismissed: 0.,
  notificationsRecurrentRemindersOn: true,
  notificationsRecurrentReminders: [[Some(0), Some(9)]],
  calendarsSkipped: [],
  activitiesSkippedFlag: true,
  activitiesSkipped: [],
  activities: [], // @todo add some defaults?
  goals: [],
}

let decodeJsonSettingsOrRaise = (json: Js.Json.t): t => {
  open Json.Decode
  {
    theme: json |> field("theme", string),
    lastUpdated: json |> field("lastUpdated", Json.Decode.float),
    notificationsPermissionsDismissed: try json |> field(
      "notificationsPermissionsDismissed",
      Json.Decode.float,
    ) catch {
    | _ => defaultSettings.notificationsPermissionsDismissed
    },
    notificationsRecurrentRemindersOn: try json |> field(
      "notificationsRecurrentRemindersOn",
      bool,
    ) catch {
    | _ => defaultSettings.notificationsRecurrentRemindersOn
    },
    notificationsRecurrentReminders: try json |> field(
      "notificationsRecurrentReminders",
      array(array(optional(int))),
    ) catch {
    | _ => defaultSettings.notificationsRecurrentReminders
    },
    calendarsSkipped: json |> field(
      "calendarsSkipped",
      array(json => {
        id: json |> field("id", string),
        title: json |> field("title", string),
        source: json |> field("source", string),
        color: json |> field("color", string),
      }),
    ),
    activitiesSkippedFlag: json |> field("activitiesSkippedFlag", bool),
    activitiesSkipped: json |> field("activitiesSkipped", array(string)),
    activities: json |> field(
      "activities",
      array((json): Activities.t => {
        id: json |> field("id", string),
        title: json |> field("title", string),
        createdAt: json |> field("createdAt", Json.Decode.float),
        categoryId: json |> field("categoryId", string),
      }),
    ),
    goals: try json |> field(
      "goals",
      array((json): Goal.t => {
        id: json |> field("id", string),
        title: json |> field("title", string),
        createdAt: json |> field("createdAt", Json.Decode.float),
        type_: json |> field("type_", int),
        days: json |> field("days", array(bool)),
        durationPerDay: json |> field("durationPerDay", Json.Decode.float),
        categoriesId: json |> field("categoriesId", array(string)),
        activitiesId: json |> field("activitiesId", array(string)),
      }),
    ) catch {
    | _ => []
    },
  }
}
let decodeJsonSettings = (json: Js.Json.t): Future.t<Result.t<t, string>> =>
  ReactNativeCalendarEvents.findCalendars()
  ->FutureJs.fromPromise(error => {
    // @todo error
    Log.info(("AppSettings: ReactNativeCalendarEvents.findCalendars error", error))
    "Unable to retrieve calendars before parsing settings"
  })
  ->Future.flatMap(calendarsResult =>
    try Ok(json->decodeJsonSettingsOrRaise) catch {
    | Json.Decode.DecodeError(_exn) =>
      Log.info(("AppSettings: decodeJsonSettingsOrRaise", _exn))
      Error("Ooops! Something went wrong when loading settings")
    }
    ->Result.map(settings => {
      ...settings,
      calendarsSkipped: switch calendarsResult {
      // in case we cannot read calendar (eg: permission removed?)
      // we just pass the value along
      | Error(err) =>
        Log.error(("AppSettings: calendars results error", err))
        settings.calendarsSkipped
      // ensure calendars ids are valid and reconciliate otherwise
      | Ok(calendars) =>
        settings.calendarsSkipped
        ->Array.reduce([], (calendarsToSkip, calendarSkipped) => {
          let calMatches =
            calendars->Array.keep(calendar =>
              calendar.id === calendarSkipped.id ||
                (calendar.title == calendarSkipped.title && calendar.color == calendarSkipped.color)
            )
          // source can have a different name on each device
          // (eg a device with multiple icloud account vs a device with one)
          // && calendar.source == calendarSkipped.source
          calendarsToSkip->Array.concat(calMatches)
        })
        ->Array.map(cal => {
          id: cal.id,
          title: cal.title,
          source: cal.source,
          color: cal.color,
        })
      },
    })
    ->Future.value
  )

let storageKey = "settings"

let getSettings = () =>
  ReactNativeAsyncStorage.getItem(storageKey)
  ->FutureJs.fromPromise(error => {
    // @todo error
    Log.info(("AppSettings: getSettings", error))
    "Unable to access settings from device"
  })
  ->Future.flatMapOk(res =>
    res
    ->Js.Null.toOption
    ->Option.map(jsonString =>
      try jsonString->Json.parseOrRaise->decodeJsonSettings catch {
      | Json.ParseError(_) => Future.value(Result.Error("Unable to parse json settings"))
      }
    )
    ->Option.getWithDefault(Future.value(Ok(defaultSettings)))
  )
  ->Future.map(x =>
    switch x {
    | Ok(settings) => settings
    | Error(err) =>
      Log.info(("AppSettings: getSettings", err))
      defaultSettings
    }
  )

let setSettings = settings =>
  if settings != defaultSettings {
    settings
    ->Js.Json.stringifyAny
    ->Option.map(stringifiedSettings => {
      ReactNativeAsyncStorage.setItem(storageKey, stringifiedSettings)->ignore
      Log.info("App: settings updated")
    })
    ->ignore
    // if (ReactNative.Global.__DEV__) {
    //   Log.info((
    //     "AppSettings: Settings set to",
    //     settings,
    //     settings->Obj.magic->Js.Json.stringifyWithSpace(2),
    //   ));
    // };
  }

type setSettingsT = t => t
let defaultContext: (t, setSettingsT => unit) = (defaultSettings, _ => ())
let context = React.createContext(defaultContext)

module ContextProvider = {
  let makeProps = (~value, ~children, ()) =>
    {
      "value": value,
      "children": children,
    }
  let make = React.Context.provider(context)
}

let useTheme = () => {
  let (settings, _setSettings) = React.useContext(context)
  settings.theme->themeStringToTheme
}
