open Belt;

let sort = calendars =>
  calendars->SortArray.stableSortBy((a, b) =>
    a##title > b##title ? 1 : a##title < b##title ? (-1) : 0
  );

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
