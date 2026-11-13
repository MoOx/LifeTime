/**
 * Turning a list of events into the numbers the UI shows.
 *
 * Every function here is pure and takes explicit ranges, so the whole reporting layer is
 * testable without a device. In v1 this logic lived partly in `Calendars.res` and partly
 * inside component render bodies, which is why it had no tests.
 */

import { CategoryId, DEFAULT_CATEGORIES } from './categories'
import { TimeEvent } from './events'
import { RuleSet, categoryOf } from './rules'
import { Range } from './week'
import { MINUTES_PER_HOUR, msToMinutes, overlapMs, startOfDay, endOfDay } from './time'

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

/** The calendar an activity title comes from, for resolving its category in a list. */
export const calendarOfTitle = (
  events: readonly TimeEvent[],
  title: string,
): string => events.find((e) => e.title === title)?.calendarId ?? ''

export const minutesByCategory = (
  events: readonly TimeEvent[],
  rules: RuleSet,
  range: Range,
): Bucket[] => {
  const totals = new Map<CategoryId, number>()
  for (const event of events) {
    const minutes = minutesInRange(event, range)
    if (minutes <= 0) continue
    const categoryId = categoryOf(event, rules)
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
  rules: RuleSet,
  days: readonly number[],
): DayBreakdown[] =>
  days.map((day) => {
    const dayRange = { start: startOfDay(day), end: endOfDay(day) }
    const byCategory = minutesByCategory(events, rules, dayRange)
    return {
      day: dayRange.start,
      byCategory,
      totalMinutes: byCategory.reduce((sum, b) => sum + b.minutes, 0),
    }
  })

/**
 * The categories' declaration order (rest, food, exercise, ...), with anything
 * uncategorised last. Breaks ties in `weekStackOrder`.
 */
export const STACK_ORDER: CategoryId[] = DEFAULT_CATEGORIES.map((c) => c.id)

/**
 * The stacking order of a week's bars, bottom first: the week's category totals, biggest
 * first, so the biggest "consumer" of time sits at the bottom of every bar
 * (`WeeklyGraph.res:265-267`; INTENT.md D25, MoOx: « qu'on voit les plus gros
 * "consommateurs" de temps »). One order per week, so the bands line up across the
 * week's bars; it can change from one week to the next, which v2 had replaced by the
 * declaration order and D25 reverts.
 */
export const weekStackOrder = (days: readonly DayBreakdown[]): CategoryId[] => {
  const totals = new Map<CategoryId, number>()
  for (const day of days) {
    for (const bucket of day.byCategory) {
      totals.set(bucket.key, (totals.get(bucket.key) ?? 0) + bucket.minutes)
    }
  }
  const rank = (id: CategoryId) => {
    const index = STACK_ORDER.indexOf(id)
    return index === -1 ? STACK_ORDER.length : index
  }
  return [...totals.keys()].sort(
    (a, b) => totals.get(b)! - totals.get(a)! || rank(a) - rank(b),
  )
}

/** A day's segments in `order`, bottom first, without the empty ones. */
export const stackedSegments = (
  breakdown: DayBreakdown,
  order: readonly CategoryId[],
): { categoryId: CategoryId; minutes: number }[] =>
  order
    .map((categoryId) => ({
      categoryId,
      minutes: breakdown.byCategory.find((b) => b.key === categoryId)?.minutes ?? 0,
    }))
    .filter((s) => s.minutes > 0)

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

/** How many horizontal divisions the chart is drawn with. Always four (`WeeklyGraph.res:7`). */
export const CHART_SLICES = 4

export type ChartGridLine = {
  /** Minutes this line sits at. */
  minutes: number
  /** 0…1 up the plot. */
  fraction: number
  /** `"3h"` / `"45m"`, or `undefined` where v1 draws a line but no label. */
  label?: string
}

/**
 * The chart's horizontal grid.
 *
 * Two things here are v1's and were wrong in the first rebuild, both from
 * `WeeklyGraph.res:53-107`:
 *
 *   • **The maximum is divided into four equal slices, whatever it is** — not a ladder
 *     every two or four hours. A fixed ladder means a 40-minute week gets no lines at all
 *     and a 14-hour week gets seven.
 *   • **The unit follows the scale.** Above an hour the labels are hours, at or below it
 *     they are minutes. Without that, a short week reads "0 h, 0 h, 1 h".
 *
 * The baseline and the topmost line carry no label (`WeeklyGraph.res:78`): the baseline is
 * zero and the top is the number already printed above the chart, so labelling either is
 * noise. Three labels, never five.
 */
export const chartGrid = (maximumMinutes: number): ChartGridLine[] => {
  if (maximumMinutes <= 0) return []

  const inHours = maximumMinutes > MINUTES_PER_HOUR
  const lines: ChartGridLine[] = []

  for (let i = 0; i <= CHART_SLICES; i++) {
    const fraction = i / CHART_SLICES
    const minutes = maximumMinutes * fraction
    const labelled = i > 0 && i < CHART_SLICES
    lines.push({
      minutes,
      fraction,
      label: labelled
        ? inHours
          ? `${Math.round(minutes / MINUTES_PER_HOUR)}h`
          : `${Math.round(minutes)}m`
        : undefined,
    })
  }

  return lines
}
