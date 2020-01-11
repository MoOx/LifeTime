open ReactNative;
open ReactNative.Style;
open ReactMultiversal;

type acceptedMode = [ | `light | `dark | `auto];
type t = [ | `light | `dark];

type rnStyleSheet('a) = Js.t('a);
type themeStyles('a) = {
  light: rnStyleSheet('a),
  dark: rnStyleSheet('a),
};

type colors = {
  background: string,
  backgroundDark: string,
  textOnBackground: string,
  textVeryLightOnBackground: string,
  textLightOnBackground: string,
  textLightOnBackgroundDark: string,
  main: string,
  textOnMain: string,
};

module Colors = {
  let light: colors = {
    background: "#fff",
    backgroundDark: Predefined.Colors.Ios.light.gray6,
    textOnBackground: "#111",
    textLightOnBackground: Predefined.Colors.Ios.light.gray,
    textVeryLightOnBackground: Predefined.Colors.Ios.light.gray2,
    textLightOnBackgroundDark: "rgba(0,0,0,0.5)",
    main: Predefined.Colors.Ios.light.indigo,
    textOnMain: "#fff",
  };
  let dark: colors = {
    background: Predefined.Colors.Ios.dark.gray6,
    backgroundDark: "#111",
    textOnBackground: "rgba(255,255,255,0.98)",
    textLightOnBackground: Predefined.Colors.Ios.light.gray,
    textVeryLightOnBackground: Predefined.Colors.Ios.light.gray2,
    textLightOnBackgroundDark: "rgba(255,255,255,0.5)",
    main: Predefined.Colors.Ios.dark.indigo,
    textOnMain: "rgba(255,255,255,0.98)",
  };
};

let themedColors = theme => {
  switch (theme) {
  | `light => Predefined.Colors.Ios.light
  | `dark => Predefined.Colors.Ios.dark
  };
};

let themedStatusBarStyle = (theme, barStyle) => {
  switch (theme, barStyle) {
  | (`light, `lightContent) => `lightContent
  | (`light, `darkContent) => `darkContent
  | (`dark, `darkContent) => `lightContent
  | (`dark, `lightContent) => `darkContent
  };
};

type fontWeightNumeric = [
  | `bold
  | `normal
  | `_100
  | `_200
  | `_300
  | `_400
  | `_500
  | `_600
  | `_700
  | `_800
  | `_900
];

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
};

