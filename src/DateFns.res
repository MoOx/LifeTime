open Js.Date

type formatDistanceOptions = {
  addSuffix: option<bool>,
  comparison: @int [@as(-1) #inferior | @as(0) #equal | @as(1) #superior],
}
type formatDistance = (
  [
    | #lessThanXSeconds
    | #xSeconds
    | #halfAMinute
    | #lessThanXMinutes
    | #xMinutes
    | #aboutXHours
    | #xHours
    | #xDays
    | #aboutXMonths
    | #xMonths
    | #aboutXYears
    | #xYears
    | #overXYears
    | #almostXYears
  ],
  float,
  option<formatDistanceOptions>,
) => string

type formatRelativeOptions = {
  weekStartsOn: option<
    @int
    [
      | @as(0)
      #sunday
      | @as(1)
      #monday
      | @as(2)
      #tuesday
      | @as(3)
      #wednesday
      | @as(4)
      #thursday
      | @as(5)
      #friday
      | @as(6)
      #saturday
    ],
  >,
}
type formatRelative = (
  [#lastWeek | #yesterday | #today | #tomorrow | #nextWeek | #other],
  Js.Date.t,
  Js.Date.t,
  option<formatRelativeOptions>,
) => string

type localizeFnOptions = {
  width: option<[#narrow | #short | #abbreviated | #wide]>,
  context: option<[#formatting | #standalone]>,
}
type localizeFn<'a> = ('a, option<localizeFnOptions>) => string

type localize = {
  ordinalNumber: localizeFn<float>,
  era: localizeFn<@int [@as(-1) #_1 | @as(0) #_0]>,
  quarter: localizeFn<@int [@as("1") #_1 | @as("2") #_2 | @as("3") #_3 | @as("4") #_4]>,
  month: localizeFn<
    @int
    [
      | @as("0")
      #_0
      | @as("1")
      #_1
      | @as("2")
      #_2
      | @as("3")
      #_3
      | @as("4")
      #_4
      | @as("5")
      #_5
      | @as("6")
      #_6
      | @as("7")
      #_7
      | @as("8")
      #_8
      | @as("9")
      #_9
      | @as("10")
      #_10
      | @as("11")
      #_11
    ],
  >,
  day: localizeFn<
    @int
    [
      | @as("0")
      #_0
      | @as("1")
      #_1
      | @as("2")
      #_2
      | @as("3")
      #_3
      | @as("4")
      #_4
      | @as("5")
      #_5
      | @as("6")
      #_6
    ],
  >,
  dayPeriod: localizeFn<
    [#am | #pm | #midnight | #noon | #morning | #afternoon | #evening | #night],
  >,
}

type formatLongOption = {width: option<[#full | #long | #medium | #short]>}
type formatLong = option<formatLongOption> => string

type formatLongFns = {
  date: formatLong,
  time: formatLong,
  dateTime: formatLong,
}

type matchOptions = {width: option<[#narrow | #short | #abbreviated | #wide]>}
type matchFn<'a> = (string, option<matchOptions>) => 'a

type match = {
  ordinalNumber: matchFn<float>,
  era: matchFn<@int [@as(-1) #_1 | @as(0) #_0]>,
  quarter: matchFn<@int [@as("1") #_1 | @as("2") #_2 | @as("3") #_3 | @as("4") #_4]>,
  month: matchFn<
    @int
    [
      | @as("0")
      #_0
      | @as("1")
      #_1
      | @as("2")
      #_2
      | @as("3")
      #_3
      | @as("4")
      #_4
      | @as("5")
      #_5
      | @as("6")
      #_6
      | @as("7")
      #_7
      | @as("8")
      #_8
      | @as("9")
      #_9
      | @as("10")
      #_10
      | @as("11")
      #_11
    ],
  >,
  day: matchFn<
    @int
    [
      | @as("0")
      #_0
      | @as("1")
      #_1
      | @as("2")
      #_2
      | @as("3")
      #_3
      | @as("4")
      #_4
      | @as("5")
      #_5
      | @as("6")
      #_6
    ],
  >,
  dayPeriod: matchFn<[#am | #pm | #midnight | #noon | #morning | #afternoon | #evening | #night]>,
}

type localeOpts = {
  weekStartsOn: option<
    @int
    [
      | @as("0")
      #_0
      | @as("1")
      #_1
      | @as("2")
      #_2
      | @as("3")
      #_3
      | @as("4")
      #_4
      | @as("5")
      #_5
      | @as("6")
      #_6
    ],
  >,
  firstWeekContainsDate: option<
    @int
    [
      | @as("1")
      #_1
      | @as("2")
      #_2
      | @as("3")
      #_3
      | @as("4")
      #_4
      | @as("5")
      #_5
      | @as("6")
      #_6
      | @as("7")
      #_7
    ],
  >,
}

type locale = {
  code: string,
  formatDistance: formatDistance,
  formatRelative: formatRelative,
  localize: localize,
  formatLong: formatLongFns,
  match: match,
  options: option<localeOpts>,
}

type localeOptions = {
  locale: option<locale>,
  weekStartsOn: option<int>,
}

@module("date-fns") external format: (t, string) => string = "format"
@module("date-fns")
external formatRelative: (t, t, option<localeOptions>) => string = "formatRelative"
@module("date-fns") external formatISO: (t, option<localeOptions>) => string = "formatISO"
@module("date-fns")
external formatRFC3339: (t, option<localeOptions>) => string = "formatRFC3339"

@module("date-fns") external addMilliseconds: (t, float) => t = "addMilliseconds"
@module("date-fns") external subMilliseconds: (t, float) => t = "subMilliseconds"
@module("date-fns") external addSeconds: (t, float) => t = "addSeconds"
@module("date-fns") external subSeconds: (t, float) => t = "subSeconds"
@module("date-fns") external addMinutes: (t, float) => t = "addMinutes"
@module("date-fns") external subMinutes: (t, float) => t = "subMinutes"
@module("date-fns") external addHours: (t, float) => t = "addHours"
@module("date-fns") external subHours: (t, float) => t = "subHours"
@module("date-fns") external addDays: (t, float) => t = "addDays"
@module("date-fns") external subDays: (t, float) => t = "subDays"
@module("date-fns") external addBusinessDays: (t, float) => t = "addBusinessDays"
@module("date-fns") external subBusinessDays: (t, float) => t = "subBusinessDays"
@module("date-fns") external addWeeks: (t, float) => t = "addWeeks"
@module("date-fns") external subWeeks: (t, float) => t = "subWeeks"
@module("date-fns") external addMonths: (t, float) => t = "addMonths"
@module("date-fns") external subMonths: (t, float) => t = "subMonths"
@module("date-fns") external addQuarters: (t, float) => t = "addQuarters"
@module("date-fns") external subQuarters: (t, float) => t = "subQuarters"
@module("date-fns") external addYears: (t, float) => t = "addYears"
@module("date-fns") external subYears: (t, float) => t = "subYears"
@module("date-fns") external addISOWeekYears: (t, float) => t = "addISOWeekYears"
@module("date-fns") external subISOWeekYears: (t, float) => t = "subISOWeekYears"
@module("date-fns") external startOfDay: (t, option<localeOptions>) => t = "startOfDay"
@module("date-fns") external endOfDay: (t, option<localeOptions>) => t = "endOfDay"
@module("date-fns") external startOfWeek: (t, option<localeOptions>) => t = "startOfWeek"
@module("date-fns") external endOfWeek: (t, option<localeOptions>) => t = "endOfWeek"
@module("date-fns") external lastDayOfWeek: (t, option<localeOptions>) => t = "lastDayOfWeek"
@module("date-fns") external startOfMonth: (t, option<localeOptions>) => t = "startOfMonth"
@module("date-fns") external endOfMonth: (t, option<localeOptions>) => t = "endOfMonth"
@module("date-fns") external lastDayOfMonth: (t, option<localeOptions>) => t = "lastDayOfMonth"

module Locales = {
  @module("date-fns/locale") external af: locale = "af"
  @module("date-fns/locale") external arDZ: locale = "arDZ"
  @module("date-fns/locale") external arMA: locale = "arMA"
  @module("date-fns/locale") external arSA: locale = "arSA"
  @module("date-fns/locale") external az: locale = "az"
  @module("date-fns/locale") external be: locale = "be"
  @module("date-fns/locale") external bg: locale = "bg"
  @module("date-fns/locale") external bn: locale = "bn"
  @module("date-fns/locale") external ca: locale = "ca"
  @module("date-fns/locale") external cs: locale = "cs"
  @module("date-fns/locale") external cy: locale = "cy"
  @module("date-fns/locale") external da: locale = "da"
  @module("date-fns/locale") external de: locale = "de"
  @module("date-fns/locale") external el: locale = "el"
  @module("date-fns/locale") external enAU: locale = "enAU"
  @module("date-fns/locale") external enCA: locale = "enCA"
  @module("date-fns/locale") external enGB: locale = "enGB"
  @module("date-fns/locale") external enIN: locale = "enIN"
  @module("date-fns/locale") external enNZ: locale = "enNZ"
  @module("date-fns/locale") external enUS: locale = "enUS"
  @module("date-fns/locale") external enZA: locale = "enZA"
  @module("date-fns/locale") external eo: locale = "eo"
  @module("date-fns/locale") external es: locale = "es"
  @module("date-fns/locale") external et: locale = "et"
  @module("date-fns/locale") external eu: locale = "eu"
  @module("date-fns/locale") external faIR: locale = "faIR"
  @module("date-fns/locale") external fi: locale = "fi"
  @module("date-fns/locale") external fr: locale = "fr"
  @module("date-fns/locale") external frCA: locale = "frCA"
  @module("date-fns/locale") external frCH: locale = "frCH"
  @module("date-fns/locale") external gd: locale = "gd"
  @module("date-fns/locale") external gl: locale = "gl"
  @module("date-fns/locale") external gu: locale = "gu"
  @module("date-fns/locale") external he: locale = "he"
  @module("date-fns/locale") external hi: locale = "hi"
  @module("date-fns/locale") external hr: locale = "hr"
  @module("date-fns/locale") external hu: locale = "hu"
  @module("date-fns/locale") external hy: locale = "hy"
  @module("date-fns/locale") external id: locale = "id"
  @module("date-fns/locale") external is: locale = "is"
  @module("date-fns/locale") external it: locale = "it"
  @module("date-fns/locale") external ja: locale = "ja"
  @module("date-fns/locale") external ka: locale = "ka"
  @module("date-fns/locale") external kk: locale = "kk"
  @module("date-fns/locale") external kn: locale = "kn"
  @module("date-fns/locale") external ko: locale = "ko"
  @module("date-fns/locale") external lb: locale = "lb"
  @module("date-fns/locale") external lt: locale = "lt"
  @module("date-fns/locale") external lv: locale = "lv"
  @module("date-fns/locale") external mk: locale = "mk"
  @module("date-fns/locale") external ms: locale = "ms"
  @module("date-fns/locale") external mt: locale = "mt"
  @module("date-fns/locale") external nb: locale = "nb"
  @module("date-fns/locale") external nl: locale = "nl"
  @module("date-fns/locale") external nlBE: locale = "nlBE"
  @module("date-fns/locale") external nn: locale = "nn"
  @module("date-fns/locale") external pl: locale = "pl"
  @module("date-fns/locale") external pt: locale = "pt"
  @module("date-fns/locale") external ptBR: locale = "ptBR"
  @module("date-fns/locale") external ro: locale = "ro"
  @module("date-fns/locale") external ru: locale = "ru"
  @module("date-fns/locale") external sk: locale = "sk"
  @module("date-fns/locale") external sl: locale = "sl"
  @module("date-fns/locale") external sr: locale = "sr"
  @module("date-fns/locale") external srLatn: locale = "srLatn"
  @module("date-fns/locale") external sv: locale = "sv"
  @module("date-fns/locale") external ta: locale = "ta"
  @module("date-fns/locale") external te: locale = "te"
  @module("date-fns/locale") external th: locale = "th"
  @module("date-fns/locale") external tr: locale = "tr"
  @module("date-fns/locale") external ug: locale = "ug"
  @module("date-fns/locale") external uk: locale = "uk"
  @module("date-fns/locale") external uz: locale = "uz"
  @module("date-fns/locale") external vi: locale = "vi"
  @module("date-fns/locale") external zhCN: locale = "zhCN"
  @module("date-fns/locale") external zhTW: locale = "zhTW"
}
