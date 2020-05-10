[@bs.deriving jsConverter]
type calendar = [ | `gregorian | `japanese | `buddhist];

[@bs.deriving jsConverter]
type temperatureUnit = [ | `celsius | `fahrenheit];

type locale = {
  languageCode: string,
  scriptCode: option(string),
  countryCode: string,
  languageTag: string,
  isRTL: bool,
};

type numberFormatSettings = {
  decimalSeparator: string,
  groupingSeparator: string,
};

[@bs.module "react-native-localize"]
external getCalendar_: unit => string = "getCalendar";

let getCalendar =
  getCalendar_()->calendarFromJs->Belt.Option.getWithDefault(`gregorian);

[@bs.module "react-native-localize"]
external getCountry: unit => string = "getCountry";

[@bs.module "react-native-localize"]
external getCurrencies: unit => array(string) = "getCurrencies";

[@bs.module "react-native-localize"]
external getLocales: unit => array(locale) = "getLocales";

[@bs.module "react-native-localize"]
external getNumberFormatSettings: unit => numberFormatSettings =
  "getNumberFormatSettings";

[@bs.module "react-native-localize"]
external getTemperatureUnit_: unit => string = "getTemperatureUnit";

let getTemperatureUnit =
  getTemperatureUnit_()
  ->temperatureUnitFromJs
  ->Belt.Option.getWithDefault(`celsius);

[@bs.module "react-native-localize"]
external getTimeZone: unit => string = "getTimeZone";

[@bs.module "react-native-localize"]
external uses24HourClock: unit => bool = "uses24HourClock";

[@bs.module "react-native-localize"]
external usesMetricSystem: unit => bool = "usesMetricSystem";

[@bs.module "react-native-localize"]
external usesAutoDateAndTime: unit => option(bool) = "usesAutoDateAndTime";

[@bs.module "react-native-localize"]
external usesAutoTimeZone: unit => option(bool) = "usesAutoTimeZone";

[@bs.module "react-native-localize"]
external addEventListener: (string, 'a) => unit = "addEventListener";

[@bs.module "react-native-localize"]
external removeEventListener: (string, 'a) => unit = "removeEventListener";

type availableLanguage = {
  languageTag: string,
  isRTL: bool,
};
[@bs.module "react-native-localize"]
external findBestAvailableLanguage:
  array(string) => option(availableLanguage) =
  "findBestAvailableLanguage";
