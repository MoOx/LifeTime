/**
 * The only file that talks to the calendar, through LifeTime's own module
 * (`modules/lifetime-calendar`). Above it everything works on `TimeEvent`, so the reports
 * stay pure and testable.
 *
 * Read-only (spec/20-sources.md, "Calendar"): the module has no write function outside E2E
 * builds. It replaced `expo-calendar` for that, and for the event store's change signal
 * (docs/slices/4/README.md). Reading the status creates nothing and shows nothing.
 */

import { useSyncExternalStore } from 'react'
import { Linking } from 'react-native'

import LifeTimeCalendar from '../../modules/lifetime-calendar'

import { E2E_CALENDAR, e2eIsolated } from '@/data/e2e'
import type { TimeEvent } from '@/domain/events'
import type { CalendarRef } from '@/domain/settings'

export type CalendarAccess = 'undetermined' | 'granted' | 'denied'

let access: CalendarAccess = LifeTimeCalendar.getAccess()
const listeners = new Set<() => void>()
const setAccess = (next: CalendarAccess) => {
  if (next === access) return
  access = next
  for (const listener of listeners) listener()
}

export const useCalendarAccess = (): CalendarAccess =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => access,
  )

/** Re-reads the status, for when the user may have changed it in Settings. */
export const refreshCalendarAccess = (): CalendarAccess => {
  setAccess(LifeTimeCalendar.getAccess())
  return access
}

/** Shows iOS's prompt if it has not been answered. Full access, as reading requires. */
export const requestCalendarAccess = async (): Promise<boolean> => {
  const granted = await LifeTimeCalendar.requestAccess().catch(() => false)
  refreshCalendarAccess()
  return granted
}

export const listCalendars = async (): Promise<CalendarRef[]> =>
  (await LifeTimeCalendar.listCalendars())
    // Maestro's flows read their own calendar alone (`e2eIsolated`); false in shipped builds.
    .filter((c) => !e2eIsolated() || c.title === E2E_CALENDAR)
    .sort((a, b) => a.title.localeCompare(b.title))

export const listEvents = async (
  calendarIds: readonly string[],
  start: Date,
  end: Date,
): Promise<TimeEvent[]> =>
  calendarIds.length === 0
    ? []
    : LifeTimeCalendar.listEvents([...calendarIds], start.getTime(), end.getTime())

/** The event store's change signal; only fires once access is granted. */
export const onCalendarChange = (listener: () => void) => {
  const subscription = LifeTimeCalendar.addListener('onChange', listener)
  return () => subscription.remove()
}

/** `Open Calendar` (SCREENS.md §3.1): the system calendar. */
export const openCalendarApp = () => Linking.openURL('calshow:').catch(() => {})

/** `Open Settings` when access was refused (spec/20-sources.md). */
export const openAppSettings = () => Linking.openSettings().catch(() => {})
