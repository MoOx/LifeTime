open ReactNative

let useDebounce = () => {
  let (debouced, debounced_set) = React.useState(() => false)
  React.useEffect1(() => {
    AnimationFrame.request(() => {
      debounced_set(_ => true)
    })->ignore
    None
  }, [debounced_set])
  debouced
}
