type id = string;

module Colors = {
  let good = "rgb(216, 255, 1)";
  let ok = "rgb(153, 255, 0)";
  let alert = ReactMultiversal.Predefined.Colors.Ios.light.yellow;
  let danger = ReactMultiversal.Predefined.Colors.Ios.light.orange;
  let bad = ReactMultiversal.Predefined.Colors.Ios.light.red;
};

module Type = {
  type t =
    | Goal
    | Limit;
  type serializableT = int;

  let serializedGoal: serializableT = 0;
  let serializedLimit: serializableT = 1;

  let fromSerialized = tS =>
    if (tS == serializedGoal) {
      Some(Goal);
    } else if (tS == serializedLimit) {
      Some(Limit);
    } else {
      None;
    };

  let toSerialized =
    fun
    | Goal => serializedGoal
    | Limit => serializedLimit;
};

type t = {
  id,
  title: string,
  createdAt: float,
  type_: Type.serializableT,
  days: array(bool),
  durationPerDay: float,
  categoriesId: array(ActivityCategories.id),
  activitiesId: array(Activities.id),
};

let make =
    (title, type_: Type.t, durationPerDay, days, categoriesId, activitiesId) => {
  let createdAt = Js.Date.now();
  {
    id: Utils.makeId(title, createdAt),
    title,
    type_: type_->Type.toSerialized,
    createdAt,
    days,
    durationPerDay,
    categoriesId,
    activitiesId,
  };
};
