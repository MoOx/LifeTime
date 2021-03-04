open Belt
module Ids = {
  let reminderDailyCheck = 1->Js.Int.toString
}

let minutesGapToAvoidTooCloseNotif = 30.
let appropriateTimeForNextNotification = (today: float, notifFrequency: array<option<int>>) => {
  open Js.Date

  let supposedDate =
    today
    ->fromFloat
    ->setMilliseconds(0.)
    ->fromFloat
    ->setSeconds(0.)
    ->fromFloat
    ->setMinutes(
      notifFrequency[0]->Option.getWithDefault(None)->Option.getWithDefault(0)->float_of_int,
    )
    ->fromFloat
    ->setHours(
      notifFrequency[1]->Option.getWithDefault(None)->Option.getWithDefault(0)->float_of_int,
    )
    ->fromFloat

  let supposedMaxLimitDate = supposedDate->getTime -. 1000. *. 60. *. minutesGapToAvoidTooCloseNotif
  let adjustedDate = if today >= supposedMaxLimitDate {
    // date + 1j if...
    // - you open the app Xmin before the notification
    //   (eg: you open at 8:30+ => delay to avoid a notification poping at 9:00)
    // - you open the app after the notification hour
    (today +. 1000. *. 60. *. 60. *. 24.)->fromFloat
  } else {
    // current date if we open the app after midnight
    // we still want notif in the morning
    today->fromFloat
  }
  let adjustedNotifTime = makeWithYMDHMS(
    ~year=adjustedDate->getFullYear,
    ~month=adjustedDate->getMonth,
    ~date=adjustedDate->getDate,
    ~hours=supposedDate->getHours,
    ~minutes=supposedDate->getMinutes,
    ~seconds=0.,
    (),
  )

  // Log.info((
  //   "Notifications:",
  //   notifFrequency,
  //   "planned at",
  //   adjustedNotifTime->toISOString,
  //   "supposedDate",
  //   supposedDate->toISOString,
  //   "supposedMaxLimitDate",
  //   supposedMaxLimitDate->fromFloat->toISOString,
  // ))
  adjustedNotifTime
}
