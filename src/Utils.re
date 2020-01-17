open Belt;

let rotate = (string, value) =>
  string
  ->Js.String.castToArrayLike
  ->Js.Array2.fromMap(char =>
      (Js.String.charCodeAt(0, char)->int_of_float + value)
      ->Js.String.fromCharCode
    )
  ->Array.reduce("", (s, c) => s ++ c);

let idSep = "@";

let makeId = (title, createdAt) => {
  let string = title ++ idSep ++ createdAt->Js.Float.toString;
  string->rotate(1);
};

let decodeId = string => string->rotate(-1);
