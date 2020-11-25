open Belt

type id = string
type name = string
type color = string
type icon = NamedIcon.t

type cat = (id, name, color, icon)

let unknown: id = "unknown"
let unknownCat: cat = (unknown, "Uncategorized", "gray", #bookmark)
let defaults: list<cat> = list{
  ("rest", "Rest", "indigo", #moonsymbol),
  ("food", "Nutrition", "green", #carrot),
  ("exercise", "Exercise", "pink", #workout),
  ("work", "Work", "blue", #edit),
  ("social", "Social", "orange", #social),
  ("self", "Self-care", "teal", #meditation),
  ("fun", "Entertainment", "purple", #theatremask),
  ("chores", "Chores", "yellow", #broom),
  // ("misc", "Miscellaneous", "yellow", `tag),
  unknownCat,
}

let getColor: (color, Theme.t) => string = (color, theme) => {
  let t = Theme.colors(theme)
  switch color {
  | "red" => t.red
  | "orange" => t.orange
  | "yellow" => t.yellow
  | "green" => t.green
  | "indigo" => t.indigo
  | "teal" => t.teal
  | "purple" => t.purple
  | "pink" => t.pink
  | "blue" => t.blue
  | _ => t.gray4
  }
}

let getFromId: id => cat = cid =>
  defaults
  ->List.keepMap(((id, name, color, icon)) => id == cid ? Some((id, name, color, icon)) : None)
  ->List.head
  ->Option.getWithDefault(unknownCat)

let isIdValid = cid => defaults->List.some(((id, _, _, _)) => id == cid)
