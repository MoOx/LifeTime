open Belt;

let slugifyEventTitle = e => e->Js.String.toLowerCase;

module Categories = {
  type id = string;
  type name = string;
  type color = string;
  type icon = string;

  type cat = (id, name, color, icon);

  let unknown: id = "unknown";
  let unknownCat: cat = (unknown, "Uncategorized", "gray", "");
  let defaults: list(cat) = [
    ("rest", "Rest", "indigo", "moonsymbol"),
    ("food", "Nutrition", "green", "carrot"),
    ("exercise", "Exercise", "pink", "workout"),
    ("work", "Work", "blue", "edit"),
    ("social", "Social", "red", "social"),
    ("self", "Self-care", "teal", "meditation"),
    ("fun", "Entertainment", "purple", "theatremask"),
    ("chores", "Chores", "orange", "broom"),
    // ("misc", "Miscellaneous", "yellow", "tag"),
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
      // color extracted from .shortcut files
      // | "Red" => "0xFF4351FF" // Red: `0xFF4351FF` / `4282601983`
      // | "Vermillion" => "0xFD6631FF" // Vermillion: `0xFD6631FF` / `4251333119`
      // | "Apricot" => "0xFE9949FF" // Apricot: `0xFE9949FF` / `4271458815`
      // | "Pollen" => "0xFEC418FF" // Pollen: `0xFEC418FF` / `4274264319`
      // | "Mint" => "0xFFD426FF" // Mint: `0xFFD426FF` / `4292093695`
      // | "Turquoise" => "0x19BD03FF" // Turquoise: `0x19BD03FF` / `431817727`
      // | "Light Blue" => "0x55DAE1FF" // Light Blue: `0x55DAE1FF` / `1440408063`
      // | "Cerulean" => "0x1B9AF7FF" // Cerulean: `0x1B9AF7FF` / `463140863`
      // | "Delft Blue" => "0x3871DEFF" // Delft Blue: `0x3871DEFF` / `946986751`
      // | "Violet" => "0x7B72E9FF" // Violet: `0x7B72E9FF` / `2071128575`
      // | "Lilac" => "0xDB49D8FF" // Lilac: `0xDB49D8FF` / `3679049983`
      // | "Light Pink" => "0xED4694FF" // Light Pink: `0xED4694FF` / `3980825855`
      // | "Fog" => "0x000000FF" // Fog: `0x000000FF` / `255`
      // | "Limestone" => "0xB4B2A9FF" // Limestone: `0xB4B2A9FF` / `3031607807`
      // | "Sand" => "0xA9A9A9FF" // Sand: `0xA9A9A9FF` / `2846468607`
      // | "Red" => "#E16267"
      // | "Vermillion" => "#E36F55"
      // | "Apricot" => "#D57A38"
      // | "Pollen" => "#D1972D"
      // | "Mint" => "#659E48"
      // | "Turquoise" => "#4E9D86"
      // | "LightBlue" => "#5796AA"
      // | "Cerulean" => "#628ABE"
      // | "DelftBlue" => "#6A77BF"
      // | "Violet" => "#866FB8"
      // | "Lilac" => "#B773BB"
      // | "Light Pink" => "#D86C8A"
      // | "Fog" => "#7D8995"
      // | "Limestone" => "#828B85"
      // | "Sand" => "#948983"
      // | _ => "#7D8995";
    };

  module Icon = {
    open ReactNative;

