/**
 * The app's own event shape, and the two different questions the app asks about it.
 *
 * Everything downstream of `src/data/calendars.ts` works on `TimeEvent`, never on the
 * native calendar objects. See docs/CALENDAR.md §5 — this projection is what makes the
 * aggregation layer pure, fast and testable, and it is the single file that would change
 * if the calendar provider ever needed replacing.
 */

import { isSkipped } from './activities'
import { RuleSet, isCategorised } from './rules'

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

const inSelectedCalendar = (event: TimeEvent, filter: EventFilter): boolean =>
  !filter.skippedCalendarIds.includes(event.calendarId)

const isHidden = (event: TimeEvent, filter: EventFilter): boolean =>
  filter.hideSkippedActivities && isSkipped(event.title, filter.skippedActivityTitles)

/**
 * Visible in the reports: the weekly chart and the activity list.
 */
export const isVisible = (event: TimeEvent, filter: EventFilter): boolean => {
  if (event.allDay) return false
  if (!inSelectedCalendar(event, filter)) return false
  if (isHidden(event, filter)) return false
  return true
}

export const filterEvents = (
  events: readonly TimeEvent[],
  filter: EventFilter,
): TimeEvent[] => events.filter((e) => isVisible(e, filter))

/**
 * Counted towards goals — a *different* question, and issue #29.
 *
 * > Example: I want to hide "sleep" from my Home Screen, but still have a Rest goal
 * > (that include sleep activity). It should count. Something should count as soon as it
 * > has been categorised, visible or not.
 *
 * Hiding an activity is a statement about the report ("stop showing me sleep, it dwarfs
 * everything else"), not about the goal. So a hidden event still counts — on the exact
 * condition the issue gives: that it has been categorised. An uncategorised event that is
 * also hidden is noise by both measures and stays out.
 *
 * A deselected *calendar* is different again: that is a statement about the data source,
 * and it applies everywhere.
 */
export const isCountedInGoals = (
  event: TimeEvent,
  filter: EventFilter,
  rules: RuleSet,
): boolean => {
  if (event.allDay) return false
  if (!inSelectedCalendar(event, filter)) return false
  if (!isHidden(event, filter)) return true
  return isCategorised(event, rules)
}

export const goalEvents = (
  events: readonly TimeEvent[],
  filter: EventFilter,
  rules: RuleSet,
): TimeEvent[] => events.filter((e) => isCountedInGoals(e, filter, rules))

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

  const visibleCalendars = timed.filter((e) => inSelectedCalendar(e, filter))
  if (visibleCalendars.length === 0) return 'only-skipped-calendars'

  const visible = visibleCalendars.filter((e) => !isHidden(e, filter))
  if (visible.length === 0) return 'only-skipped-activities'

  return 'has-events'
}

/** Convenience for screens that need the activity set of a range. */
export const distinctTitles = (events: readonly TimeEvent[]): string[] =>
  Array.from(new Set(events.map((e) => e.title)))
