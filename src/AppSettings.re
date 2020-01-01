open Belt;

// Js.t for easy stringify for AsyncStorage
type settings = {
  .
  "theme": string,
  "lastUpdated": float,
  "calendarsIdsSkipped": array(string),
  "eventsSkippedOn": bool,
  "eventsSkipped": array(string),
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
  "eventsSkippedOn": true,
  "eventsSkipped": [||],
};

let decodeJsonSettings = (json: Js.Json.t): settings => {
  switch (Js.Json.classify(json)) {
  | Js.Json.JSONObject(settings) => {
      "theme":
        settings
        ->Js.Dict.get("theme")
        ->Option.map(json =>
            switch (json->Js.Json.classify) {
            | Js.Json.JSONString(theme) =>
              // force theme to be valid
              theme->themeStringToTheme->themeToThemeString
            | _ =>
              Js.log("LifeTime: decodeJsonSettings: unable to decode theme");
              "auto";
            }
          )
        ->Option.getWithDefault("auto"),
      "lastUpdated":
        settings
        ->Js.Dict.get("lastUpdated")
        ->Option.map(json =>
            switch (json->Js.Json.classify) {
            | Js.Json.JSONNumber(lastUpdated) => lastUpdated
            | _ =>
              Js.log(
                "LifeTime: decodeJsonSettings: unable to decode lastUpdated",
              );
              2.;
            }
          )
        ->Option.getWithDefault(1.),
      "calendarsIdsSkipped":
        settings
        ->Js.Dict.get("calendarsIdsSkipped")
        ->Option.map(json =>
            switch (Js.Json.classify(json)) {
            | Js.Json.JSONArray(ids) =>
              ids->Array.keepMap(jsonId =>
                switch (Js.Json.classify(jsonId)) {
                | Js.Json.JSONString(id) => Some(id)
                | _ =>
                  failwith(
                    "LifeTime: decodeJsonSettings: unable to decode string calendarsIdsSkipped id",
                  )
                }
              )
            | _ =>
              failwith(
                "LifeTime: decodeJsonSettings: unable to decode calendarsIdsSkipped array",
              )
            }
          )
        ->Option.getWithDefault(defaultSettings##calendarsIdsSkipped),
      "eventsSkippedOn":
        settings
        ->Js.Dict.get("eventsSkippedOn")
        ->Option.map(json =>
            switch (json->Js.Json.classify) {
            | Js.Json.JSONTrue => true
            | Js.Json.JSONFalse => false
            | _ =>
              Js.log(
                "LifeTime: decodeJsonSettings: unable to decode eventsSkippedOn",
              );
              false;
            }
          )
        ->Option.getWithDefault(false),
      "eventsSkipped":
        settings
        ->Js.Dict.get("eventsSkipped")
        ->Option.map(json =>
            switch (Js.Json.classify(json)) {
            | Js.Json.JSONArray(ids) =>
              ids->Array.keepMap(jsonId =>
                switch (Js.Json.classify(jsonId)) {
                | Js.Json.JSONString(id) => Some(id)
                | _ =>
                  failwith(
                    "LifeTime: decodeJsonSettings: unable to decode string eventsSkipped id",
                  )
                }
              )
            | _ =>
              failwith(
                "LifeTime: decodeJsonSettings: unable to decode eventsSkipped array",
              )
            }
          )
        ->Option.getWithDefault(defaultSettings##eventsSkipped),
    }
  | _ => failwith("LifeTime: decodeJsonSettings: unable to decode settings")
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
                  try (rawJson->Js.Json.parseExn->decodeJsonSettings) {
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
      };
      None;
    },
    [|settings|],
  );
  (settings, set);
};

type setSet = settings => settings;
let defaultContext: (settings, setSet => unit) = (defaultSettings, _ => ());
let context = React.createContext(defaultContext);

module ContextProvider = {
  let makeProps = (~value, ~children, ()) => {
    "value": value,
    "children": children,
  };
  let make = React.Context.provider(context);
};
