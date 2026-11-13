/**
 * Everything the Summary needs for six weeks, from whichever source applies:
 *
 *   - `demo` until calendar access is granted (spec/20-sources.md, "Demo"),
 *   - `calendar` once it is: the device's calendars, read-only,
 *   - `denied` when access was refused: no data, the Summary shows the permission card.
 *
 * Always up to date with no refresh action (D13): the calendar is re-read on launch, when
 * the app returns to the foreground, when the Summary regains focus, and on the event
 * store's change signal (spec/20-sources.md, "When").
 */

import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppState } from 'react-native'

import { DEMO_CALENDARS, demoEvents, DEMO_RULES } from '@/domain/demo'
import { filterEvents, type EventFilter, type TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import type { CalendarRef, Settings } from '@/domain/settings'
import { lastWeeks, type Range, type WeekStartsOn } from '@/domain/week'

import {
  listCalendars,
  listEvents,
  onCalendarChange,
  refreshCalendarAccess,
  useCalendarAccess,
} from './calendar'

/** v1 showed six weeks (`Home.res`, `last5Weeks` holds six ranges). */
export const WEEKS_SHOWN = 6

export type SourceState = 'demo' | 'calendar' | 'denied'

export type Report = {
  source: SourceState
  weeks: Range[]
  /** Every event read, per week: what the empty states reason about. */
  rawByWeek: TimeEvent[][]
  /** Visible events per week, filters applied: what the chart and the list show. */
  eventsByWeek: TimeEvent[][]
  calendars: CalendarRef[]
  filter: EventFilter
  rules: RuleSet
  loading: boolean
  updatedAt: number
}

export const rulesOf = (settings: Settings, demo: boolean): RuleSet => ({
  activities: demo ? [...settings.activities, ...DEMO_RULES.activities] : settings.activities,
  calendars: settings.calendarCategories,
})

const splitByWeek = (events: TimeEvent[], weeks: Range[]): TimeEvent[][] =>
  weeks.map((week) => events.filter((e) => e.end > week.start && e.start <= week.end))

export const useReport = (settings: Settings, weekStartsOn: WeekStartsOn, now: number): Report => {
  const access = useCalendarAccess()
  const source: SourceState =
    access === 'granted' ? 'calendar' : access === 'denied' ? 'denied' : 'demo'

  // Access may change in Settings while the app is away: re-read it with the calendar.
  const getPermission = useCallback(() => {
    refreshCalendarAccess()
  }, [])

  const weeks = useMemo(() => lastWeeks(now, weekStartsOn, WEEKS_SHOWN), [now, weekStartsOn])

  // A revision to re-read the calendar: launch, foreground, focus.
  const [revision, setRevision] = useState(0)
  const reread = useCallback(() => setRevision((r) => r + 1), [])
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        // Access may have been granted in Settings meanwhile.
        getPermission()
        reread()
      }
    })
    return () => subscription.remove()
  }, [getPermission, reread])
  useFocusEffect(
    useCallback(() => {
      getPermission()
      reread()
    }, [getPermission, reread]),
  )
  // The event store's own change signal, for changes synced while LifeTime is in front.
  useEffect(() => (source === 'calendar' ? onCalendarChange(reread) : undefined), [source, reread])

  const [read, setRead] = useState<{
    calendars: CalendarRef[]
    events: TimeEvent[]
    at: number
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (source !== 'calendar') return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const calendars = await listCalendars()
      const events = await listEvents(
        calendars.map((c) => c.id),
        new Date(weeks[0].start),
        new Date(weeks[weeks.length - 1].end),
      )
      if (!cancelled) setRead({ calendars, events, at: Date.now() })
    })()
      .catch(() => {
        if (!cancelled) setRead({ calendars: [], events: [], at: Date.now() })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [source, weeks, revision])

  const rawByWeek = useMemo(() => {
    if (source === 'demo') return weeks.map((week) => demoEvents(week, now))
    if (source === 'denied') return weeks.map(() => [])
    return splitByWeek(read?.events ?? [], weeks)
  }, [source, weeks, now, read])

  const filter = useMemo<EventFilter>(
    () => ({
      skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
      skippedActivityTitles: settings.skippedActivityTitles,
      hideSkippedActivities: settings.hideSkippedActivities,
    }),
    [settings.skippedCalendars, settings.skippedActivityTitles, settings.hideSkippedActivities],
  )
  const eventsByWeek = useMemo(
    () => rawByWeek.map((events) => filterEvents(events, filter)),
    [rawByWeek, filter],
  )
  const rules = useMemo(() => rulesOf(settings, source === 'demo'), [settings, source])

  return {
    source,
    weeks,
    rawByWeek,
    eventsByWeek,
    calendars:
      source === 'calendar' ? (read?.calendars ?? []) : source === 'demo' ? DEMO_CALENDARS : [],
    filter,
    rules,
    loading,
    updatedAt: source === 'calendar' ? (read?.at ?? now) : now,
  }
}
