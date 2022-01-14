open ReactNative

let useAppState = () => {
  let (previous, previous_set) = React.useState(() => AppState.currentState)
  let (current, current_set) = React.useState(() => AppState.currentState)
  React.useEffect3(() => {
    let evt = AppState.addEventListener(
      #change(
        state => {
          previous_set(_ => current)
          current_set(_ => state)
          Log.info(("useAppState: ", state, "(was", current, ")"))
        },
      ),
    )
    Some(() => evt->EventSubscription.remove)
  }, (current, previous_set, current_set))
  (current, previous)
}

let useAppStateUpdateIsActive = () => {
  let (isActive, isActive_set) = React.useState(() => false)
  React.useEffect2(() => {
    let evt = AppState.addEventListener(
      #change(
        state => {
          isActive_set(_ => state === #active)
        },
      ),
    )
    Some(() => evt->EventSubscription.remove)
  }, (isActive, isActive_set))
  isActive
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
      ->FuturePromise.fromPromise
      ->Future.mapError(e => {
        Log.warn(e)
        e
      })
      ->Future.tapOk(v => change(v))
      ->ignore
      let evt = AccessibilityInfo.addEventListener(#screenReaderChanged(change))
      Some(() => evt->EventSubscription.remove)
    }
  }, [setScreenReaderState])

  isScreenReaderEnabled
}
