open Belt;
open ReactNativeCalendarEvents;

let date0 =
  Js.Date.makeWithYMDHM(
    ~year=0.,
    ~month=0.,
    ~date=0.,
    ~hours=0.,
    ~minutes=0.,
    (),
  );

let sort = (calendars: array(calendar)) =>
  calendars->SortArray.stableSortBy((a, b) =>
    a.title > b.title ? 1 : a.title < b.title ? (-1) : 0
  );

let availableCalendars =
    (calendars: array(calendar), settings: AppSettings.t) =>
  calendars
  ->Array.keep(c =>
      !settings.calendarsIdsSkipped->Array.some(cs => cs == c.id)
    )
  ->Array.map(c => c.id);

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

let filterEvents =
    (
      events: array(ReactNativeCalendarEvents.calendarEventReadable),
      settings: AppSettings.t,
    ) =>
  events->Array.keep(evt
    // filters out all day events
    =>
      if (evt.allDay->Option.getWithDefault(false)) {
        false;
             // filters selected calendars
      } else if (settings.calendarsIdsSkipped
                 ->Array.some(cid =>
                     cid
                     == evt.calendar
                        ->Option.map(c => c.id)
                        ->Option.getWithDefault("")
                   )) {
        false;
      } else if (settings.activitiesSkippedFlag
                 && settings.activitiesSkipped
                    ->Array.some(skipped =>
                        Activities.isSimilar(skipped, evt.title)
                      )) {
        false;
      } else {
        true;
      }
    );

let mapToSortedArrayPerDuration = map =>
  map
  ->Map.String.toArray
  ->Array.map(((_key, evts: array(calendarEventReadable))) => {
      let totalDurationInMin =
        evts->Array.reduce(
          0.,
          (totalDurationInMin, evt) => {
            let durationInMs =
              Date.durationInMs(
                evt.endDate->Js.Date.fromString,
                evt.startDate->Js.Date.fromString,
              );
            totalDurationInMin
            +. durationInMs->Js.Date.fromFloat->Js.Date.valueOf->Date.msToMin;
          },
        );
      (
        evts[0]->Option.map(evt => evt.title)->Option.getWithDefault(""),
        totalDurationInMin,
      );
    })
  ->SortArray.stableSortBy(((_, minA), (_, minB)) =>
      minA > minB ? (-1) : minA < minB ? 1 : 0
    );

let mapTitleDuration = (events: array(calendarEventReadable)) => {
  events
  ->Array.reduce(
      Map.String.empty,
      (map, evt) => {
        let key = evt.title->Activities.minifyName;
        map->Map.String.set(
          key,
          map
          ->Map.String.get(key)
          ->Option.getWithDefault([||])
          ->Array.concat([|evt|]),
        );
      },
    )
  ->mapToSortedArrayPerDuration;
};

let categoryIdFromActivityTitle = (settings: AppSettings.t, activityName) => {
  let activity =
    settings.activities
    ->Array.keep(acti =>
        Activities.isSimilar(acti.title, activityName)
        && acti.categoryId->ActivityCategories.isIdValid
      )[0]
    ->Option.getWithDefault(Activities.unknown);
  activity.categoryId;
};

let mapCategoryDuration =
    (settings: AppSettings.t, events: array(calendarEventReadable)) => {
  events
  ->Array.reduce(
      Map.String.empty,
      (map, evt) => {
        let key = settings->categoryIdFromActivityTitle(evt.title);
        map->Map.String.set(
          key,
          map
          ->Map.String.get(key)
          ->Option.getWithDefault([||])
          ->Array.concat([|evt|]),
        );
      },
    )
  ->mapToSortedArrayPerDuration;
};