    [@react.component]
    let make =
        (~name, ~width=28.->Style.dp, ~height=28.->Style.dp, ~fill="white") => {
      <View
        style=Style.(
          viewStyle(
            ~justifyContent=`center,
            ~alignItems=`center,
            ~borderRadius=6.,
            ~backgroundColor=fill,
            ~width,
            ~height,
            (),
          )
        )>
        {
          open ReactFromSvg.Size;
          let width = 80.->pct;
          let height = 80.->pct;
          let fill = "#fff";
          switch (name) {
          | "3dglasses" => <SVG3dglasses width height fill />
          | "alarm" => <SVGalarm width height fill />
          | "beachball" => <SVGbeachball width height fill />
          | "beachumbrella" => <SVGbeachumbrella width height fill />
          | "bed" => <SVGbed width height fill />
          | "bookmark" => <SVGbookmark width height fill />
          | "briefcase" => <SVGbriefcase width height fill />
          | "broom" => <SVGbroom width height fill />
          | "calendar" => <SVGcalendar width height fill />
          | "cancel" => <SVGcancel width height fill />
          | "carrot" => <SVGcarrot width height fill />
          | "chat" => <SVGchat width height fill />
          | "checkmark" => <SVGcheckmark width height fill />
          | "checkmarkcircle" => <SVGcheckmarkcircle width height fill />
          | "chevronright" => <SVGchevronright width height fill />
          | "circle" => <SVGcircle width height fill />
          | "cutlery" => <SVGcutlery width height fill />
          | "dashboard" => <SVGdashboard width height fill />
          | "delete" => <SVGdelete width height fill />
          | "edit" => <SVGedit width height fill />
          | "error" => <SVGerror width height fill />
          | "faceid" => <SVGfaceid width height fill />
          | "forest" => <SVGforest width height fill />
          | "fork" => <SVGfork width height fill />
          | "fullfamily" => <SVGfullfamily width height fill />
          | "guitar" => <SVGguitar width height fill />
          | "heartmonitor" => <SVGheartmonitor width height fill />
          | "homepage" => <SVGhomepage width height fill />
          | "info" => <SVGinfo width height fill />
          | "medicalid" => <SVGmedicalid width height fill />
          | "meditation" => <SVGmeditation width height fill />
          | "moonandstars" => <SVGmoonandstars width height fill />
          | "moonsymbol" => <SVGmoonsymbol width height fill />
          | "mountain" => <SVGmountain width height fill />
          | "movieticket" => <SVGmovieticket width height fill />
          | "ok" => <SVGok width height fill />
          | "palmtree" => <SVGpalmtree width height fill />
          | "people2" => <SVGpeople2 width height fill />
          | "people3" => <SVGpeople3 width height fill />
          | "puzzle" => <SVGpuzzle width height fill />
          | "romance" => <SVGromance width height fill />
          | "round" => <SVGround width height fill />
          | "settings" => <SVGsettings width height fill />
          | "sharerounded" => <SVGsharerounded width height fill />
          | "shoes" => <SVGshoes width height fill />
          | "signposttourist" => <SVGsignposttourist width height fill />
          | "social" => <SVGsocial width height fill />
          | "staff" => <SVGstaff width height fill />
          | "star" => <SVGstar width height fill />
          | "tag" => <SVGtag width height fill />
          | "theatremask" => <SVGtheatremask width height fill />
          | "today" => <SVGtoday width height fill />
          | "touchid" => <SVGtouchid width height fill />
          | "trash" => <SVGtrash width height fill />
          | "work" => <SVGwork width height fill />
          | "workout" => <SVGworkout width height fill />
          | _ => <SVGbookmark width height fill />
          };
        }
      </View>;
    };
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
    settings##eventsCategories
    ->Array.keep(((e, c)) =>
        e == eventTitle->slugifyEventTitle && c->isCategoryIdValid
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

let useEvents = (startDate, endDate) => {
  let (events, setEvents) = React.useState(() => None);

  React.useEffect3(
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
    (startDate, endDate, setEvents),
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
      } else if (settings##eventsSkippedOn
                 && settings##eventsSkipped
                    ->Array.some(eventName =>
                        eventName == e##title->slugifyEventTitle
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
        let key = e##title->slugifyEventTitle;
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
  Js.log2(settings##eventsSkipped, evt);
  settings##eventsSkipped->Array.some(e => e == evt->slugifyEventTitle);
};
