/**
 * Turning a list of events into the numbers the UI shows.
 *
 * Every function here is pure and takes explicit ranges, so the whole reporting layer is
 * testable without a device. In v1 this logic lived partly in `Calendars.res` and partly
 * inside component render bodies, which is why it had no tests.
 */

import { Activity, resolveCategoryId } from './activities'
import { CategoryId } from './categories'
import { TimeEvent } from './events'
import { Range } from './week'
import { msToMinutes, overlapMs, startOfDay, endOfDay } from './time'

export type Bucket = { key: string; minutes: number }

/** Minutes an event contributes to a window, clamped to that window. */
export const minutesInRange = (event: TimeEvent, range: Range): number =>
  msToMinutes(overlapMs(event.start, event.end, range.start, range.end))

const sortDesc = (buckets: Bucket[]): Bucket[] =>
  buckets.sort((a, b) => b.minutes - a.minutes || a.key.localeCompare(b.key))

/**
 * Minutes per activity title, descending. Titles are grouped by their raw text (which is
 * what the user sees in their calendar); matching to categories happens separately.
 */
export const minutesByTitle = (events: readonly TimeEvent[], range: Range): Bucket[] => {
  const totals = new Map<string, number>()
  for (const event of events) {
    const minutes = minutesInRange(event, range)
    if (minutes <= 0) continue
    totals.set(event.title, (totals.get(event.title) ?? 0) + minutes)
  }
  return sortDesc([...totals].map(([key, minutes]) => ({ key, minutes })))
}

export const minutesByCategory = (
  events: readonly TimeEvent[],
  activities: readonly Activity[],
  range: Range,
): Bucket[] => {
  const totals = new Map<CategoryId, number>()
  for (const event of events) {
    const minutes = minutesInRange(event, range)
    if (minutes <= 0) continue
    const categoryId = resolveCategoryId(event.title, activities)
    totals.set(categoryId, (totals.get(categoryId) ?? 0) + minutes)
  }
  return sortDesc([...totals].map(([key, minutes]) => ({ key, minutes })))
}

export type DayBreakdown = {
  /** Start-of-day instant. */
  day: number
  byCategory: Bucket[]
  totalMinutes: number
}

/**
 * Per-day, per-category minutes for a week — the weekly chart's data.
 * An event crossing midnight is split across both days, as in v1.
 */
export const breakdownByDay = (
  events: readonly TimeEvent[],
  activities: readonly Activity[],
  days: readonly number[],
): DayBreakdown[] =>
  days.map((day) => {
    const dayRange = { start: startOfDay(day), end: endOfDay(day) }
    const byCategory = minutesByCategory(events, activities, dayRange)
    return {
      day: dayRange.start,
      byCategory,
      totalMinutes: byCategory.reduce((sum, b) => sum + b.minutes, 0),
    }
  })

export const totalMinutes = (buckets: readonly Bucket[]): number =>
  buckets.reduce((sum, b) => sum + b.minutes, 0)

/**
 * A chart y-axis maximum that divides into round numbers: multiples of 4 h above one
 * hour, of 20 min below. Ported from v1's `WeeklyGraph`, where it was inline.
 */
export const chartMaximum = (maxMinutes: number): number => {
  if (maxMinutes <= 0) return 0
  const step = maxMinutes > 60 ? 240 : 20
  return Math.ceil(maxMinutes / step) * step
}
