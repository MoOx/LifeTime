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

/**
 * The same question over the window v1 actually asked about: **the last two weeks**
 * (`NoEventBox.res:12-74`), not the visible one.
 *
 * The distinction matters on exactly the day it is most likely to be seen. On a Monday
 * morning the current week is empty for everyone, and telling a user with a full calendar
 * that "LifeTime could not find any events" is simply false — it is the message for
 * someone who has never logged anything, shown to someone who logs constantly. Two weeks
 * is long enough that an empty answer means something.
 */
export const explainEmptinessOverWeeks = (
  weeks: readonly (readonly TimeEvent[] | undefined)[],
  filter: EventFilter,
): EmptyReason | undefined => {
  // A week still loading cannot contribute to a verdict about absence.
  if (weeks.some((week) => week === undefined)) return undefined
  return explainEmptiness(weeks.flat() as TimeEvent[], filter)
}

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

/**
 * Which week the Summary should open on, given the weeks it has loaded (oldest first).
 *
 * Issue #19:
 *
 * > Monday morning (no data) should display last week instead […] if there is no data for
 * > the current week, we should show last week data instead of empty week.
 * >
 * > Note: Screentime for example don't have this problem as you always have data, at
 * > least the current minute session you are in.
 *
 * That last note is the whole diagnosis: a screen-time app is never empty, a diary app is
 * empty every Monday until you write something. Opening on an empty chart makes the app
 * look broken on the one morning a week it is most likely to be checked.
 *
 * `lookBack` bounds how far it will reach — one week by default. Landing the user on a
 * month-old chart without warning would be more confusing than an empty one, and the
 * "This week" control makes the position obvious either way.
 */
export const initialWeekIndex = (
  eventsByWeek: readonly (TimeEvent[] | undefined)[],
  lookBack = 1,
): number => {
  const last = eventsByWeek.length - 1
  if (last < 0) return 0
  for (let i = last; i >= Math.max(0, last - lookBack); i--) {
    const events = eventsByWeek[i]
    // Still loading: do not skip past a week we know nothing about yet.
    if (events === undefined) return last
    if (events.some((e) => !e.allDay)) return i
  }
  return last
}
