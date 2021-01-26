open Belt
open ReactNativeCalendarEvents

let openCalendarApp = () => {
  open ReactNative
  if Platform.os == Platform.ios {
    Linking.openURL("calshow:")->ignore
  } else if Platform.os == Platform.android {
    Linking.openURL("content://com.android.calendar/time/")->ignore
  }
}

let date0 = Js.Date.makeWithYMDHM(~year=0., ~month=0., ~date=0., ~hours=0., ~minutes=0., ())

let sort = (calendars: array<calendar>) => calendars->SortArray.stableSortBy((a, b) =>
    a.title > b.title
      ? 1
      : switch a.title < b.title {
        | true => -1
        | false => 0
        }
  )

let availableCalendars = (calendars: array<calendar>, settings: AppSettings.t) =>
  calendars
  ->Array.keep(c => !(settings.calendarsSkipped->Array.some(cs => cs.id == c.id)))
  ->Array.map(c => c.id)

let useCalendars = updater => {
  let (value, set) = React.useState(() => None)
  React.useEffect2(() => {
    findCalendars()->FutureJs.fromPromise(error => {
      // @todo error!
      Js.log(error)
      error
    })->Future.tapOk(res => set(_ => Some(res->sort)))->ignore
    None
  }, (set, updater))
  value
}

type events = option<array<calendarEventReadable>>
let defaultContext: ((Js.Date.t, Js.Date.t, bool) => events, Js.Date.t, unit => unit) = (
  (_, _, _) => None,
  Js.Date.make(),
  _ => (),
)
let context = React.createContext(defaultContext)

module ContextProvider = {
  let makeProps = (~value, ~children, ()) =>
    {
      "value": value,
      "children": children,
    }
  let make = React.Context.provider(context)
}

let makeMapKey = (startDate, endDate) =>
  startDate->Js.Date.toISOString ++ endDate->Js.Date.toISOString

let useEvents = () => {
  let (updatedAt, setUpdatedAt) = React.useState(_ => Date.now())
  let (eventsMapByRange, setEventsMapByRange) = React.useState(() => Map.String.empty)

  let requestUpdate = React.useCallback2(() => {
    setUpdatedAt(_ => Date.now())
    setEventsMapByRange(_ => Map.String.empty)
  }, (setUpdatedAt, setEventsMapByRange))

  let getEvents = React.useCallback2((startDate, endDate, allowFetch) => {
    let res = eventsMapByRange->Map.String.get(makeMapKey(startDate, endDate))
    if res->Option.isNone {
      let res = eventsMapByRange->Map.String.get(makeMapKey(startDate, endDate))
      if res->Option.isNone && allowFetch {
        fetchAllEvents(
          startDate->Js.Date.toISOString,
          endDate->Js.Date.toISOString,
          // we filter calendar later cause if you UNSELECT ALL
          // this `fetchAllEvents` DEFAULT TO ALL
          None,
        )
        ->FutureJs.fromPromise(error => {
          // @todo error!
          Js.log(error)

          // setEventsMapByRange(eventsMapByRange => {
          //   eventsMapByRange->Map.String.set(
          //     makeMapKey(startDate, endDate),
          //     None,
          //   )
          // });
          error
        })
        ->Future.tapOk(res =>
          setEventsMapByRange(eventsMapByRange =>
            eventsMapByRange->Map.String.set(makeMapKey(startDate, endDate), Some(res))
          )
        )
        ->ignore
        ()
      }
    }
    res->Option.flatMap(res => res)
  }, (eventsMapByRange, setEventsMapByRange))

  (getEvents, updatedAt, requestUpdate)
}

let isAllDayEvent = (evt: calendarEventReadable) => evt.allDay->Option.getWithDefault(false)

let isEventInSkippedCalendar = (evt: calendarEventReadable, settings: AppSettings.t) =>
  settings.calendarsSkipped->Array.some(cs =>
    cs.id == evt.calendar->Option.map(c => c.id)->Option.getWithDefault("")
  )

let isEventSkippedActivity = (evt: calendarEventReadable, settings: AppSettings.t) =>
  settings.activitiesSkippedFlag &&
  settings.activitiesSkipped->Array.some(skipped => Activities.isSimilar(skipped, evt.title))

let filterAllDayEvents = (events: array<calendarEventReadable>) =>
  events->Array.keep(evt => !(evt->isAllDayEvent))

let filterEventsByCalendars = (events: array<calendarEventReadable>, settings: AppSettings.t) =>
  events->Array.keep(evt => !(evt->isEventInSkippedCalendar(settings)))

let filterEventsByActivities = (events: array<calendarEventReadable>, settings: AppSettings.t) =>
  events->Array.keep(evt => !(evt->isEventSkippedActivity(settings)))

