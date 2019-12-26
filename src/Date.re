open Js.Date;

let now = () => fromFloat(now());

let dayLongString = date => {
  switch (date->getDay) {
  | 1. => "Monday"
  | 2. => "Tuesday"
  | 3. => "Wednesday"
  | 4. => "Thursday"
  | 5. => "Friday"
  | 6. => "Saturday"
  | 7. => "Sunday"
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

let eventDurationInMs = (endDate, startDate) =>
  endDate->fromString->valueOf -. startDate->fromString->valueOf;

let msToMin = duration => duration /. 1000. /. 60.;

let copy = date => date->valueOf->fromFloat;

let addDays = (~numberOfDays, date) => {
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
  firstDayOfWeek(~firstDayOfWeekIndex, givenDate)->addDays(~numberOfDays=7);
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

let minDate = (d1, d2) =>
  if (d1->getTime < d2->getTime) {
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