let fontWeights = {
  thin: `_100,
  ultraLight: `_200,
  light: `_300,
  regular: `_400,
  medium: `_500,
  semiBold: `_600,
  bold: `_700,
  heavy: `_800,
  black: `_900,
};

let text =
  {
    "largeTitle":
      textStyle(
        ~fontSize=34.,
        ~lineHeight=41.,
        ~letterSpacing=0.37,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "title1":
      textStyle(
        ~fontSize=28.,
        ~lineHeight=34.,
        ~letterSpacing=0.36,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "title2":
      textStyle(
        ~fontSize=22.,
        ~lineHeight=28.,
        ~letterSpacing=0.35,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "title3":
      textStyle(
        ~fontSize=20.,
        ~lineHeight=24.,
        ~letterSpacing=0.38,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "headline":
      textStyle(
        ~fontSize=17.,
        ~lineHeight=22.,
        ~letterSpacing=-0.41,
        ~fontWeight=fontWeights.semiBold,
        (),
      ),
    "body":
      textStyle(
        ~fontSize=17.,
        ~lineHeight=22.,
        ~letterSpacing=-0.41,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "callout":
      textStyle(
        ~fontSize=16.,
        ~lineHeight=21.,
        ~letterSpacing=-0.32,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "subhead":
      textStyle(
        ~fontSize=15.,
        ~lineHeight=20.,
        ~letterSpacing=-0.24,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "footnote":
      textStyle(
        ~fontSize=13.,
        ~lineHeight=18.,
        ~letterSpacing=-0.08,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "caption1":
      textStyle(
        ~fontSize=12.,
        ~lineHeight=16.,
        ~letterSpacing=0.,
        ~fontWeight=fontWeights.regular,
        (),
      ),
    "caption2":
      textStyle(
        ~fontSize=11.,
        ~lineHeight=13.,
        ~letterSpacing=0.07,
        ~fontWeight=fontWeights.regular,
        (),
      ),
  }
  ->StyleSheet.create;

let themeStyles = {
  light:
    StyleSheet.create({
      "backgroundMain": viewStyle(~backgroundColor=Colors.light.main, ()),
      "background": viewStyle(~backgroundColor=Colors.light.background, ()),
      "separatorOnBackground":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray4, ()),
      "backgroundDark":
        viewStyle(~backgroundColor=Colors.light.backgroundDark, ()),
      "separatorOnBackgroundDark":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray4, ()),
      "backgroundGray":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray, ()),
      "backgroundGray2":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray2, ()),
      "backgroundGray3":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray3, ()),
      "backgroundGray4":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray4, ()),
      "backgroundGray5":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray5, ()),
      "backgroundGray6":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.light.gray6, ()),
      "textGray": textStyle(~color=Predefined.Colors.Ios.light.gray, ()),
      "textGray2": textStyle(~color=Predefined.Colors.Ios.light.gray2, ()),
      "textGray3": textStyle(~color=Predefined.Colors.Ios.light.gray3, ()),
      "textGray4": textStyle(~color=Predefined.Colors.Ios.light.gray4, ()),
      "textGray5": textStyle(~color=Predefined.Colors.Ios.light.gray5, ()),
      "textGray6": textStyle(~color=Predefined.Colors.Ios.light.gray6, ()),
      "textBlue": textStyle(~color=Predefined.Colors.Ios.light.blue, ()),
      "textOnBackground": textStyle(~color=Colors.light.textOnBackground, ()),
      "textLightOnBackground":
        textStyle(~color=Colors.light.textLightOnBackground, ()),
      "textVeryLightOnBackground":
        textStyle(~color=Colors.light.textVeryLightOnBackground, ()),
      "textLightOnBackgroundDark":
        textStyle(~color=Colors.light.textLightOnBackgroundDark, ()),
      "textMain": textStyle(~color=Colors.light.main, ()),
      "textOnMain": textStyle(~color=Colors.light.textOnMain, ()),
      "textButton": textStyle(~color=Predefined.Colors.Ios.light.blue, ()),
      "stackHeader":
        viewStyle(
          ~backgroundColor=Colors.light.background,
          ~borderBottomColor=Predefined.Colors.Ios.light.gray4,
          ~shadowColor=Predefined.Colors.Ios.light.gray4,
          (),
        ),
    }),
  dark:
    StyleSheet.create({
      "backgroundMain": viewStyle(~backgroundColor=Colors.dark.main, ()),
      "background": viewStyle(~backgroundColor=Colors.dark.background, ()),
      "separatorOnBackground":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray3, ()),
      "backgroundDark":
        viewStyle(~backgroundColor=Colors.dark.backgroundDark, ()),
      "separatorOnBackgroundDark":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray4, ()),
      "backgroundGray":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray, ()),
      "backgroundGray2":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray2, ()),
      "backgroundGray3":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray3, ()),
      "backgroundGray4":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray4, ()),
      "backgroundGray5":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray5, ()),
      "backgroundGray6":
        viewStyle(~backgroundColor=Predefined.Colors.Ios.dark.gray6, ()),
      "textGray": textStyle(~color=Predefined.Colors.Ios.dark.gray, ()),
      "textGray2": textStyle(~color=Predefined.Colors.Ios.dark.gray2, ()),
      "textGray3": textStyle(~color=Predefined.Colors.Ios.dark.gray3, ()),
      "textGray4": textStyle(~color=Predefined.Colors.Ios.dark.gray4, ()),
      "textGray5": textStyle(~color=Predefined.Colors.Ios.dark.gray5, ()),
      "textGray6": textStyle(~color=Predefined.Colors.Ios.dark.gray6, ()),
      "textBlue": textStyle(~color=Predefined.Colors.Ios.dark.blue, ()),
      "textOnBackground": textStyle(~color=Colors.dark.textOnBackground, ()),
      "textVeryLightOnBackground":
        textStyle(~color=Colors.dark.textVeryLightOnBackground, ()),
      "textLightOnBackground":
        textStyle(~color=Colors.dark.textLightOnBackground, ()),
      "textLightOnBackgroundDark":
        textStyle(~color=Colors.dark.textLightOnBackgroundDark, ()),
      "textMain": textStyle(~color=Colors.dark.main, ()),
      "textOnMain": textStyle(~color=Colors.dark.textOnMain, ()),
      "textButton": textStyle(~color=Predefined.Colors.Ios.dark.blue, ()),
      "stackHeader":
        viewStyle(
          ~backgroundColor=Colors.dark.background,
          ~borderBottomColor=Predefined.Colors.Ios.dark.gray4,
          ~shadowColor=Predefined.Colors.Ios.dark.gray4,
          (),
        ),
    }),
};

let useTheme = (): t => {
  let (settings, _setSettings) = React.useContext(AppSettings.context);
  let mode = settings##theme->AppSettings.themeStringToTheme;
  let autoMode = ReactNativeDarkMode.useDarkMode();
  switch (mode) {
  | `auto =>
    switch (autoMode) {
    | true => `dark
    | _ => `light
    }
  | `light => `light
  | `dark => `dark
  };
};

let useStyles = (): rnStyleSheet('a) => {
  let theme = useTheme();
  switch (theme) {
  | `light => themeStyles.light
  | `dark => themeStyles.dark
  };
};

let useColors = () => {
  let theme = useTheme();
  switch (theme) {
  | `light => Predefined.Colors.Ios.light
  | `dark => Predefined.Colors.Ios.dark
  };
};

module Radius = {
  let button = 10.;
};
