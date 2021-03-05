open ReactNative

let useAppState = () => {
  let (previous, previous_set) = React.useState(() => AppState.currentState)
  let (current, current_set) = React.useState(() => AppState.currentState)
  React.useEffect3(() => {
    let onChange = state => {
      previous_set(_ => current)
      current_set(_ => state)
      Log.info(("useAppState: ", state, "(was ", current, ")"))
    }
    AppState.addEventListener(#change(onChange))
    Some(() => AppState.removeEventListener(#change(onChange)))
  }, (current, previous_set, current_set))
  (current, previous)
}

@val external process: 'a = "process"

let useScreenReaderEnabled = () => {
  let (isScreenReaderEnabled, setScreenReaderState) = React.useState(() => false)

  React.useEffect1(() => {
    if process["env"]["NODE_ENV"] === "test" {
      None
    } else {
      let change = isScreenReaderEnabled => {
        setScreenReaderState(_ => isScreenReaderEnabled)
      }
      AccessibilityInfo.isScreenReaderEnabled()
      ->FutureJs.fromPromise(e => {
        Log.warn(e)
        e
      })
      ->Future.tapOk(v => change(v))
      ->ignore
      AccessibilityInfo.addEventListener(#screenReaderChanged(change))
      Some(
        () => {
          AccessibilityInfo.removeEventListener(#screenReaderChanged(change))
        },
      )
    }
  }, [setScreenReaderState])

  isScreenReaderEnabled
}
