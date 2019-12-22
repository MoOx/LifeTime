let now = () => Js.Date.(fromFloat(now()));

let dayLongString = date => {
  switch (date->Js.Date.getDay) {
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
  switch (date->Js.Date.getMonth +. 1.) {
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

let dateString = date => {
  date->Js.Date.getDate->Js.Float.toString;
};
