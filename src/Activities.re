let minifyName = name => name->Js.String.toLowerCase;

let isSimilar = (a, b) => {
  a->minifyName == b->minifyName;
};

type id = string;

type t = {
  id,
  title: string,
  createdAt: float,
  categoryId: ActivityCategories.id,
};

let unknown: t = {
  id: "unknown-0",
  title: "",
  createdAt: 0.,
  categoryId: ActivityCategories.unknown,
};
