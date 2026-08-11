/**
 * Pure time helpers. No React, no native modules, no `Date.now()` — every function that
 * needs "now" takes it as an argument so it can be tested deterministically.
 *
 * All instants are epoch milliseconds. Calendar-dependent operations (start of day,
 * day-of-week) go through `Date`, which uses the device time zone — that is the correct
 * behaviour here, since the user reasons about their own local days.
 */

export const MS_PER_MINUTE = 60_000
export const MINUTES_PER_HOUR = 60
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR

export const msToMinutes = (ms: number): number => ms / MS_PER_MINUTE
export const minutesToMs = (minutes: number): number => minutes * MS_PER_MINUTE

export const startOfDay = (t: number): number => {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export const endOfDay = (t: number): number => {
  const d = new Date(t)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export const addDays = (t: number, days: number): number => {
  const d = new Date(t)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

/** Day of week, 0 = Sunday, matching `Date.prototype.getDay`. */
export const dayOfWeek = (t: number): number => new Date(t).getDay()

export const startOfMonth = (t: number): number => {
  const d = new Date(t)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export const endOfMonth = (t: number): number => {
  const d = new Date(t)
  d.setMonth(d.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export const startOfYear = (t: number): number => {
  const d = new Date(t)
  d.setMonth(0, 1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export const endOfYear = (t: number): number => {
  const d = new Date(t)
  d.setMonth(11, 31)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/** Minutes of a given local day that have elapsed at `now`: 0 … 1440. */
export const minutesElapsedInDay = (day: number, now: number): number => {
  const start = startOfDay(day)
  if (now <= start) return 0
  const end = start + MINUTES_PER_DAY * MS_PER_MINUTE
  if (now >= end) return MINUTES_PER_DAY
  return msToMinutes(now - start)
}

/**
 * Overlap between two intervals, in milliseconds. Zero when they do not overlap.
 * This is the primitive the whole aggregation layer is built on: an event that starts
 * before the window or ends after it only contributes the part that falls inside.
 */
export const overlapMs = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): number => Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart))

/**
 * Human duration, e.g. `2d 3h 15m`. Empty units are collapsed; zero renders as `0m`.
 * Ported from the v1 `Date.minToString` so exported reports stay comparable.
 */
export const formatMinutes = (minutes: number): string => {
  const total = Math.max(0, Math.round(minutes))
  const days = Math.floor(total / MINUTES_PER_DAY)
  const hours = Math.floor((total - days * MINUTES_PER_DAY) / MINUTES_PER_HOUR)
  const mins = total - days * MINUTES_PER_DAY - hours * MINUTES_PER_HOUR

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`)
  return parts.join(' ')
}

/**
 * Locale-aware date parts, via `Intl`. v1 hardcoded English day and month names
 * (`"Monday"`, `"January"`, …) even though it configured `date-fns` locales two files
 * away; going through `Intl` removes ~90 lines of tables and is correct in every locale
 * the OS supports.
 */
export const formatDayMonth = (t: number, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(t))

export const formatWeekdayNarrow = (t: number, locale: string): string =>
  new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(t))

export const formatDayMonthShort = (t: number, locale: string): string =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(t))

/**
 * "5 minutes ago" — when the engine can say it, and a locale-correct absolute time when
 * it cannot.
 *
 * **Hermes does not implement all of `Intl`.** Its Apple and Android platform layers
 * provide `Collator`, `DateTimeFormat` and `NumberFormat`; `RelativeTimeFormat`,
 * `PluralRules`, `ListFormat` and `DisplayNames` are absent. Calling a missing one is not
 * a graceful degradation — it is a `TypeError` thrown during render, which React Native
 * turns into a fatal exception and the app dies at launch.
 *
 * So this feature-detects rather than assuming, and falls back to `DateTimeFormat`, which
 * is always there. The fallback is an absolute time rather than a hand-rolled English
 * table: "Updated at 14:32" is honest and correct in every locale, whereas "il y a 5
 * minutes" written by hand would only be correct in the two languages someone thought to
 * add — which is precisely the trap v1's ~90 lines of date tables fell into.
 */
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 1000],
  ['minute', 60 * 1000],
  ['hour', 3_600_000],
  ['day', 86_400_000],
  ['week', 7 * 86_400_000],
]

/** Evaluated once: whether the engine has it is a build fact, not state. */
export const HAS_RELATIVE_TIME_FORMAT =
  typeof (Intl as { RelativeTimeFormat?: unknown }).RelativeTimeFormat === 'function'

const DAY_MS = 86_400_000

const formatAbsolute = (t: number, now: number, locale: string): string =>
  Math.abs(now - t) < DAY_MS
    ? new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(
        new Date(t),
      )
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(
        new Date(t),
      )

/**
 * Works in both directions. The first version subtracted `now - t` and treated anything
 * negative as "now", which is right for "updated 5 minutes ago" and wrong for the other
 * caller that appeared later: a reminder's next firing time is always in the future, and
 * every one of them read "now".
 */
export const formatRelative = (t: number, now: number, locale: string): string => {
  if (!HAS_RELATIVE_TIME_FORMAT) return formatAbsolute(t, now, locale)

  const delta = now - t
  const magnitude = Math.abs(delta)
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  // `RelativeTimeFormat` has no "just now"; forcing seconds gives "3 seconds ago", which
  // is noise on a figure that only matters to the nearest minute.
  if (magnitude < 45_000) return format.format(0, 'second')

  let unit: Intl.RelativeTimeFormatUnit = 'second'
  let ms = 1000
  for (const [candidate, size] of RELATIVE_UNITS) {
    if (magnitude < size) break
    unit = candidate
    ms = size
  }

  return format.format(-Math.round(delta / ms), unit)
}
