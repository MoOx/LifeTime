open Belt;

let simplifyEventTitleForComparison = e => e->Js.String.toLowerCase;

module Categories = {
  type id = string;
  type name = string;
  type color = string;
  type icon = NamedIcon.t;

  type cat = (id, name, color, icon);

  let unknown: id = "unknown";
  let unknownCat: cat = (unknown, "Uncategorized", "gray", `bookmark);
  let defaults: list(cat) = [
    ("rest", "Rest", "indigo", `moonsymbol),
    ("food", "Nutrition", "green", `carrot),
    ("exercise", "Exercise", "pink", `workout),
    ("work", "Work", "blue", `edit),
    ("social", "Social", "orange", `social),
    ("self", "Self-care", "teal", `meditation),
    ("fun", "Entertainment", "purple", `theatremask),
    ("chores", "Chores", "yellow", `broom),
    // ("misc", "Miscellaneous", "yellow", `tag),
    unknownCat,
  ];

  let getColor: (Theme.t, color) => string =
    theme => {
      let t = Theme.themedColors(theme);
      fun
      | "red" => t.red
      | "orange" => t.orange
      | "yellow" => t.yellow
      | "green" => t.green
      | "indigo" => t.indigo
      | "teal" => t.teal
      | "purple" => t.purple
      | "pink" => t.pink
      | "blue" => t.blue
      | _ => t.gray4;
    };

  let getFromId: id => cat =
    cid =>
      defaults
      ->List.keepMap(((id, name, color, icon)) =>
          id == cid ? Some((id, name, color, icon)) : None
        )
      ->List.head
      ->Option.getWithDefault(unknownCat);
};

let isCategoryIdValid = cid =>
  Categories.defaults->List.some(((id, _, _, _)) => id == cid);

let categoryIdFromEventTitle = (settings, eventTitle) => {
  let (_, cId) =
    settings##activitiesCategories
    ->Array.keep(((e, c)) =>
        e->simplifyEventTitleForComparison
        == eventTitle->simplifyEventTitleForComparison
        && c->isCategoryIdValid
      )[0]
    ->Option.getWithDefault(("", Categories.unknown));
  cId;
};

let sort = calendars =>
  calendars->SortArray.stableSortBy((a, b) =>
    a##title > b##title ? 1 : a##title < b##title ? (-1) : 0
  );

let availableCalendars = (calendars, settings: AppSettings.settings) =>
  calendars
  ->Array.keep(c =>
      !settings##calendarsIdsSkipped->Array.some(cs => cs == c##id)
    )
  ->Array.map(c => c##id);

let useCalendars = updater => {
  let (value, set) = React.useState(() => None);
  React.useEffect2(
    () => {
      ReactNativeCalendarEvents.findCalendars()
      ->FutureJs.fromPromise(error => {
          // @todo ?
          Js.log(error);
          error;
        })
      ->Future.tapOk(res => set(_ => Some(res->sort)))
      ->ignore;
      None;
    },
    (set, updater),
  );
  value;
};

let useEvents = (startDate, endDate, updatedAt) => {
  let (events, setEvents) = React.useState(() => None);

  React.useEffect4(
    () => {
      ReactNativeCalendarEvents.fetchAllEvents(
        startDate->Js.Date.toISOString,
        endDate->Js.Date.toISOString,
        // we filter calendar later cause if you UNSELECT ALL
        // this `fetchAllEvents` DEFAULT TO ALL
        None,
      )
      ->FutureJs.fromPromise(error => {
          // @todo ?
          Js.log(error);
          error;
        })
      ->Future.tapOk(res => setEvents(_ => Some(res)))
      ->ignore;
      None;
    },
    (startDate, endDate, setEvents, updatedAt),
  );

  events;
};

let filterEvents = (events, settings) =>
  events->Array.keep(e
    // filters out all day events
    =>
      if (e##allDay->Option.getWithDefault(false)) {
        false;
             // filters selected calendars
      } else if (settings##calendarsIdsSkipped
                 ->Array.some(cid =>
                     cid
                     == e##calendar
                        ->Option.map(c => c##id)
                        ->Option.getWithDefault("")
                   )) {
        false;
      } else if (settings##activitiesSkippedFlag
                 && settings##activitiesSkipped
                    ->Array.some(eventName =>
                        eventName->simplifyEventTitleForComparison
                        == e##title->simplifyEventTitleForComparison
                      )) {
        false;
      } else {
        true;
      }
    );

let mapToSortedArrayPerDuration = map =>
  map
  ->Map.String.toArray
  ->Array.map(((_key, evts)) => {
      let totalDurationInMin =
        evts->Array.reduce(
          0.,
          (totalDurationInMin, e) => {
            let durationInMs =
              Date.durationInMs(
                e##endDate->Js.Date.fromString,
                e##startDate->Js.Date.fromString,
              );
            totalDurationInMin
            +. durationInMs->Js.Date.fromFloat->Js.Date.valueOf->Date.msToMin;
          },
        );
      (
        evts[0]->Option.map(e => e##title)->Option.getWithDefault(""),
        totalDurationInMin,
      );
    })
  ->SortArray.stableSortBy(((_, minA), (_, minB)) =>
      minA > minB ? (-1) : minA < minB ? 1 : 0
    );

let mapTitleDuration = events => {
  events
  ->Array.reduce(
      Map.String.empty,
      (map, e) => {
        let key = e##title->simplifyEventTitleForComparison;
        map->Map.String.set(
          key,
          map
          ->Map.String.get(key)
          ->Option.getWithDefault([||])
          ->Array.concat([|e|]),
        );
      },
    )
  ->mapToSortedArrayPerDuration;
};

let mapCategoryDuration = (settings, events) => {
  events
  ->Array.reduce(
      Map.String.empty,
      (map, e) => {
        let key = settings->categoryIdFromEventTitle(e##title);
        map->Map.String.set(
          key,
          map
          ->Map.String.get(key)
          ->Option.getWithDefault([||])
          ->Array.concat([|e|]),
        );
      },
    )
  ->mapToSortedArrayPerDuration;
};

let isEventSkipped = (settings, evt) => {
  settings##activitiesSkipped
  ->Array.some(e =>
      e->simplifyEventTitleForComparison
      == evt->simplifyEventTitleForComparison
    );
};
