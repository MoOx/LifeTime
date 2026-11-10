/**
 * The only file that talks to `expo-calendar`.
 *
 * Everything above this layer works on `TimeEvent` (see `src/domain/events.ts`), which is
 * what keeps the reporting logic pure, fast and unit-testable — and what makes the
 * calendar provider replaceable without touching a single screen. See docs/CALENDAR.md §5.
 */

import * as Calendar from 'expo-calendar'
import { Linking, Platform } from 'react-native'

import type { TimeEvent } from '@/domain/events'
import type { CalendarRef } from '@/domain/settings'

export type DeviceCalendar = CalendarRef

export const useCalendarPermissions = Calendar.useCalendarPermissions

export const listCalendars = async (): Promise<DeviceCalendar[]> => {
  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT)
  return calendars
    .map((calendar) => ({
      id: calendar.id,
      title: calendar.title,
      // `source` is an object on iOS and Android alike; its name is what users recognise.
      source: calendar.source?.name ?? '',
      color: calendar.color ?? '#8E8E93',
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

/**
 * Read a window of events and project it into the app's own shape in one pass.
 *
 * Reading each native property exactly once matters: `expo-calendar` returns shared
 * objects whose fields are lazy native getters, so repeated access from the aggregation
 * layer would cross into native repeatedly. One projection here, plain numbers after.
 */
export const listEvents = async (
  calendarIds: string[],
  start: Date,
  end: Date,
): Promise<TimeEvent[]> => {
  if (calendarIds.length === 0) return []
  const events = await Calendar.listEvents(calendarIds, start, end)
  return events.map((event) => ({
    id: event.id,
    calendarId: event.calendarId,
    title: event.title ?? '',
    start: new Date(event.startDate).getTime(),
    end: new Date(event.endDate).getTime(),
    allDay: event.allDay ?? false,
  }))
}

/**
 * Calendar ids are not stable across devices, so a restored backup may reference ids that
 * no longer exist. v1 reconciled skipped calendars by id, falling back to title + colour
 * (`AppSettings.decodeJsonSettings`); that was a genuinely good idea and is kept here.
 */
export const reconcileCalendarIds = (
  saved: readonly DeviceCalendar[],
  available: readonly DeviceCalendar[],
): string[] => {
  const ids = new Set<string>()
  for (const savedCalendar of saved) {
    for (const calendar of available) {
      const sameId = calendar.id === savedCalendar.id
      const sameLook =
        calendar.title === savedCalendar.title && calendar.color === savedCalendar.color
      if (sameId || sameLook) ids.add(calendar.id)
    }
  }
  return [...ids]
}

/**
 * Opens the system calendar, so "add the event you forgot" is one tap away rather than a
 * trip through the home screen. v1 had this in Settings and it belongs there.
 *
 * There is no cross-platform URL for this: iOS uses the `calshow:` scheme, Android an
 * intent on the CalendarContract time URI.
 */
export const openCalendarApp = async (): Promise<void> => {
  const url = Platform.OS === 'ios' ? 'calshow:' : 'content://com.android.calendar/time'
  await Linking.openURL(url).catch(() => {})
}
