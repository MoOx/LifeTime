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
