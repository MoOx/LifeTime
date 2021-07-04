open Belt

type id = string

module Colors = {
  let good = "rgb(216, 255, 1)"
  let ok = "rgb(153, 255, 0)"
  let alert = ReactMultiversal.Predefined.Colors.Ios.light.yellow
  let danger = ReactMultiversal.Predefined.Colors.Ios.light.orange
  let bad = ReactMultiversal.Predefined.Colors.Ios.light.red
}

module Type = {
  type t =
    | Goal
    | Limit
  type serializableT = int

  let serializedGoal: serializableT = 0
  let serializedLimit: serializableT = 1

  let fromSerialized = tS =>
    if tS == serializedGoal {
      Some(Goal)
    } else if tS == serializedLimit {
      Some(Limit)
    } else {
      None
    }

  let toSerialized = x =>
    switch x {
    | Goal => serializedGoal
    | Limit => serializedLimit
    }
}

type period = [#day | #week | #month | #year]
type serialisedPeriod = int
let serialisedPeriodDay = 0
let serialisedPeriodWeek = 1
let serialisedPeriodMonth = 2
let serialisedPeriodYear = 3
let fromSerializedPeriodToPeriod = sp => {
  if sp == serialisedPeriodDay {
    #day
  } else if sp == serialisedPeriodWeek {
    #week
  } else if sp == serialisedPeriodMonth {
    #month
  } else if sp == serialisedPeriodYear {
    #year
  } else {
    #week
  }
}
let fromPeriodToSerializedPeriod = p =>
  switch p {
  | #day => serialisedPeriodDay
  | #week => serialisedPeriodWeek
  | #month => serialisedPeriodMonth
  | #year => serialisedPeriodYear
  }

type t = {
  id: id,
  title: string,
  createdAt: float,
  mode: Type.serializableT,
  days: array<bool>,
  durationPerDay: float,
  categoriesId: array<ActivityCategories.id>,
  activitiesId: array<Activities.id>,
  period: serialisedPeriod,
}

let undefined = {
  id: "",
  title: "",
  mode: Type.Goal->Type.toSerialized,
  createdAt: 0.,
  days: Array.range(0, 6)->Array.map(_ => true),
  durationPerDay: 0.,
  categoriesId: [],
  activitiesId: [],
  period: #week->fromPeriodToSerializedPeriod,
}

let make = (
  ~title,
  ~mode: Type.t,
  ~durationPerDay,
  ~days,
  ~categoriesId,
  ~activitiesId,
  ~period,
) => {
  let createdAt = Js.Date.now()
  {
    id: Utils.makeId(title, createdAt),
    title: title,
    mode: mode->Type.toSerialized,
    createdAt: createdAt,
    days: days,
    durationPerDay: durationPerDay,
    categoriesId: categoriesId,
    activitiesId: activitiesId,
    period: period->fromPeriodToSerializedPeriod,
  }
}
