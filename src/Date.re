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

let msToS = ms => ms /. 1000.;
let msToMin = ms => ms->msToS /. 60.;
let msToHours = ms => ms->msToMin /. 60.;
let msToDays = ms => ms->msToHours /. 24.;

let daysToHours = d => d *. 24.;
let hoursToDays = h => h /. 24.;

let minToHours = min => min /. 60.;
let hoursToMin = h => h *. 60.;

let daysToMin = d => d->daysToHours->hoursToMin;
let minToDays = min => min->minToHours->hoursToDays;

let minToString = min => {
  let durationD = min->minToDays->int_of_float;
  let durationH =
    (min->minToHours -. durationD->float_of_int->daysToHours)->int_of_float;
  let durationM =
    (
      min
      -. durationD->float_of_int->daysToMin
      -. durationH->float_of_int->hoursToMin
    )
    ->int_of_float;
  let hasD = durationD > 0;
  let hasH = durationH > 0;
  let hasM = durationM > 0;

  (hasD ? durationD->string_of_int ++ "d" ++ (hasH || hasM ? " " : "") : "")
  ++ (hasH ? durationH->string_of_int ++ "h" ++ (hasM ? " " : "") : "")
  ++ (hasM ? durationM->string_of_int ++ "m" : hasD || hasH ? "" : "0" ++ "m");
};

let copy = date => date->valueOf->fromFloat;

let addDays = (date, numberOfDays) => {
  let d = date->copy;
  d->setDate(d->getDate +. numberOfDays->float)->ignore;
  d;
};

// https://github.com/react-native-community/react-native-localize/issues/88
let startsOnFriday = [|"MV"|];
let startsOnSaturday = [|
  "AE",
  "AF",
  "BH",
  "DJ",
  "DZ",
  "EG",
  "IQ",
  "IR",
  "JO",
  "KW",
  "LY",
  "OM",
  "QA",
  "SD",
  "SY",
|];

let startsOnSunday = [|
  "AG",
  "AS",
  "AU",
  "BD",
  "BR",
  "BS",
  "BT",
  "BW",
  "BZ",
  "CA",
  "CN",
  "CO",
  "DM",
  "DO",
  "ET",
  "GB",
  "GT",
  "GU",
  "HK",
  "HN",
  "ID",
  "IL",
  "IN",
  "JM",
  "JP",
  "KE",
  "KH",
  "KR",
  "LA",
  "MH",
  "MM",
  "MO",
  "MT",
  "MX",
  "MZ",
  "NI",
  "NP",
  "PA",
  "PE",
  "PH",
  "PK",
  "PR",
  "PT",
  "PY",
  "SA",
  "SG",
  "SV",
  "TH",
  "TT",
  "TW",
  "UM",
  "US",
  "VE",
  "VI",
  "WS",
  "YE",
  "ZA",
  "ZW",
|];

// not needed as this becomes the default
/*
 let startsOnMonday = [|
   "AD",
   "AI",
   "AL",
   "AM",
   "AN",
   "AR",
   "AT",
   "AX",
   "AZ",
   "BA",
   "BE",
   "BG",
   "BM",
   "BN",
   "BY",
   "CH",
   "CL",
   "CM",
   "CR",
   "CY",
   "CZ",
   "DE",
   "DK",
   "EC",
   "EE",
   "ES",
   "FI",
   "FJ",
   "FO",
   "FR",
   "GB",
   "GE",
   "GF",
   "GP",
   "GR",
   "HR",
   "HU",
   "IE",
   "IS",
   "IT",
   "KG",
   "KZ",
   "LB",
   "LI",
   "LK",
   "LT",
   "LU",
   "LV",
   "MC",
   "MD",
   "ME",
   "MK",
   "MN",
   "MQ",
   "MY",
   "NL",
   "NO",
   "NZ",
   "PL",
   "RE",
   "RO",
   "RS",
   "RU",
   "SE",
   "SI",
   "SK",
   "SM",
   "TJ",
   "TM",
   "TR",
   "UA",
   "UY",
   "UZ",
   "VA",
   "VN",
   "XK",
 |];
 */
let firstDayOfWeek = () => {
  open Js.Array2;
  let country = ReactNativeLocalize.getCountry();
  if (startsOnFriday->includes(country)) {
    5;
  } else if (startsOnSaturday->includes(country)) {
    6;
  } else if (startsOnSunday->includes(country)) {
    0;
  } else {
    1;
  };
};

let firstDayOfWeekDate = (givenDate: t) => {
  let dayOfWeek = givenDate->getDay->int_of_float;
  let firstDayOfWeekDate = givenDate->copy;
  let firstDayOfWeek = firstDayOfWeek();
  let diff =
    dayOfWeek >= firstDayOfWeek ? dayOfWeek - firstDayOfWeek : 6 - dayOfWeek;

  firstDayOfWeekDate->setDate(givenDate->getDate -. diff->float)->ignore;
  firstDayOfWeekDate
  ->setHoursMSMs(~hours=0., ~minutes=0., ~seconds=0., ~milliseconds=0., ())
  ->ignore;

  firstDayOfWeekDate;
};

let lastDayOfWeekDate = (givenDate: t) => {
  let fdow = firstDayOfWeekDate(givenDate);
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

let weekDates = date => {
  (firstDayOfWeekDate(date), lastDayOfWeekDate(date));
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
