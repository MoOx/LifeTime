@deriving(jsConverter)
type calendar = [#gregorian | #japanese | #buddhist]

@deriving(jsConverter)
type temperatureUnit = [#celsius | #fahrenheit]

type locale = {
  languageCode: string,
  scriptCode: option<string>,
  countryCode: string,
  languageTag: string,
  isRTL: bool,
}

type numberFormatSettings = {
  decimalSeparator: string,
  groupingSeparator: string,
}

@module("react-native-localize")
external getCalendar_: unit => string = "getCalendar"

let getCalendar = getCalendar_()->calendarFromJs->Belt.Option.getWithDefault(#gregorian)

@module("react-native-localize")
external getCountry: unit => string = "getCountry"

@module("react-native-localize")
external getCurrencies: unit => array<string> = "getCurrencies"

@module("react-native-localize")
external getLocales: unit => array<locale> = "getLocales"

@module("react-native-localize")
external getNumberFormatSettings: unit => numberFormatSettings = "getNumberFormatSettings"

@module("react-native-localize")
external getTemperatureUnit_: unit => string = "getTemperatureUnit"

let getTemperatureUnit =
  getTemperatureUnit_()->temperatureUnitFromJs->Belt.Option.getWithDefault(#celsius)

@module("react-native-localize")
external getTimeZone: unit => string = "getTimeZone"

@module("react-native-localize")
external uses24HourClock: unit => bool = "uses24HourClock"

@module("react-native-localize")
external usesMetricSystem: unit => bool = "usesMetricSystem"

@module("react-native-localize")
external usesAutoDateAndTime: unit => option<bool> = "usesAutoDateAndTime"

@module("react-native-localize")
external usesAutoTimeZone: unit => option<bool> = "usesAutoTimeZone"

@module("react-native-localize")
external addEventListener: (string, 'a) => unit = "addEventListener"

@module("react-native-localize")
external removeEventListener: (string, 'a) => unit = "removeEventListener"

type availableLanguage = {
  languageTag: string,
  isRTL: bool,
}
@module("react-native-localize")
external findBestAvailableLanguage: array<string> => option<availableLanguage> =
  "findBestAvailableLanguage"
