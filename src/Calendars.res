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

let sort = (calendars: array<calendar>) =>
  calendars->SortArray.stableSortBy((a, b) =>
    a.title > b.title
      ? 1
      : switch a.title < b.title {
        | true => -1
        | false => 0
        }
  )

let availableCalendars = (
  calendars: array<calendar>,
  calendarsSkipped: array<AppSettings.calendarSkipped>,
) =>
  calendars
  ->Array.keep(c => !(calendarsSkipped->Array.some(cs => cs.id == c.id)))
  ->Array.map(c => c.id)

let useCalendars = updater => {
  let (value, set) = React.useState(() => None)
  React.useEffect2(() => {
    Log.info("Calendars: useCalendars request")
    findCalendars()
    ->FutureJs.fromPromise(error => {
      // @todo error!
      Log.info(("Calendars: useCalendars", error))
      error
    })
    ->Future.tapOk(res => set(_ => Some(res->sort)))
    ->ignore
    None
  }, (set, updater))
  value
}

type fetchable<'a> =
  | NotAsked
  | Fetching
  | Done('a)

type events = fetchable<array<calendarEventReadable>>
let defaultContext: (
  (Js.Date.t, Js.Date.t) => events,
  (Js.Date.t, Js.Date.t) => unit,
  Js.Date.t,
  unit => unit,
) = ((_, _) => NotAsked, (_, _) => (), Js.Date.make(), _ => ())
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

// round to ...HH:MM+1:00:000
let roundDate = (date: Js.Date.t) => {
  // let roundDateSeconds = 10.
  open Js.Date
  date
  ->getTime
  ->fromFloat
  ->setMilliseconds(0.)
  ->fromFloat
  // ->setSeconds((date->getSeconds /. roundDateSeconds)->Js.Math.round *. roundDateSeconds)
  ->setSeconds(0.)
  ->fromFloat
  ->setMinutes(date->getMinutes +. 1.)
  ->fromFloat
}

let useEventsContext = () => {
  let (updatedAt, updatedAt_set) = React.useState(_ => Date.now())
  let (eventsMapByRange, eventsMapByRange_set) = React.useState(() => Map.String.empty)

  let requestUpdate = React.useCallback2(() => {
    Log.info("Calendars: requestUpdate")
    updatedAt_set(_ => Date.now())
    eventsMapByRange_set(_ => Map.String.empty)
  }, (updatedAt_set, eventsMapByRange_set))

  let getEvents = React.useCallback1((startDate, endDate) => {
    eventsMapByRange
    ->Map.String.get(makeMapKey(startDate, endDate))
    ->Option.getWithDefault(NotAsked)
  }, [eventsMapByRange])

  let fetchEvents = React.useCallback1((startDate, endDate) => {
    let startTime = Js.Date.now()
    Log.info(("Calendars: fetchingEvents for", startDate, endDate))
    let key = makeMapKey(startDate, endDate)
    // set None as a loading state
    eventsMapByRange_set(eventsMapByRange => eventsMapByRange->Map.String.set(key, Fetching))
    fetchAllEvents(
      startDate->Js.Date.toISOString,
      endDate->Js.Date.toISOString,
      // we filter calendar later cause if you UNSELECT ALL
      // this `fetchAllEvents` DEFAULT TO ALL
      None,
    )
    ->FutureJs.fromPromise(error => {
      // @todo error!
      Log.info(("Calendars: useEventsContext/getEvents", startDate, endDate, error))

      // eventsMapByRange_set(eventsMapByRange => {
      //   eventsMapByRange->Map.String.set(
      //     key,
      //     None,
      //   )
      // });
      error
    })
    ->Future.tapOk(res => {
      let endTime = Js.Date.now()
      Log.info((
        "Calendars: fetchingEvents for",
        startDate,
        endDate,
        "done in",
        ((endTime -. startTime) /. 1000.)->Js.Float.toFixedWithPrecision(~digits=3),
        "s",
      ))
      eventsMapByRange_set(eventsMapByRange => eventsMapByRange->Map.String.set(key, Done(res)))
    })
    ->ignore
  }, [eventsMapByRange_set])

  (getEvents, fetchEvents, updatedAt, requestUpdate)
}

let isAllDayEvent = (evt: calendarEventReadable) => evt.allDay->Option.getWithDefault(false)

let isEventInSkippedCalendar = (
  evt: calendarEventReadable,
  calendarsSkipped: array<AppSettings.calendarSkipped>,
) =>
  calendarsSkipped->Array.some(cs =>
    cs.id == evt.calendar->Option.map(c => c.id)->Option.getWithDefault("")
  )

let isEventSkippedActivity = (
  evt: calendarEventReadable,
  activitiesSkippedFlag,
  activitiesSkipped,
) =>
  activitiesSkippedFlag &&
  activitiesSkipped->Array.some(skipped => Activities.isSimilar(skipped, evt.title))

let filterAllDayEvents = (events: array<calendarEventReadable>) =>
  events->Array.keep(evt => !(evt->isAllDayEvent))

let filterEventsByCalendars = (events: array<calendarEventReadable>, calendarsSkipped) =>
  events->Array.keep(evt => !(evt->isEventInSkippedCalendar(calendarsSkipped)))

let filterEventsByActivities = (
  events: array<calendarEventReadable>,
  activitiesSkippedFlag,
  activitiesSkipped,
) =>
  events->Array.keep(evt =>
    !(evt->isEventSkippedActivity(activitiesSkippedFlag, activitiesSkipped))
  )

let filterEvents = (
  events: array<calendarEventReadable>,
  calendarsSkipped,
  activitiesSkippedFlag,
  activitiesSkipped,
) =>
  events->Array.keep(evt =>
    !(evt->isAllDayEvent) &&
    (!(evt->isEventInSkippedCalendar(calendarsSkipped)) &&
    !(evt->isEventSkippedActivity(activitiesSkippedFlag, activitiesSkipped)))
  )

type noEvents =
  | None
  | OnlyAllDays
  | OnlySkippedCalendars
  | OnlySkippedActivities
  | Some
let noEvents = (
  events: array<calendarEventReadable>,
  calendarsSkipped,
  activitiesSkippedFlag,
  activitiesSkipped,
) =>
  switch events {
  | [] => None
  | evts =>
    let evtsWoAllDay = evts->filterAllDayEvents
    if evtsWoAllDay == [] {
      OnlyAllDays
    } else {
      let evtsWoCalendars = evtsWoAllDay->filterEventsByCalendars(calendarsSkipped)
      if evtsWoCalendars == [] {
        OnlySkippedCalendars
      } else {
        let evtsWoActivities =
          evtsWoCalendars->filterEventsByActivities(activitiesSkippedFlag, activitiesSkipped)
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
) =>
  events
  ->Array.reduce(Map.String.empty, (map, evt) => {
    let key = evt.title->Activities.minifyName
    map->Map.String.set(
      key,
      map->Map.String.get(key)->Option.getWithDefault([])->Array.concat([evt]),
    )
  })
  ->Map.String.toArray
  ->Array.map(((_key, evts: array<calendarEventReadable>)) => {
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
  })
  ->SortArray.stableSortBy(((_, minA), (_, minB)) =>
    minA > minB
      ? -1
      : switch minA < minB {
        | true => 1
        | false => 0
        }
  )

let categoryIdFromActivityTitle = (activityName, activities: array<Activities.t>) => {
  let activity =
    (
      activities->Array.keep(acti =>
        Activities.isSimilar(acti.title, activityName) &&
        acti.categoryId->ActivityCategories.isIdValid
      )
    )[0]->Option.getWithDefault(Activities.unknown)
  activity.categoryId
}

let makeMapCategoryDuration = (
  events: array<calendarEventReadable>,
  activities: array<Activities.t>,
  startDate: Js.Date.t,
  endDate: Js.Date.t,
) =>
  events
  ->Array.reduce(Map.String.empty, (map, evt) => {
    let key = evt.title->categoryIdFromActivityTitle(activities)
    map->Map.String.set(
      key,
      map->Map.String.get(key)->Option.getWithDefault([])->Array.concat([evt]),
    )
  })
  ->Map.String.toArray
  ->Array.map(((key, evts: array<calendarEventReadable>)) => {
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
  })
  ->SortArray.stableSortBy(((_, minA), (_, minB)) =>
    minA > minB
      ? -1
      : switch minA < minB {
        | true => 1
        | false => 0
        }
  )
