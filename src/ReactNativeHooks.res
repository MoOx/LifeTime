open ReactNative

let useAppState = () => {
  let (appState, setAppState) = React.useState(() => AppState.currentState)
  React.useEffect1(() => {
    let onChange = state => setAppState(_ => state)
    AppState.addEventListener(#change(onChange))
    Some(() => AppState.removeEventListener(#change(onChange)))
  }, [setAppState])
  appState
}
