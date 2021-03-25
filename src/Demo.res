open Belt
open ReactNative

let calendarDemoTitle = "LifeTime Demo"

let injectFreshData = () => {
  ReactNativeCalendarEvents.findCalendars()
  ->FutureJs.fromPromise(error => {
    // @todo error
    Log.info(("Demo: ReactNativeCalendarEvents.findCalendars", error))
    "Unable to retrieve calendars before injecting demo data"
  })
  ->Future.tapOk(calendarsResult => {
    if calendarsResult->Array.length <= 0 {
      Alert.alert(
        ~title="Cannot Inject Demo Data",
        ~message="We didn't find any calendars on your device, so we cannot create one on the same account to inject data in it.",
        ~buttons=[Alert.button(~text="Ok", ())],
        (),
      )
    }

    let lifeTimeCalendarOptionalId =
      (
        calendarsResult->Array.keep(calendar => calendar.title === calendarDemoTitle)
      )[0]->Option.map(lifeTimeCalendar => lifeTimeCalendar.id)

    switch lifeTimeCalendarOptionalId {
    | Some(id) => {
        Log.info(("Demo: injectFreshData", calendarDemoTitle, id))
        Future.value(Some(id))
      }
    | None =>
      calendarsResult[0]
      ->Option.map(calendar => {
        Log.info(("Demo: injectFreshData", calendarDemoTitle, "No calendar yet, creating..."))
        ReactNativeCalendarEvents.saveCalendar({
          title: calendarDemoTitle,
          name: "LifeTime",
          color: "#ff0000",
          entityType: #event,
          accessLevel: #owner,
          ownerAccount: calendar.source,
          source: {
            name: calendar.source,
            type_: Some(calendar.type_),
            isLocalAccount: None,
            // isLocalAccount: Some(true),
          },
        })
        ->FutureJs.fromPromise(error => {
          // @todo error
          Log.info(("Demo: ReactNativeCalendarEvents.saveCalendar", error))
          "Unable to create a calendars to injecting demo data"
        })
        ->Future.map(res => {
          switch res {
          | Ok(id) => Some(id)
          | Error(_) => None
          }
        })
      })
      ->Option.getWithDefault(Future.value(None))
    }->Future.tap(id => {
      Log.info(("Demo: ", calendarDemoTitle, "ready", id))
      id
      ->Option.map(calendarId => {
        open ReactNativeCalendarEvents
        let today = Date.now()
        let lastWeekSameDay = today->DateFns.addDays(-7.)
        let startOfLastWeekDate = Date.startOfWeek(lastWeekSameDay)
        let startOfWeekDate = Date.startOfWeek(today)
        [
          (-2., 8.25),
          (-1., 8.5),
          (-2.5, 7.),
          (-1.75, 7.75),
          (0.5, 8.),
          (-1.5, 8.75),
          (0., 7.75),
        ]->Array.forEachWithIndex((index, (startadd, endadd)) => {
          open DateFns
          saveEvent(
            "Sleep",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays(index->Js.Int.toFloat)
              ->addHours(startadd)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays(index->Js.Int.toFloat)
              ->addHours(endadd)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })
        [
          (-2., 8.25),
          (-1., 8.5),
          (-2.5, 7.),
          (-1.75, 7.75),
          (0.5, 8.),
          (-1.5, 8.75),
          (0., 7.75),
        ]->Array.forEachWithIndex((index, (startadd, endadd)) => {
          open DateFns
          saveEvent(
            "Sleep",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfWeekDate
              ->addDays(index->Js.Int.toFloat)
              ->addHours(startadd)
              ->Js.Date.getTime,
              ~endDate=startOfWeekDate
              ->addDays(index->Js.Int.toFloat)
              ->addHours(endadd)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })
      })
      ->ignore
    })
  })
  ->ignore
  ()
}

let removeData = () => {
  ReactNativeCalendarEvents.findCalendars()
  ->FutureJs.fromPromise(error => {
    // @todo error
    Log.info(("Demo: removeData ReactNativeCalendarEvents.findCalendars", error))
    "Unable to retrieve calendars before injecting demo data"
  })
  ->Future.tapOk(calendarsResult => {
    if calendarsResult->Array.length <= 0 {
      Alert.alert(
        ~title="Cannot Remove Demo Data",
        ~message="We didn't find any calendars on your device.",
        ~buttons=[Alert.button(~text="Ok", ())],
        (),
      )
    }

    let lifeTimeCalendarOptionalId =
      (
        calendarsResult->Array.keep(calendar => calendar.title === calendarDemoTitle)
      )[0]->Option.map(lifeTimeCalendar => lifeTimeCalendar.id)

    switch lifeTimeCalendarOptionalId {
    | Some(id) => ReactNativeCalendarEvents.removeCalendar(id)->ignore
    | None =>
      Alert.alert(
        ~title="No Demo Data",
        ~message="We didn't find the '" ++ calendarDemoTitle ++ "'  calendar.",
        ~buttons=[Alert.button(~text="Ok", ())],
        (),
      )
    }
  })
  ->ignore
  ()
}
