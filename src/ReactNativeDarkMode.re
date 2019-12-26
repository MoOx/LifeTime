module DarkModeProvider = {
  [@react.component] [@bs.module "react-native-dark-mode"]
  external make: (~mode: string=?, ~children: React.element=?) => React.element =
    "DarkModeProvider";
};

[@bs.module "react-native-dark-mode"]
external useDarkMode: unit => bool = "useDarkMode";
