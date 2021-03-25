open ReactNative
open ReactNative.Style
open ReactMultiversal

type acceptedMode = [#light | #dark | #auto]
type t = [#light | #dark]

type styleSheet<'a> = Js.t<'a>
type styleSheets<'a> = {
  light: styleSheet<'a>,
  dark: styleSheet<'a>,
}

type colors = {
  background: string,
  backgroundDark: string,
  main: string,
  text: string,
  textLight1: string,
  textLight2: string,
  textOnDarkLight: string,
  textOnMain: string,
}

module Colors = {
  let light: colors = {
    background: "#fff",
    backgroundDark: "#f2f2f7",
    main: Predefined.Colors.Ios.light.indigo,
    text: "#111",
    textLight1: Predefined.Colors.Ios.light.gray,
    textLight2: Predefined.Colors.Ios.light.gray2,
    textOnDarkLight: "rgba(0,0,0,0.5)",
    textOnMain: "#fff",
  }
  let dark: colors = {
    background: Predefined.Colors.Ios.dark.gray6,
    backgroundDark: "#000",
    main: Predefined.Colors.Ios.dark.indigo,
    text: "rgba(255,255,255,0.98)",
    textLight1: Predefined.Colors.Ios.light.gray,
    textLight2: Predefined.Colors.Ios.light.gray2,
    textOnDarkLight: "rgba(255,255,255,0.5)",
    textOnMain: "rgba(255,255,255,0.98)",
  }
}

let colors = theme =>
  switch theme {
  | #light => Predefined.Colors.Ios.light
  | #dark => Predefined.Colors.Ios.dark
  }

@module("react-native") @scope("Platform")
external versionIos: string = "Version"
@module("react-native") @scope("Platform")
external versionAndroid: int = "Version"

let barsStyle = (theme, barStyle) =>
  switch (theme, barStyle) {
  | (#light, #lightContent) => #\"light-content"
  | (#light, #darkContent) => #\"dark-content"
  | (#dark, #darkContent) => #\"light-content"
  | (#dark, #lightContent) => #\"dark-content"
  }

let barStyle = (theme, barStyle) =>
  switch (theme, barStyle) {
  | (#light, #lightContent) => #lightContent
  | (#light, #darkContent) => #darkContent
  | (#dark, #darkContent) => #lightContent
  | (#dark, #lightContent) => #darkContent
  }

let isFormSheetSupported = Platform.os === Platform.ios && versionIos > "13"

let formSheetSafeArea = isFormSheetSupported ? false : true

type fontWeightNumeric = [
  | #bold
  | #normal
  | #_100
  | #_200
  | #_300
  | #_400
  | #_500
  | #_600
  | #_700
  | #_800
  | #_900
]

type fontWeights = {
  thin: fontWeightNumeric,
  ultraLight: fontWeightNumeric,
  light: fontWeightNumeric,
  regular: fontWeightNumeric,
  medium: fontWeightNumeric,
  semiBold: fontWeightNumeric,
  bold: fontWeightNumeric,
  heavy: fontWeightNumeric,
  black: fontWeightNumeric,
}

let fontWeights = {
  thin: #_100,
  ultraLight: #_200,
  light: #_300,
  regular: #_400,
  medium: #_500,
  semiBold: #_600,
  bold: #_700,
  heavy: #_800,
  black: #_900,
}

let text = {
  "largeTitle": textStyle(~fontSize=34., ~lineHeight=41., ~letterSpacing=0.37, ()),
  "title1": textStyle(~fontSize=28., ~lineHeight=34., ~letterSpacing=0.36, ()),
  "title2": textStyle(~fontSize=22., ~lineHeight=28., ~letterSpacing=0.35, ()),
  "title3": textStyle(~fontSize=20., ~lineHeight=24., ~letterSpacing=0.38, ()),
  "headline": textStyle(~fontSize=17., ~lineHeight=22., ~letterSpacing=-0.41, ()),
  "body": textStyle(~fontSize=17., ~lineHeight=22., ~letterSpacing=-0.41, ()),
  "callout": textStyle(~fontSize=16., ~lineHeight=21., ~letterSpacing=-0.32, ()),
  "subhead": textStyle(~fontSize=15., ~lineHeight=20., ~letterSpacing=-0.24, ()),
  "footnote": textStyle(~fontSize=13., ~lineHeight=18., ~letterSpacing=-0.08, ()),
  "caption1": textStyle(~fontSize=12., ~lineHeight=16., ~letterSpacing=0., ()),
  "caption2": textStyle(~fontSize=11., ~lineHeight=13., ~letterSpacing=0.07, ()),
  // iOS: no comment, weight are perfect
  // Android: only has 100/300/400/500/700/900
  // it's a fucking total mess depanding on brands...
  // Oppo (ColorsOS) is supposed to have roboto (which it has, but doesn't handle all fontName/fontWeight exactly like Pixel)
  // OnePlus have 6 variants like Roboto, but in practise, it's impossible (using generic sans-serif-* variant name) to have a similar mapping
  // some render sans-serif-bold without weight as regular, when some with fontWeight 700 as heavy
  // and each OS flavor have their own weirdness
  // Recap feeling (according to mapping below made on
  //    stock: vanilla android (pixel 3)
  //    colorsos: oppo A15
  //    oxygenos: oneplus n100
  // key | st. | oppo | 1+
  // 100 | 100 | 100 | 200
  // 200 | 300 | 300 | 300
  // 300 | 300 | 300 | 300
  // 400 | 400 | 400 | 400
  // 500 | 500 | 500 | 500
  // 600 | 500 | 500 | 500
  // 700 | 700 | 700 | 700
  // 800 | 700 | 700 | 900
  // 900 | 800 | 800 | 900
  "weight100": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif-thin", ~fontWeight=#_100, ())
    : textStyle(~fontWeight=#_100, ()),
  "weight200": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif-light", ~fontWeight=#_200, ())
    : textStyle(~fontWeight=#_200, ()),
  "weight300": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif-light", ~fontWeight=#_300, ())
    : textStyle(~fontWeight=#_300, ()),
  "weight400": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif", ~fontWeight=#_400, ())
    : textStyle(~fontWeight=#_400, ()),
  "weight500": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif-medium", ~fontWeight=#_500, ())
    : textStyle(~fontWeight=#_500, ()),
  "weight600": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif-medium", ~fontWeight=#_600, ())
    : textStyle(~fontWeight=#_600, ()),
  // reminder: oneplus handle sans-serif-regular / 700 != sans-serif / 700 !!
  "weight700": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif-regular", ~fontWeight=#_700, ())
    : textStyle(~fontWeight=#_700, ()),
  "weight800": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif-bold", ~fontWeight=#_700, ())
    : textStyle(~fontWeight=#_800, ()),
  "weight900": Platform.os === Platform.android
    ? textStyle(~fontFamily="sans-serif-black", ~fontWeight=#_900, ())
    : textStyle(~fontWeight=#_900, ()),
}->StyleSheet.create

let styleSheets = {
  light: {
    "background": viewStyle(~backgroundColor=Colors.light.background, ()),
    "backgroundDark": viewStyle(~backgroundColor=Colors.light.backgroundDark, ()),
    "backgroundGray": viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray, ()),
    "backgroundGray2": viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray2, ()),
    "backgroundGray3": viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray3, ()),
    "backgroundGray4": viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray4, ()),
    "backgroundGray5": viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray5, ()),
    "backgroundGray6": viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray6, ()),
    "backgroundMain": viewStyle(~backgroundColor=Colors.light.main, ()),
    "separatorOnBackground": viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray3, ()),
    "separatorLightOnBackground": viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray4, ()),
    "stackHeader": viewStyle(
      ~backgroundColor=Colors.light.background,
      ~borderBottomColor=Predefined.Colors.Ios.light.gray4,
      ~shadowColor=Predefined.Colors.Ios.light.gray4,
      (),
    ),
    "text": textStyle(~color=Colors.light.text, ()),
    "textBlue": textStyle(~color=Predefined.Colors.Ios.light.blue, ()),
    "textButton": textStyle(~color=Predefined.Colors.Ios.light.blue, ()),
    "textGray": textStyle(~color=Predefined.Colors.Ios.light.gray, ()),
    "textGray2": textStyle(~color=Predefined.Colors.Ios.light.gray2, ()),
    "textGray3": textStyle(~color=Predefined.Colors.Ios.light.gray3, ()),
    "textGray4": textStyle(~color=Predefined.Colors.Ios.light.gray4, ()),
    "textGray5": textStyle(~color=Predefined.Colors.Ios.light.gray5, ()),
    "textGray6": textStyle(~color=Predefined.Colors.Ios.light.gray6, ()),
    "textLight1": textStyle(~color=Colors.light.textLight1, ()),
    "textLight2": textStyle(~color=Colors.light.textLight2, ()),
    "textMain": textStyle(~color=Colors.light.main, ()),
    "textOnDarkLight": textStyle(~color=Colors.light.textOnDarkLight, ()),
    "textOnMain": textStyle(~color=Colors.light.textOnMain, ()),
  }->StyleSheet.create,
  dark: {
    "background": viewStyle(~backgroundColor=Colors.dark.background, ()),
    "backgroundDark": viewStyle(~backgroundColor=Colors.dark.backgroundDark, ()),
    "backgroundGray": viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray, ()),
    "backgroundGray2": viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray2, ()),
    "backgroundGray3": viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray3, ()),
    "backgroundGray4": viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray4, ()),
    "backgroundGray5": viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray5, ()),
    "backgroundGray6": viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray6, ()),
    "backgroundMain": viewStyle(~backgroundColor=Colors.dark.main, ()),
    "separatorOnBackground": viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray4, ()),
    "separatorLightOnBackground": viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray5, ()),
    "stackHeader": viewStyle(
      ~backgroundColor=Colors.dark.background,
      ~borderBottomColor=Predefined.Colors.Ios.dark.gray4,
      ~shadowColor=Predefined.Colors.Ios.dark.gray4,
      (),
    ),
    "text": textStyle(~color=Colors.dark.text, ()),
    "textBlue": textStyle(~color=Predefined.Colors.Ios.dark.blue, ()),
    "textButton": textStyle(~color=Predefined.Colors.Ios.dark.blue, ()),
    "textGray": textStyle(~color=Predefined.Colors.Ios.dark.gray, ()),
    "textGray2": textStyle(~color=Predefined.Colors.Ios.dark.gray2, ()),
    "textGray3": textStyle(~color=Predefined.Colors.Ios.dark.gray3, ()),
    "textGray4": textStyle(~color=Predefined.Colors.Ios.dark.gray4, ()),
    "textGray5": textStyle(~color=Predefined.Colors.Ios.dark.gray5, ()),
    "textGray6": textStyle(~color=Predefined.Colors.Ios.dark.gray6, ()),
    "textLight1": textStyle(~color=Colors.dark.textLight1, ()),
    "textLight2": textStyle(~color=Colors.dark.textLight2, ()),
    "textMain": textStyle(~color=Colors.dark.main, ()),
    "textOnDarkLight": textStyle(~color=Colors.dark.textOnDarkLight, ()),
    "textOnMain": textStyle(~color=Colors.dark.textOnMain, ()),
  }->StyleSheet.create,
}

type themeData<'a> = {
  mode: t,
  styles: styleSheet<'a>,
  colors: Predefined.Colors.Ios.t,
  namedColors: colors,
}

type themes<'a> = {
  light: themeData<'a>,
  dark: themeData<'a>,
}
let themes = {
  light: {
    mode: #light,
    styles: styleSheets.light,
    colors: Predefined.Colors.Ios.light,
    namedColors: Colors.light,
  },
  dark: {
    mode: #dark,
    styles: styleSheets.dark,
    colors: Predefined.Colors.Ios.dark,
    namedColors: Colors.dark,
  },
}

let useTheme = (acceptedMode): themeData<'a> => {
  let colorScheme = Appearance.useColorScheme()->Js.Null.toOption
  let mode = switch acceptedMode {
  | #auto =>
    switch colorScheme {
    | Some(#dark) => #dark
    | _ => #light
    }
  | #light => #light
  | #dark => #dark
  }
  switch mode {
  | #light => themes.light
  | #dark => themes.dark
  }
}

module Radius = {
  let button = 10.
  let card = 6.
}
