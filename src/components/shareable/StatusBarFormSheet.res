@react.component
let make = () => {
  Theme.isFormSheetSupported ? <ReactNative.StatusBar barStyle=#lightContent /> : React.null
}
