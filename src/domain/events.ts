/**
 * The app's own event shape.
 *
 * Everything downstream of `src/data/events.ts` works on `TimeEvent`, never on the
 * native calendar objects. See docs/CALENDAR.md §5 — this projection is what makes the
 * aggregation layer pure, fast and testable, and it is the single file that would change
 * if the calendar provider ever needed replacing.
 */

import { isSkipped } from './activities'

export type TimeEvent = {
  id: string
  calendarId: string
  title: string
  /** Epoch ms. */
  start: number
  /** Epoch ms. */
  end: number
  allDay: boolean
}

/**
 * Recurring occurrences share an event id on both iOS and Android, so lists must be
 * keyed on the occurrence, not the event.
 */
export const eventKey = (event: TimeEvent): string => `${event.id}@${event.start}`

export type EventFilter = {
  skippedCalendarIds: readonly string[]
  skippedActivityTitles: readonly string[]
  /** Master switch for `skippedActivityTitles`, mirroring v1's `activitiesSkippedFlag`. */
  hideSkippedActivities: boolean
}

export const isVisible = (event: TimeEvent, filter: EventFilter): boolean => {
  if (event.allDay) return false
  if (filter.skippedCalendarIds.includes(event.calendarId)) return false
  if (filter.hideSkippedActivities && isSkipped(event.title, filter.skippedActivityTitles))
    return false
  return true
}

export const filterEvents = (
  events: readonly TimeEvent[],
  filter: EventFilter,
): TimeEvent[] => events.filter((e) => isVisible(e, filter))

/**
 * Why the Summary is empty — drives the contextual empty state, so the user is told what
 * to fix rather than just "no data".
 */
export type EmptyReason =
  | 'no-events'
  | 'only-all-day'
  | 'only-skipped-calendars'
  | 'only-skipped-activities'
  | 'has-events'

export const explainEmptiness = (
  events: readonly TimeEvent[],
  filter: EventFilter,
): EmptyReason => {
  if (events.length === 0) return 'no-events'

  const timed = events.filter((e) => !e.allDay)
  if (timed.length === 0) return 'only-all-day'

  const visibleCalendars = timed.filter(
    (e) => !filter.skippedCalendarIds.includes(e.calendarId),
  )
  if (visibleCalendars.length === 0) return 'only-skipped-calendars'

  const visible = visibleCalendars.filter(
    (e) =>
      !filter.hideSkippedActivities || !isSkipped(e.title, filter.skippedActivityTitles),
  )
  if (visible.length === 0) return 'only-skipped-activities'

  return 'has-events'
}

/** Convenience for screens that need the activity set of a range. */
export const distinctTitles = (events: readonly TimeEvent[]): string[] =>
  Array.from(new Set(events.map((e) => e.title)))