let filterEvents = (events: array<calendarEventReadable>, settings: AppSettings.t) =>
  events->Array.keep(evt =>
    !(evt->isAllDayEvent) &&
    (!(evt->isEventInSkippedCalendar(settings)) &&
    !(evt->isEventSkippedActivity(settings)))
  )

type noEvents =
  | None
  | OnlyAllDays
  | OnlySkippedCalendars
  | OnlySkippedActivities
  | Some
let noEvents = (events: array<calendarEventReadable>, settings: AppSettings.t) =>
  switch events {
  | [] => None
  | evts =>
    let evtsWoAllDay = evts->filterAllDayEvents
    if evtsWoAllDay == [] {
      OnlyAllDays
    } else {
      let evtsWoCalendars = evtsWoAllDay->filterEventsByCalendars(settings)
      if evtsWoCalendars == [] {
        OnlySkippedCalendars
      } else {
        let evtsWoActivities = evtsWoCalendars->filterEventsByActivities(settings)
        if evtsWoActivities == [] {
          OnlySkippedActivities
        } else {
          Some
        }
      }
    }
  }

let makeMapTitleDuration = (
  events: array<calendarEventReadable>,
  startDate: Js.Date.t,
  endDate: Js.Date.t,
) => events->Array.reduce(Map.String.empty, (map, evt) => {
    let key = evt.title->Activities.minifyName
    map->Map.String.set(
      key,
      map->Map.String.get(key)->Option.getWithDefault([])->Array.concat([evt]),
    )
  })->Map.String.toArray->Array.map(((_key, evts: array<calendarEventReadable>)) => {
    let totalDurationInMin = evts->Array.reduce(0., (totalDurationInMin, evt) => {
      let durationInMs = Date.durationInMs(
        evt.endDate > endDate->Js.Date.toISOString ? endDate : evt.endDate->Js.Date.fromString,
        evt.startDate < startDate->Js.Date.toISOString
          ? startDate
          : evt.startDate->Js.Date.fromString,
      )
      totalDurationInMin +.
      durationInMs->Js.Date.fromFloat->Js.Date.valueOf->Date.msToMin->Js.Math.round
    })
    (evts[0]->Option.map(evt => evt.title)->Option.getWithDefault(""), totalDurationInMin)
  })->SortArray.stableSortBy(((_, minA), (_, minB)) =>
    minA > minB
      ? -1
      : switch minA < minB {
        | true => 1
        | false => 0
        }
  )

let categoryIdFromActivityTitle = (settings: AppSettings.t, activityName) => {
  let activity =
    (
      settings.activities->Array.keep(acti =>
        Activities.isSimilar(acti.title, activityName) &&
        acti.categoryId->ActivityCategories.isIdValid
      )
    )[0]->Option.getWithDefault(Activities.unknown)
  activity.categoryId
}

let makeMapCategoryDuration = (
  events: array<calendarEventReadable>,
  settings: AppSettings.t,
  startDate: Js.Date.t,
  endDate: Js.Date.t,
) => events->Array.reduce(Map.String.empty, (map, evt) => {
    let key = settings->categoryIdFromActivityTitle(evt.title)
    map->Map.String.set(
      key,
      map->Map.String.get(key)->Option.getWithDefault([])->Array.concat([evt]),
    )
  })->Map.String.toArray->Array.map(((key, evts: array<calendarEventReadable>)) => {
    let totalDurationInMin = evts->Array.reduce(0., (totalDurationInMin, evt) => {
      let durationInMs = Date.durationInMs(
        evt.endDate > endDate->Js.Date.toISOString ? endDate : evt.endDate->Js.Date.fromString,
        evt.startDate < startDate->Js.Date.toISOString
          ? startDate
          : evt.startDate->Js.Date.fromString,
      )
      totalDurationInMin +.
      durationInMs->Js.Date.fromFloat->Js.Date.valueOf->Date.msToMin->Js.Math.round
    })
    (key, totalDurationInMin)
  })->SortArray.stableSortBy(((_, minA), (_, minB)) =>
    minA > minB
      ? -1
      : switch minA < minB {
        | true => 1
        | false => 0
        }
  )

let filterEventsByTitle = (
  events: array<ReactNativeCalendarEvents.calendarEventReadable>,
  title: string,
) => events->Array.keep(evt => evt.title == title)

let sortEventsByDecreasingStartDate = (
  events: array<ReactNativeCalendarEvents.calendarEventReadable>,
) => events->SortArray.stableSortBy((a, b) =>
    a.startDate->Js.Date.fromString->Js.Date.getTime <
      b.startDate->Js.Date.fromString->Js.Date.getTime
      ? 1
      : switch a.startDate->Js.Date.fromString->Js.Date.getTime >
          b.startDate->Js.Date.fromString->Js.Date.getTime {
        | true => -1
        | false => 0
        }
  )
