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
    | Min
    | Max;
  type serializableT = int;

  let serializedMin: serializableT = 0;
  let serializedMax: serializableT = 1;

  let fromSerialized = tS =>
    if (tS == serializedMin) {
      Some(Min);
    } else if (tS == serializedMax) {
      Some(Max);
    } else {
      None;
    };

  let toSerialized =
    fun
    | Min => serializedMin
    | Max => serializedMax;
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
