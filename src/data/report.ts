/**
 * Everything the Summary needs for six weeks.
 *
 * Demo only for now: the calendar source arrives with slice 4 and replaces `demoEvents`
 * behind the same shape. The demo rules come after the user's, so a rule they write always
 * wins (as in v2, quarry/v2/src/data/useReport.ts).
 */

import { useMemo } from 'react'

import { demoEvents, DEMO_RULES } from '@/domain/demo'
import { filterEvents, type TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import type { Settings } from '@/domain/settings'
import { lastWeeks, type Range, type WeekStartsOn } from '@/domain/week'

/** v1 showed six weeks (`Home.res`, `last5Weeks` holds six ranges). */
export const WEEKS_SHOWN = 6

export type Report = {
  weeks: Range[]
  /** Visible events per week, same order as `weeks`: filters applied. */
  eventsByWeek: TimeEvent[][]
  rules: RuleSet
  isDemo: boolean
  updatedAt: number
}

export const rulesOf = (settings: Settings, demo: boolean): RuleSet => ({
  activities: demo ? [...settings.activities, ...DEMO_RULES.activities] : settings.activities,
  calendars: settings.calendarCategories,
})

export const useReport = (settings: Settings, weekStartsOn: WeekStartsOn, now: number): Report => {
  const weeks = useMemo(() => lastWeeks(now, weekStartsOn, WEEKS_SHOWN), [now, weekStartsOn])
  const filter = useMemo(
    () => ({
      skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
      skippedActivityTitles: settings.skippedActivityTitles,
      hideSkippedActivities: settings.hideSkippedActivities,
    }),
    [settings.skippedCalendars, settings.skippedActivityTitles, settings.hideSkippedActivities],
  )
  const eventsByWeek = useMemo(
    () => weeks.map((week) => filterEvents(demoEvents(week, now), filter)),
    [weeks, now, filter],
  )
  const rules = useMemo(() => rulesOf(settings, true), [settings])
  return { weeks, eventsByWeek, rules, isDemo: true, updatedAt: now }
}
