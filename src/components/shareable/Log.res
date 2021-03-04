let info = (_: 'a) => {
  %raw(
    "console.log(...(Array.isArray(arguments[0]) && arguments.length === 1 ? arguments[0] : arguments))"
  )->ignore
  ()
}

let warn = (_: 'a) => {
  %raw(
    "console.warn(...(Array.isArray(arguments[0]) && arguments.length === 1 ? arguments[0] : arguments))"
  )->ignore
  ()
}

let error = (_: 'a) => {
  %raw(
    "console.error(...(Array.isArray(arguments[0]) && arguments.length === 1 ? arguments[0] : arguments))"
  )->ignore
  ()
}
