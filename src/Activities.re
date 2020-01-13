let minifyName = name => name->Js.String.toLowerCase;

let isSimilar = (a, b) => {
  a->minifyName == b->minifyName;
};

type t = {
  .
  "title": string,
  "createdAt": float,
  "categoryId": ActivityCategories.id,
};

let unknown: t = {
  "title": "",
  "createdAt": 0.,
  "categoryId": ActivityCategories.unknown,
};
