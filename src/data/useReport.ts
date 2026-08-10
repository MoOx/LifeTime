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

export { initialWeekIndex } from '@/domain/events'
