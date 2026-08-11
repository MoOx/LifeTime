/**
 * Where events come from.
 *
 * Until now every screen that needed events wrote the same branch by hand:
 *
 *     const live = useEventRanges(granted ? calendarIds : [], ranges)
 *     const events = granted ? live.byRange[0] : demoEvents(range, now)
 *
 * Four screens, four copies, and each one had to remember to pass `now` so the demo week
 * stopped at the current moment, to skip the calendar read when there was no permission,
 * and to append the demo rules. Miss one and the screen silently disagrees with the others
 * about what the user is looking at.
 *
 * So the branch moves here, once. A source is four things — a name, a privacy claim, a
 * list of calendars, and a list of events in a window — and every screen above this layer
 * just asks the current source. Demo mode stops being a special case handled per screen
 * and becomes a source that happens to generate its data.
 *
 * That is also what the web target needs (`docs/SCREENS.md` §12): a browser has no
 * `EKEventStore`, so on web the device source cannot answer, and a Google Calendar source
 * would slot in beside these two without a screen changing. The privacy screen reads its
 * claim off the source for the same reason — "nothing leaves the device" is true of the
 * device source and would be a lie about a source that speaks to Google.
 */

import { Platform } from 'react-native'

import { DEMO_CALENDARS, demoEvents } from '@/domain/demo'
import type { TimeEvent } from '@/domain/events'
import type { CalendarRef } from '@/domain/settings'
import { listCalendars, listEvents } from './calendars'

export type SourceId = 'device' | 'demo'

export type EventSource = {
  id: SourceId
  /** Names the source wherever the app has to say where a number came from. */
  label: string
  /**
   * What the Privacy screen may honestly claim about this source, in one sentence. Every
   * source states its own, so the claim can never drift from the data path in use.
   */
  privacy: string
  listCalendars: () => Promise<CalendarRef[]>
  listEvents: (
    calendarIds: readonly string[],
    start: Date,
    end: Date,
  ) => Promise<TimeEvent[]>
}

export const deviceSource: EventSource = {
  id: 'device',
  label: 'Your calendars',
  privacy:
    'Your events are read from this device, counted, and forgotten when you close the app. There is no account, no server and no analytics.',
  listCalendars,
  listEvents: (calendarIds, start, end) => listEvents([...calendarIds], start, end),
}

export const demoSource: EventSource = {
  id: 'demo',
  label: 'Demo data',
  privacy:
    'You are looking at a generated week. LifeTime has not read your calendars — it has not been given permission yet.',
  listCalendars: () => Promise.resolve(DEMO_CALENDARS),
  /**
   * Clamped to now, so the current week is as incomplete as a real one would be. The clock
   * is read here rather than in `demoEvents`, which stays pure and therefore testable.
   */
  listEvents: (calendarIds, start, end) => {
    const events = demoEvents({ start: start.getTime(), end: end.getTime() }, Date.now())
    const wanted = new Set(calendarIds)
    return Promise.resolve(events.filter((event) => wanted.has(event.calendarId)))
  },
}

/**
 * The device source is only usable where there is a device calendar store to read. On web
 * `expo-calendar` has no implementation, so asking would throw rather than return nothing
 * — which is exactly the class of failure that killed two launches already.
 */
export const DEVICE_SOURCE_AVAILABLE = Platform.OS === 'ios' || Platform.OS === 'android'

export const sourceFor = (hasPermission: boolean): EventSource =>
  hasPermission && DEVICE_SOURCE_AVAILABLE ? deviceSource : demoSource
