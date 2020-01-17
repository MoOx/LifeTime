open Belt;

// Js.t for easy stringify for AsyncStorage

type t = {
  .
  "theme": string,
  "lastUpdated": float,
  "calendarsIdsSkipped": array(string),
  "activities": array(Activities.t),
  "activitiesSkipped": array(string),
  "activitiesSkippedFlag": bool,
  "goals": array(Goal.t),
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
  "theme": "auto",
  "lastUpdated": 0.,
  "calendarsIdsSkipped": [||],
  "activitiesSkippedFlag": true,
  "activitiesSkipped": [||],
  "activities": [||], // @todo add some defaults?
  "goals": [||],
};

let decodeJsonSettings = (json: Js.Json.t): t => {
  Json.Decode.{
    "theme": json |> field("theme", string),
    "lastUpdated": json |> field("lastUpdated", Json.Decode.float),
    "calendarsIdsSkipped":
      json |> field("calendarsIdsSkipped", array(string)),
    "activitiesSkippedFlag": json |> field("activitiesSkippedFlag", bool),
    "activitiesSkipped": json |> field("activitiesSkipped", array(string)),
    "activities":
      json
      |> field(
           "activities",
           array(json =>
             {
               "id":
                 try (json |> field("id", string)) {
                 | _ =>
                   Utils.makeId(
                     json |> field("title", string),
                     json |> field("createdAt", Json.Decode.float),
                   )
                 },
               "title": json |> field("title", string),
               "createdAt": json |> field("createdAt", Json.Decode.float),
               "categoryId": json |> field("categoryId", string),
             }
           ),
         ),
    "goals":
      try (
        json
        |> field(
             "goals",
             array(json =>
               {
                 "id": json |> field("id", string),
                 "title": json |> field("title", string),
                 "createdAt": json |> field("createdAt", Json.Decode.float),
                 "type_": json |> field("type_", int),
                 "days": json |> field("days", array(bool)),
                 "durationPerWeek":
                   json |> field("durationPerWeek", Json.Decode.float),
                 "categoriesId":
                   json |> field("categoriesId", array(string)),
                 "activitiesId":
                   json |> field("activitiesId", array(string)),
               }
             ),
           )
      ) {
      | _ => [||]
      },
  };
};

let storageKey = "settings";

let useSettings = () => {
  let (settings, set) = React.useState(() => defaultSettings);
  React.useEffect1(
    () => {
      ReactNativeAsyncStorage.getItem(storageKey)
      ->FutureJs.fromPromise(error => {
          // @todo ?
          Js.log2("LifeTime: useSettings: ", error);
          error;
        })
      ->Future.tapOk(res =>
          set(_
            // Js.log2(storageKey ++ " raw result", res);
            =>
              res
              ->Js.Null.toOption
              ->Option.map(rawJson =>
                  try (rawJson->Json.parseOrRaise->decodeJsonSettings) {
                  | _ =>
                    Js.log2(
                      "LifeTime: useSettings: unable to decode valid json",
                      rawJson,
                    );
                    defaultSettings;
                  }
                )
              ->Option.getWithDefault(defaultSettings)
            )
        )
      ->ignore;
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

type setSet = t => t;
let defaultContext: (t, setSet => unit) = (defaultSettings, _ => ());
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
  settings##theme->themeStringToTheme;
};
