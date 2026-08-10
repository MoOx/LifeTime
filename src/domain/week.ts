/**
 * Week boundaries.
 *
 * v1 carried a hand-maintained table of ~70 country codes to decide whether the week
 * starts on Friday, Saturday, Sunday or Monday (`src/Date.res:238-250`). The OS already
 * knows: `expo-localization`'s `getCalendars()[0].firstWeekday` returns it. This module
 * takes `weekStartsOn` as a plain argument so it stays pure and testable; the platform
 * lookup lives in `src/data/locale.ts`.
 */

import { addDays, endOfDay, startOfDay } from './time'

/** 0 = Sunday … 6 = Saturday, matching `Date.prototype.getDay`. */
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type Range = { start: number; end: number }

export const startOfWeek = (t: number, weekStartsOn: WeekStartsOn): number => {
  const day = new Date(t).getDay()
  const diff = (day - weekStartsOn + 7) % 7
  return startOfDay(addDays(t, -diff))
}

export const endOfWeek = (t: number, weekStartsOn: WeekStartsOn): number =>
  endOfDay(addDays(startOfWeek(t, weekStartsOn), 6))

export const weekRange = (t: number, weekStartsOn: WeekStartsOn): Range => ({
  start: startOfWeek(t, weekStartsOn),
  end: endOfWeek(t, weekStartsOn),
})

/**
 * The last `count` weeks, oldest first, the last entry being the week containing `now`.
 * v1 hardcoded 6 (`Array.range(0, 5)`) inline in the Summary component.
 */
export const lastWeeks = (
  now: number,
  weekStartsOn: WeekStartsOn,
  count: number,
): Range[] =>
  Array.from({ length: count }, (_, i) =>
    weekRange(addDays(now, -(count - 1 - i) * 7), weekStartsOn),
  )

/** The seven day-start instants of a week, in display order. */
export const daysOfWeek = (week: Range): number[] =>
  Array.from({ length: 7 }, (_, i) => addDays(week.start, i))

/**
 * A range clamped so it never extends into the future — the app is a diary reader, so
 * "this week" always means "this week so far".
 */
export const clampToNow = (range: Range, now: number): Range => ({
  start: range.start,
  end: Math.min(range.end, now),
})

/** How many whole weeks `week` sits in the past. 0 is the week containing `now`. */
export const weeksAgo = (week: Range, now: number, weekStartsOn: WeekStartsOn): number =>
  Math.round((startOfWeek(now, weekStartsOn) - week.start) / (7 * 86_400_000))

/**
 * "This week" / "Last week" / "4 – 10 Aug". The two nearest weeks get a name because
 * that is how people refer to them; older ones get their dates, because "3 weeks ago"
 * stops being something you can picture.
 */
export const weekLabel = (
  week: Range,
  now: number,
  weekStartsOn: WeekStartsOn,
  locale: string,
): string => {
  const ago = weeksAgo(week, now, weekStartsOn)
  if (ago === 0) return 'This week'
  if (ago === 1) return 'Last week'

  const day = new Intl.DateTimeFormat(locale, { day: 'numeric' })
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  const last = addDays(week.start, 6)
  const sameMonth = new Date(week.start).getMonth() === new Date(last).getMonth()

  return `${sameMonth ? day.format(week.start) : dayMonth.format(week.start)} – ${dayMonth.format(last)}`
}
