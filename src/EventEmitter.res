open Belt

let make = () => MutableMap.String.make()

let on = (emitter, eventKey, func) =>
  emitter->MutableMap.String.update(eventKey, value => Some(
    value->Option.getWithDefault([])->Array.concat([func]),
  ))

let off = (emitter, eventKey, func) =>
  emitter->MutableMap.String.update(eventKey, value => value->Option.flatMap(array => {
      let rest = array->Array.keep(v => v !== func)
      rest->Array.length === 0 ? None : Some(rest)
    }))

let emit = (emitter, eventKey, value) =>
  emitter
  ->MutableMap.String.get(eventKey)
  ->Option.map(array => array->Array.forEach(func => func(value)))
  ->ignore
