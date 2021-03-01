open ReactNative

let useAppState = () => {
  let (appState, appState_set) = React.useState(() => AppState.currentState)
  React.useEffect1(() => {
    let onChange = state => {
      Js.log(("[LifeTime] useAppState: ", state))
      appState_set(_ => state)
    }
    AppState.addEventListener(#change(onChange))
    Some(() => AppState.removeEventListener(#change(onChange)))
  }, [appState_set])
  appState
}

@bs.val external process: 'a = "process"

let useScreenReaderEnabled = () => {
  let (isScreenReaderEnabled, setScreenReaderState) = React.useState(() => false)

  React.useEffect1(() => {
    if process["env"]["NODE_ENV"] === "test" {
      None
    } else {
      let change = isScreenReaderEnabled => {
        setScreenReaderState(_ => isScreenReaderEnabled)
      }
      AccessibilityInfo.isScreenReaderEnabled()->FutureJs.fromPromise(e => {
        Js.Console.warn(e)
        e
      })->Future.tapOk(v => change(v))->ignore
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
