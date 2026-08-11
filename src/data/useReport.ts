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

import { DEMO_RULES } from '@/domain/demo'
import type { TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import type { Settings } from '@/domain/settings'
import { lastWeeks, type Range, type WeekStartsOn } from '@/domain/week'
import { sourceFor, type EventSource } from './source'
import { useCalendarList } from './useCalendarList'
import { useEventRanges } from './useEvents'

export const WEEKS_SHOWN = 6

/**
 * The rule set the whole app resolves categories through.
 *
 * In demo mode the built-in demo rules are appended *after* the user's, so a rule they
 * wrote always wins — the demo colours the sample data without ever overriding a real
 * decision.
 */
export const rulesOf = (settings: Settings, demo = false): RuleSet => ({
  activities: demo
    ? [...settings.activities, ...DEMO_RULES.activities]
    : settings.activities,
  calendars: settings.calendarCategories,
})

export type Report = {
  weeks: Range[]
  eventsByWeek: (TimeEvent[] | undefined)[]
  /** Where these events came from — the demo generator or the device. */
  source: EventSource
  /** True when the events are generated rather than read from the device. */
  isDemo: boolean
  /** Includes the demo rules when `isDemo`. */
  rules: RuleSet
  loading: boolean
  /** When the events were last read, for the "Updated …" footnote. */
  updatedAt: number
  refresh: () => void
}

/**
 * Which calendars of a source actually count, honouring the user's exclusions.
 *
 * Shared with the other screens that read events, so "this calendar is off" means the same
 * thing on the Summary, in the sorter and on an activity — three places that each used to
 * derive it themselves.
 */
export const useActiveCalendarIds = (
  source: EventSource,
  settings: Settings,
): string[] => {
  const calendars = useCalendarList(source)
  return useMemo(
    () =>
      calendars
        .map((c) => c.id)
        .filter((id) => !settings.skippedCalendars.some((s) => s.id === id)),
    [calendars, settings.skippedCalendars],
  )
}

export const useReport = (
  settings: Settings,
  weekStartsOn: WeekStartsOn,
  now: number,
  hasPermission: boolean,
): Report => {
  const source = sourceFor(hasPermission)
  const activeCalendarIds = useActiveCalendarIds(source, settings)

  const weeks = useMemo(
    () => lastWeeks(now, weekStartsOn, WEEKS_SHOWN),
    [now, weekStartsOn],
  )

  const live = useEventRanges(source, activeCalendarIds, weeks)

  const isDemo = source.id === 'demo'
  const rules = useMemo(() => rulesOf(settings, isDemo), [settings, isDemo])

  return {
    weeks,
    eventsByWeek: live.byRange,
    source,
    isDemo,
    rules,
    loading: live.loading,
    updatedAt: live.updatedAt,
    refresh: live.refresh,
  }
}

export { initialWeekIndex } from '@/domain/events'
