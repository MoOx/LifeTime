module DarkModeProvider = {
  @react.component @module("react-native-dark-mode")
  external make: (~mode: string=?, ~children: React.element=?) => React.element = "DarkModeProvider"
}

@module("react-native-dark-mode")
external useDarkMode: unit => bool = "useDarkMode"
