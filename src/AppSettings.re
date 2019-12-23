open Belt;

type topActivities = {minimumDuration: float};

type filters = {
  calendarsIdsSkipped: array(string),
  // allDay: bool,
  // topActivities,
};

type settings = {
  lastUpdated: float,
  filters,
};

// @todo bs7 remove this & use non "Json"
type filtersJson = {
  .
  "calendarsIdsSkipped": array(string),
  // allDay: bool,
  // topActivities,
};
type settingsJson = {
  .
  "lastUpdated": float,
  "filters": filtersJson,
};

let defaultSettings = {
  lastUpdated: 0.,
  filters: {
    calendarsIdsSkipped: [||],
  },
};

let decodeFilteredCalendarsIds = json =>
  switch (Js.Json.classify(json)) {
  | Js.Json.JSONArray(ids) =>
    ids->Array.keepMap(jsonId =>
      switch (Js.Json.classify(jsonId)) {
      | Js.Json.JSONString(id) => Some(id)
      | _ =>
        failwith(
          "LifeTime: decodeFilteredCalendarsIds: unable to decode string id",
        )
      }
    )
  | _ =>
    failwith("LifeTime: decodeFilteredCalendarsIds: unable to decode array")
  };

let decodeJsonSettings = (json: Js.Json.t) => {
  switch (Js.Json.classify(json)) {
  | Js.Json.JSONObject(settings) =>
    settings
    ->Js.Dict.get("filters")
    ->Option.map(jsonFilters =>
        switch (Js.Json.classify(jsonFilters)) {
        | Js.Json.JSONObject(filters) => {
            lastUpdated:
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
            filters: {
              calendarsIdsSkipped:
                filters
                ->Js.Dict.get("calendarsIdsSkipped")
                ->Option.map(json => json->decodeFilteredCalendarsIds)
                ->Option.getWithDefault(
                    defaultSettings.filters.calendarsIdsSkipped,
                  ),
            },
          }
        | _ =>
          failwith("LifeTime: decodeJsonSettings: unable to decode filters")
        }
      )
    ->Option.getWithDefault(defaultSettings)
  | _ => failwith("LifeTime: decodeJsonSettings: unable to decode settings")
  };
};

let decodeSettings: string => settings =
  rawJson =>
    try (rawJson->Js.Json.parseExn->decodeJsonSettings) {
    | _ =>
      Js.log2("LifeTime: useSettings: unable to decode valid json", rawJson);
      defaultSettings;
    };

let storageKey = "settings";

let useSettings = updater => {
  let (settings, set) = React.useState(() => defaultSettings);
  React.useEffect2(
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
              ->Option.map(decodeSettings)
              ->Option.getWithDefault(defaultSettings)
            )
        )
      ->ignore;
      None;
    },
    (set, updater),
  );
  React.useEffect1(
    () => {
      if (settings != defaultSettings) {
        // @todo bs 7 remove the transfo
        let settingsJson: settingsJson = {
          "lastUpdated": settings.lastUpdated,
          "filters": {
            "calendarsIdsSkipped": settings.filters.calendarsIdsSkipped,
          },
        };
        Js.log2("settingsJson", settingsJson);
        settingsJson
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
