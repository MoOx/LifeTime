/**
 * Everything the Summary needs for six weeks, from one hook.
 *
 * It also owns the decision of *where the events come from*. Without calendar access the
 * app does not show a blank page and a dialog — it runs the real screen over
 * `demoEvents`. Same aggregation, same chart, same code path; only the source differs.
 * That is what lets the permission request sit over a working app instead of in front of
 * an empty one, and it is why the report layer can be tested with no calendar at all.
 */

import { useMemo } from 'react'

import { demoEvents } from '@/domain/demo'
import type { TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import type { Settings } from '@/domain/settings'
import { lastWeeks, type Range, type WeekStartsOn } from '@/domain/week'
import { useCalendarList } from './useCalendarList'
import { useEventRanges } from './useEvents'

export const WEEKS_SHOWN = 6

/** The rule set the whole app resolves categories through. */
export const rulesOf = (settings: Settings): RuleSet => ({
  activities: settings.activities,
  calendars: settings.calendarCategories,
})

export type Report = {
  weeks: Range[]
  eventsByWeek: (TimeEvent[] | undefined)[]
  /** True when the events are generated rather than read from the device. */
  isDemo: boolean
  loading: boolean
  refresh: () => void
}

export const useReport = (
  settings: Settings,
  weekStartsOn: WeekStartsOn,
  now: number,
  hasPermission: boolean,
): Report => {
  const calendars = useCalendarList(hasPermission)

  const weeks = useMemo(
    () => lastWeeks(now, weekStartsOn, WEEKS_SHOWN),
    [now, weekStartsOn],
  )

  const activeCalendarIds = useMemo(
    () =>
      calendars
        .map((c) => c.id)
        .filter((id) => !settings.skippedCalendars.some((s) => s.id === id)),
    [calendars, settings.skippedCalendars],
  )

  // The hook still runs without permission — it just resolves to empty ranges — so the
  // hook order never changes between the demo and the real thing.
  const live = useEventRanges(hasPermission ? activeCalendarIds : [], weeks)

  const demo = useMemo(
    () => (hasPermission ? undefined : weeks.map((week) => demoEvents(week, now))),
    [hasPermission, weeks, now],
  )

  return {
    weeks,
    eventsByWeek: demo ?? live.byRange,
    isDemo: demo !== undefined,
    loading: hasPermission && live.loading,
    refresh: live.refresh,
  }
}

/**
 * Which week to open on. Issue #19:
 *
 * > Monday morning (no data) should display last week instead […] before the $frequency
 * > threshold, if there is no data for the current week, we should show last week data
 * > instead of empty week.
 *
 * The generalisation is simply "the most recent week that has anything in it", which also
 * covers coming back to the app after a fortnight away. It only ever looks backwards from
 * the current week, and it gives up rather than paging far into the past — landing on a
 * month-old week would be more confusing than an empty one.
 */
export const initialWeekIndex = (
  eventsByWeek: (TimeEvent[] | undefined)[],
  lookBack = 1,
): number => {
  const last = eventsByWeek.length - 1
  for (let i = last; i >= Math.max(0, last - lookBack); i--) {
    const events = eventsByWeek[i]
    // Still loading: do not skip past a week we know nothing about yet.
    if (events === undefined) return last
    if (events.some((e) => !e.allDay)) return i
  }
  return last
}
