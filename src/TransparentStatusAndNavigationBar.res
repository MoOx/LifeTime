open ReactNative

@module("react-native")
external processColor: string => string = "processColor"

type consts = {backgroundColorFallback: string} // it's not a string actually, but setBackgroundColor accepts string per bindings
@module("react-native") @scope(("NativeModules", "TransparentStatusAndNavigationBarModule"))
external getConstants: unit => consts = "getConstants"

type barsStyle = [#default | #\"light-content" | #\"dark-content"]

@module("react-native") @scope(("NativeModules", "TransparentStatusAndNavigationBarModule"))
external _setBarsStyle: barsStyle => unit = "setBarsStyle"

let init = () => {
  // this is to prepare default value for StatusBar to be set as default for component usage
  if Platform.os === Platform.android {
    StatusBar.setTranslucent(true)
    StatusBar.setBackgroundColor(getConstants().backgroundColorFallback, true)
    ()
  }
}

let setBarsStyle = (~animated: bool=true, barsStyle: barsStyle) => {
  if Platform.os === Platform.android {
    _setBarsStyle(barsStyle)
  }
  if Platform.os === Platform.ios {
    StatusBar.setBarStyle(
      switch barsStyle {
      | #default => #default
      | #\"light-content" => #lightContent
      | #\"dark-content" => #darkContent
      },
      animated,
    )
  }
}
