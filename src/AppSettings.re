open Belt;

type calendarSkipped = {
  id: string,
  title: string,
  color: string,
  source: string,
};

type t = {
  theme: string,
  lastUpdated: float,
  calendarsSkipped: array(calendarSkipped),
  activities: array(Activities.t),
  activitiesSkipped: array(string),
  activitiesSkippedFlag: bool,
  goals: array(Goal.t),
};

let themeToThemeString =
  fun
  | `light => "light"
  | `dark => "dark"
  // | `auto => "auto"
  | _ => "auto";

let themeStringToTheme =
  fun
  | "light" => `light
  | "dark" => `dark
  // | "auto" =>`auto
  | _ => `auto;

let defaultSettings = {
  theme: "auto",
  lastUpdated: 0.,
  calendarsSkipped: [||],
  activitiesSkippedFlag: true,
  activitiesSkipped: [||],
  activities: [||], // @todo add some defaults?
  goals: [||],
};

let decodeJsonSettingsOrRaise = (json: Js.Json.t): t =>
  Json.Decode.{
    theme: json |> field("theme", string),
    lastUpdated: json |> field("lastUpdated", Json.Decode.float),
    calendarsSkipped:
      json
      |> field(
           "calendarsSkipped",
           array(json =>
             {
               id: json |> field("id", string),
               title: json |> field("title", string),
               source: json |> field("source", string),
               color: json |> field("color", string),
             }
           ),
         ),
    activitiesSkippedFlag: json |> field("activitiesSkippedFlag", bool),
    activitiesSkipped: json |> field("activitiesSkipped", array(string)),
    activities:
      json
      |> field(
           "activities",
           array((json) =>
             (
               {
                 id: json |> field("id", string),
                 title: json |> field("title", string),
                 createdAt: json |> field("createdAt", Json.Decode.float),
                 categoryId: json |> field("categoryId", string),
               }: Activities.t
             )
           ),
         ),
    goals:
      try(
        json
        |> field(
             "goals",
             array((json) =>
               (
                 {
                   id: json |> field("id", string),
                   title: json |> field("title", string),
                   createdAt: json |> field("createdAt", Json.Decode.float),
                   type_: json |> field("type_", int),
                   days: json |> field("days", array(bool)),
                   durationPerDay:
                     json |> field("durationPerDay", Json.Decode.float),
                   categoriesId:
                     json |> field("categoriesId", array(string)),
                   activitiesId:
                     json |> field("activitiesId", array(string)),
                 }: Goal.t
               )
             ),
           )
      ) {
      | _ => [||]
      },
  };
let decodeJsonSettings = (json: Js.Json.t): Future.t(Result.t(t, string)) => {
  ReactNativeCalendarEvents.findCalendars()
  ->FutureJs.fromPromise(error => {
      // @todo error
      Js.log2("ReactNativeCalendarEvents.findCalendars", error);
      "Unable to retrieve calendars before parsing settings";
    })
  ->Future.flatMapOk(calendars => {
      (
        try(Ok(json->decodeJsonSettingsOrRaise)) {
        | Json.Decode.DecodeError(_exn) =>
          Js.log(_exn);
          Error("Ooops! Something went wrong when loading settings");
        }
      )
      ->Result.map(settings =>
          {
            theme: settings.theme,
            lastUpdated: settings.lastUpdated,
            // ensure calendars ids are valid and reconciliate otherwise
            calendarsSkipped:
              settings.calendarsSkipped
              ->Array.reduce(
                  [||],
                  (calendarsToSkip, calendarSkipped) => {
                    let calMatches =
                      calendars->Array.keep(calendar =>
                        calendar.id === calendarSkipped.id
                        || calendar.title == calendarSkipped.title
                        && calendar.color == calendarSkipped.color
                      );
                    // source can have a different name on each device
                    // (eg a device with multiple icloud account vs a device with one)
                    // && calendar.source == calendarSkipped.source
                    calendarsToSkip->Array.concat(calMatches);
                  },
                )
              ->Array.map(cal =>
                  {
                    id: cal.id,
                    title: cal.title,
                    source: cal.source,
                    color: cal.color,
                  }
                ),
            activities: settings.activities,
            activitiesSkipped: settings.activitiesSkipped,
            activitiesSkippedFlag: settings.activitiesSkippedFlag,
            goals: settings.goals,
          }
        )
      ->Future.value
    });
};

let storageKey = "settings";

let getSettings = () => {
  ReactNativeAsyncStorage.getItem(storageKey)
  ->FutureJs.fromPromise(error => {
      // @todo error
      Js.log2("LifeTime: useSettings: ", error);
      "Unable to access settings from device";
    })
  ->Future.flatMapOk(res => {
      res
      ->Js.Null.toOption
      ->Option.map(jsonString =>
          try(jsonString->Json.parseOrRaise->decodeJsonSettings) {
          | Json.ParseError(_) =>
            Future.value(Result.Error("Unable to parse json settings"))
          }
        )
      ->Option.getWithDefault(Future.value(Ok(defaultSettings)))
    })
  ->Future.map(
      fun
      | Ok(settings) => settings
      | Error(err) => {
          Js.log(err);
          defaultSettings;
        },
    );
};

let useSettings = () => {
  let (settings, set) = React.useState(() => defaultSettings);
  React.useEffect1(
    () => {
      getSettings()->Future.tap(settings => set(_ => settings))->ignore;
      None;
    },
    [|set|],
  );
  React.useEffect1(
    () => {
      if (settings != defaultSettings) {
        settings
        ->Js.Json.stringifyAny
        ->Option.map(stringifiedSettings =>
            ReactNativeAsyncStorage.setItem(storageKey, stringifiedSettings)
          )
        ->ignore;
        // if (ReactNative.Global.__DEV__) {
        //   Js.log2(
        //     "Settings",
        //     settings->Obj.magic->Js.Json.stringifyWithSpace(2),
        //   );
        // };
      };
      None;
    },
    [|settings|],
  );
  (settings, set);
};

type setSettingsT = t => t;
let defaultContext: (t, setSettingsT => unit) = (defaultSettings, _ => ());
let context = React.createContext(defaultContext);

module ContextProvider = {
  let makeProps = (~value, ~children, ()) => {
    "value": value,
    "children": children,
  };
  let make = React.Context.provider(context);
};

let useTheme = () => {
  let (settings, _setSettings) = React.useContext(context);
  settings.theme->themeStringToTheme;
};
