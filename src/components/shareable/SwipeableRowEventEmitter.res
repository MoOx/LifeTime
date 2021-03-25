type emitter

type listener

@send
external remove: listener => unit = "remove"

@send
external addListener: (emitter, @string [#autoClose(option<string> => unit)]) => listener =
  "addListener"

@send
external emit: (emitter, @string [#autoClose(option<string>)]) => unit = "emit"

@module("fbemitter") @new external eventEmitter: unit => emitter = "EventEmitter"

let emitter = eventEmitter()
