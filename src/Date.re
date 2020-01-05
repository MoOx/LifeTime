open Js.Date;

let now = () => fromFloat(now());

let dayLongString = day => {
  switch (day) {
  | 0. => "Sunday"
  | 1. => "Monday"
  | 2. => "Tuesday"
  | 3. => "Wednesday"
  | 4. => "Thursday"
  | 5. => "Friday"
  | 6. => "Saturday"
  | _ => ""
  };
};

let dayShortString = day => {
  switch (day) {
  | 0. => "Sun"
  | 1. => "Mon"
  | 2. => "Tue"
  | 3. => "Wed"
  | 4. => "Thu"
  | 5. => "Fri"
  | 6. => "Sat"
  | _ => ""
  };
};

let dayLetterString = day => {
  switch (day) {
  | 0. => "S"
  | 1. => "M"
  | 2. => "T"
  | 3. => "W"
  | 4. => "T"
  | 5. => "F"
  | 6. => "S"
  | _ => ""
  };
};

let monthLongString = date => {
  switch (date->getMonth +. 1.) {
  | 1. => "January"
  | 2. => "February"
  | 3. => "March"
  | 4. => "April"
  | 5. => "May"
  | 6. => "June"
  | 7. => "July"
  | 8. => "August"
  | 9. => "September"
  | 10. => "October"
  | 11. => "November"
  | 12. => "December"
  | _ => ""
  };
};

let monthShortString = date => {
  switch (date->getMonth +. 1.) {
  | 1. => "Jan"
  | 2. => "Feb"
  | 3. => "Mar"
  | 4. => "Apr"
  | 5. => "May"
  | 6. => "Jun"
  | 7. => "Jul"
  | 8. => "Aug"
  | 9. => "Sep"
  | 10. => "Oct"
  | 11. => "Nov"
  | 12. => "Dec"
  | _ => ""
  };
};

let dateString = date => {
  date->getDate->Js.Float.toString;
};

let durationInMs = (date1, date2) =>
  (date1->valueOf -. date2->valueOf)->abs_float;

let msToMin = ms => ms /. 1000. /. 60.;
let msToHours = ms => ms->msToMin /. 60.;
let msToDays = ms => ms->msToHours /. 24.;
let minToHours = min => min /. 60.;

let minToString = min => {
  let durationInH = min->minToHours;
  let durationH = durationInH->int_of_float;
  let durationM = (durationInH -. durationH->float_of_int) *. 60.;
  let hasH = durationH > 0;
  let hasM = durationM >= 1.;

  (hasH ? durationH->string_of_int ++ "h" ++ " " : "")
  ++ (
    hasM
      ? durationM->Js.Float.toFixed ++ "m" : hasH ? "" : hasH ? "" : "0" ++ "m"
  );
};

let copy = date => date->valueOf->fromFloat;

let addDays = (date, numberOfDays) => {
  let d = date->copy;
  d->setDate(d->getDate +. numberOfDays->float)->ignore;
  d;
};

let firstDayOfWeek = (~firstDayOfWeekIndex: int=1, givenDate: t) => {
  let dayOfWeek = givenDate->getDay->int_of_float;
  let firstDayOfWeek = givenDate->copy;
  let diff =
    dayOfWeek >= firstDayOfWeekIndex
      ? dayOfWeek - firstDayOfWeekIndex : 6 - dayOfWeek;

  firstDayOfWeek->setDate(givenDate->getDate -. diff->float)->ignore;
  firstDayOfWeek
  ->setHoursMSMs(~hours=0., ~minutes=0., ~seconds=0., ~milliseconds=0., ())
  ->ignore;

  firstDayOfWeek;
};

let lastDayOfWeek = (~firstDayOfWeekIndex: int=1, givenDate: t) => {
  let fdow = firstDayOfWeek(~firstDayOfWeekIndex, givenDate);
  makeWithYMDHMS(
    ~year=fdow->getFullYear,
    ~month=fdow->getMonth,
    ~date=fdow->getDate +. 6.,
    ~hours=23.,
    ~minutes=59.,
    ~seconds=59.,
    (),
  );
};

let firstDayOfMonth = date => {
  makeWithYMD(~year=date->getFullYear, ~month=date->getMonth, ~date=1., ());
};

let lastDayOfMonth = date => {
  makeWithYMDHMS(
    ~year=date->getFullYear,
    ~month=date->getMonth +. 1.,
    ~date=0.,
    ~hours=23.,
    ~minutes=59.,
    ~seconds=59.,
    (),
  );
};

let min = (d1, d2) =>
  if (d1->getTime < d2->getTime) {
    d1;
  } else {
    d2;
  };

let max = (d1, d2) =>
  if (d1->getTime > d2->getTime) {
    d1;
  } else {
    d2;
  };

let weekDates = (~firstDayOfWeekIndex: int=1, date) => {
  (
    firstDayOfWeek(~firstDayOfWeekIndex, date),
    lastDayOfWeek(~firstDayOfWeekIndex, date),
  );
};

let startOfDay = date => {
  makeWithYMDHMS(
    ~year=date->getFullYear,
    ~month=date->getMonth,
    ~date=date->getDate,
    ~hours=0.,
    ~minutes=0.,
    ~seconds=0.,
    (),
  );
};

let endOfDay = date => {
  makeWithYMDHMS(
    ~year=date->getFullYear,
    ~month=date->getMonth,
    ~date=date->getDate,
    ~hours=23.,
    ~minutes=59.,
    ~seconds=59.,
    (),
  );
};

let hasOverlap = (startA, endA, dateB) => {
  let startB = dateB->startOfDay;
  let endB = dateB->endOfDay;
  // https://stackoverflow.com/a/325964/988941
  startA->getTime <= endB->getTime && endA->getTime >= startB->getTime;
};
