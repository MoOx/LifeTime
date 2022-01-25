open Belt
open ReactNative

let calendarDemoTitle = "LifeTime Demo"

let injectData = () => {
  ReactNativeCalendarEvents.findCalendars()
  ->FuturePromise.fromPromise
  ->Future.mapError(error => {
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

    let futureId = switch lifeTimeCalendarOptionalId {
    | Some(id) => {
        Log.info(("Demo: injectData", calendarDemoTitle, id))
        Future.value(Some(id))
      }
    | None =>
      calendarsResult[0]
      ->Option.map(calendar => {
        Log.info(("Demo: injectData", calendarDemoTitle, "No calendar yet, creating..."))
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
        ->FuturePromise.fromPromise
        ->Future.mapError(error => {
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
    }
    futureId
    ->Future.tap(id => {
      Log.info(("Demo: ", calendarDemoTitle, "ready", id))
      id
      ->Option.map(calendarId => {
        open ReactNativeCalendarEvents
        let today = Date.now()
        let lastWeekSameDay = today->DateFns.addDays(-7.)
        let startOfLastWeekDate = Date.startOfWeek(lastWeekSameDay)
        // let startOfWeekDate = Date.startOfWeek(today)
        [
          (-2., 8.25, 0),
          (-1., 8.5, 0),
          (-2.5, 7., 0),
          (-1.75, 7.75, 0),
          (0.5, 8., 0),
          (-1.5, 8.75, 0),
          (0., 7.75, 0),
          (-2., 8.25, 0),
          (-1., 8.5, 0),
          (-2.5, 7., 0),
          (-1.75, 7.75, 0),
          (0.5, 8., 0),
          (-1.5, 8.75, 0),
          (0., 7.75, 0),
        ]->Array.forEachWithIndex((index, (startadd, endadd, additionalDays)) => {
          open DateFns
          saveEvent(
            "Sleep",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })
        [
          (12., 12.75, 0),
          (12., 12.5, 0),
          (12., 13., 0),
          (12.25, 12.75, 0),
          (12., 12.75, 0),
          (12.5, 13., 0),
          (12.25, 12.75, 0),
          (12., 12.75, 0),
          (12., 12.5, 0),
          (12., 13., 0),
          (12.25, 12.75, 0),
          (12., 12.75, 0),
          (12.5, 13., 0),
          (12.25, 12.75, 0),
        ]->Array.forEachWithIndex((index, (startadd, endadd, additionalDays)) => {
          open DateFns
          saveEvent(
            "Lunch",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })
        [
          (18.75, 19.75, 0),
          (19., 19.75, 0),
          (19., 20., 0),
          (19.25, 19.75, 0),
          (19., 19.75, 0),
          (19.75, 20., 0),
          (19.25, 19.75, 0),
          (18.75, 19.75, 0),
          (19., 19.75, 0),
          (19., 20., 0),
          (19.25, 20., 0),
          (19., 19.75, 0),
          (19.75, 20.25, 0),
          (19.25, 20., 0),
        ]->Array.forEachWithIndex((index, (startadd, endadd, additionalDays)) => {
          open DateFns
          saveEvent(
            "Dinner",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })
        [
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
          (9.25, 9.5, 0),
        ]->Array.forEachWithIndex((index, (startadd, endadd, additionalDays)) => {
          open DateFns
          saveEvent(
            "Meditation",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })
        [
          (9.75, 12., 0),
          (10., 12., 0),
          (10., 12., 0),
          (10.25, 12., 0),
          (10., 12., 0),
          (10.5, 12., 0),
          (10.25, 12., 0),
          (9.75, 12., 0),
          (10., 12., 0),
          (10., 12., 0),
          (10.25, 12., 0),
          (10., 12., 0),
          (10.5, 12., 0),
          (10.25, 12., 0),
        ]->Array.forEachWithIndex((index, (startadd, endadd, additionalDays)) => {
          open DateFns
          saveEvent(
            "Work",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })
        [
          (13.75, 17., 0),
          (14., 17., 0),
          (14., 17., 0),
          (14.25, 17., 0),
          (14., 17., 0),
          (14.5, 17., 0),
          (14.25, 17., 0),
          (13.75, 17., 0),
          (14., 17., 0),
          (14., 17., 0),
          (14.25, 17., 0),
          (14., 17., 0),
          (14.5, 17., 0),
          (14.25, 17., 0),
        ]->Array.forEachWithIndex((index, (startadd, endadd, additionalDays)) => {
          open DateFns
          saveEvent(
            "Work",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })

        [(17.5, 18.25, 0)]->Array.forEachWithIndex((index, (startadd, endadd, additionalDays)) => {
          open DateFns
          saveEvent(
            "Appointment with dentist",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })

        [(18., 19., 2), (18., 19., 6)]->Array.forEachWithIndex((
          index,
          (startadd, endadd, additionalDays),
        ) => {
          open DateFns
          saveEvent(
            "CrossFit",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })

        [(18., 24. +. 2.75, 3)]->Array.forEachWithIndex((
          index,
          (startadd, endadd, additionalDays),
        ) => {
          open DateFns
          saveEvent(
            "Evening with Jane & John",
            writableEvent(
              ~calendarId,
              ~notes="LifeTime Demo Event",
              ~startDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(startadd->Js.Math.trunc)
              ->addMinutes(startadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              ~endDate=startOfLastWeekDate
              ->addDays((index + additionalDays)->Js.Int.toFloat)
              ->addHours(endadd->Js.Math.trunc)
              ->addMinutes(endadd->mod_float(1.) *. 60.)
              ->Js.Date.getTime,
              (),
            ),
            None,
          )->ignore
        })
      })
      ->ignore
    })
    ->ignore
  })
}

let removeData = () => {
  ReactNativeCalendarEvents.findCalendars()
  ->FuturePromise.fromPromise
  ->Future.mapError(error => {
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
}

let fullRefresh = () => {
  removeData()->Future.tap(_, _ => injectData()->ignore)
}
