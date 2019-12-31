open Belt;

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
      } else if (settings##eventsSkipped
                 ->Array.some(eventName =>
                     eventName == e##title->Option.getWithDefault("")
                   )) {
        false;
      } else {
        true;
      }
    );

let mapTitleDuration = events => {
  events
  ->Array.reduce(
      Map.String.empty,
      (map, e) => {
        let key = e##title->Js.String.toLowerCase;
        map->Map.String.set(
          key,
          map
          ->Map.String.get(key)
          ->Option.getWithDefault([||])
          ->Array.concat([|e|]),
        );
      },
    )
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
};
