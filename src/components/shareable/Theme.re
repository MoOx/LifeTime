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
    textLightOnBackground: Predefined.Colors.Ios.light.gray2,
    textLightOnBackgroundDark: Predefined.Colors.Ios.light.gray,
    main: Predefined.Colors.Ios.light.indigo,
    textOnMain: "#fff",
  };
  let dark: colors = {
    background: Predefined.Colors.Ios.dark.gray6,
    backgroundDark: "#111",
    textOnBackground: "rgba(255,255,255,0.9)",
    textLightOnBackground: Predefined.Colors.Ios.light.gray2,
    textLightOnBackgroundDark: Predefined.Colors.Ios.light.gray,
    main: Predefined.Colors.Ios.dark.indigo,
    textOnMain: "rgba(255,255,255,0.9)",
  };
};

let themeStyles =
  ReactNative.(
    Style.{
      light:
        StyleSheet.create({
          "backgroundMain": viewStyle(~backgroundColor=Colors.light.main, ()),
          "background":
            viewStyle(~backgroundColor=Colors.light.background, ()),
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
          "textGray2":
            textStyle(~color=Predefined.Colors.Ios.light.gray2, ()),
          "textGray3":
            textStyle(~color=Predefined.Colors.Ios.light.gray3, ()),
          "textGray4":
            textStyle(~color=Predefined.Colors.Ios.light.gray4, ()),
          "textGray5":
            textStyle(~color=Predefined.Colors.Ios.light.gray5, ()),
          "textGray6":
            textStyle(~color=Predefined.Colors.Ios.light.gray6, ()),
          "textBlue": textStyle(~color=Predefined.Colors.Ios.light.blue, ()),
          "textOnBackground":
            textStyle(~color=Colors.light.textOnBackground, ()),
          "textLightOnBackground":
            textStyle(~color=Colors.light.textLightOnBackground, ()),
          "textLightOnBackgroundDark":
            textStyle(~color=Colors.light.textLightOnBackgroundDark, ()),
          "textMain": textStyle(~color=Colors.light.main, ()),
          "textOnMain": textStyle(~color=Colors.light.textOnMain, ()),
          "textButton":
            textStyle(~color=Predefined.Colors.Ios.light.blue, ()),
        }),
      dark:
        StyleSheet.create({
          "backgroundMain": viewStyle(~backgroundColor=Colors.dark.main, ()),
          "background":
            viewStyle(~backgroundColor=Colors.dark.background, ()),
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
          "textOnBackground":
            textStyle(~color=Colors.dark.textOnBackground, ()),
          "textLightOnBackground":
            textStyle(~color=Colors.dark.textLightOnBackground, ()),
          "textLightOnBackgroundDark":
            textStyle(~color=Colors.dark.textLightOnBackgroundDark, ()),
          "textMain": textStyle(~color=Colors.dark.main, ()),
          "textOnMain": textStyle(~color=Colors.dark.textOnMain, ()),
          "textButton": textStyle(~color=Predefined.Colors.Ios.dark.blue, ()),
        }),
    }
  );

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
