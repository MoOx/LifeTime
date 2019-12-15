// open ReactMultiversal;

type t = [ | `light | `dark];

type rnStyleSheet('a) = Js.t('a);
type dynamicStyles('a) = {
  light: rnStyleSheet('a),
  dark: rnStyleSheet('a),
};

type colors = {
  background: string,
  backgroundDark: string,
  textOnBackground: string,
  textLightOnBackground: string,
  main: string,
  textOnMain: string,
};

module Colors = {
  module Ios = {
    type t = {
      blue: string,
      green: string,
      indigo: string,
      orange: string,
      pink: string,
      purple: string,
      red: string,
      teal: string,
      yellow: string,
      gray: string,
      gray2: string,
      gray3: string,
      gray4: string,
      gray5: string,
      gray6: string,
    };

    let light = {
      blue: "rgb(0,122,255)",
      green: "rgb(52,199,89)",
      indigo: "rgb(88,86,214)",
      orange: "rgb(255,149,0)",
      pink: "rgb(255,45,85)",
      purple: "rgb(175,82,222)",
      red: "rgb(255,59,48)",
      teal: "rgb(90,200,250)",
      yellow: "rgb(255,204,0)",

      gray: "rgb(142,142,147)",
      gray2: "rgb(174,174,178)",
      gray3: "rgb(199,199,204)",
      gray4: "rgb(209,209,214)",
      gray5: "rgb(229,229,234)",
      gray6: "rgb(242,242,247)",
    };

    let dark = {
      blue: "rgb(10,132,255)",
      green: "rgb(48,209,88)",
      indigo: "rgb(94,92,230)",
      orange: "rgb(255,159,10)",
      pink: "rgb(255,55,95)",
      purple: "rgb(191,90,242)",
      red: "rgb(255,69,58)",
      teal: "rgb(100,210,255)",
      yellow: "rgb(255,214,10)",

      gray: "rgb(142,142,147)",
      gray2: "rgb(99,99,102)",
      gray3: "rgb(72,72,74)",
      gray4: "rgb(58,58,60)",
      gray5: "rgb(44,44,46)",
      gray6: "rgb(28,28,30)",
    };
  };

  let light: colors = {
    background: "#fff",
    backgroundDark: /*Predefined.Colors.*/ Ios.light.gray6,
    textOnBackground: "#111",
    textLightOnBackground: /*Predefined.Colors.*/ Ios.light.gray2,
    main: /*Predefined.Colors.*/ Ios.light.indigo,
    textOnMain: "#fff",
  };
  let dark: colors = {
    background: /*Predefined.Colors.*/ Ios.dark.gray5,
    backgroundDark: /*Predefined.Colors.*/ Ios.dark.gray6,
    textOnBackground: "rgba(255,255,255,0.9)",
    textLightOnBackground: /*Predefined.Colors.*/ Ios.light.gray3,
    main: /*Predefined.Colors.*/ Ios.dark.indigo,
    textOnMain: "rgba(255,255,255,0.9)",
  };
};

module Radius = {
  let button = 10.;
};
