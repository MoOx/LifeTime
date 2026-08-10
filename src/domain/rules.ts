/**
 * How an event becomes a category.
 *
 * v1 had exactly one mechanism: tap an activity, pick a category, and the mapping applied
 * to event titles that were *strictly equal* after lowercasing. With a calendar of a few
 * hundred distinct titles that is a few hundred taps, which is the real reason the app
 * was never adopted beyond its author.
 *
 * There are three mechanisms here, tried in order of how specific they are:
 *
 *   1. **Text rules** — an `Activity` with a `match` mode (`exact`, `startsWith`,
 *      `endsWith`, `contains`). This is issue #13, promised in v1's own help text as a
 *      "Premium" feature and never built. `resolveCategoryId` picks the most specific
 *      match, so `contains "dinner" → Nutrition` never shadows
 *      `exact "dinner with jane" → Social`.
 *
 *   2. **Calendar rules** — "everything in this calendar is Work". One tap categorises a
 *      whole calendar, which for anyone whose work life already lives in its own calendar
 *      is the entire onboarding.
 *
 *   3. **Keyword suggestions** — a small built-in table, so a brand-new user sees a
 *      meaningful chart before doing anything at all. Only ever a *suggestion*: it is
 *      offered in the UI and can be accepted in bulk, but it never silently decides.
 *
 * A fourth is designed for and deliberately not built yet: an on-device model
 * (Apple's Foundation Models on iOS 26, ML Kit GenAI on Android) proposing a category
 * from the event title. `Resolution.source` already carries the vocabulary for it, and
 * `suggestAll` is the shape its results would arrive in — see docs/CATEGORISATION.md.
 */

import { Activity, matches, normalizeTitle, suggestCategoryId } from './activities'
import { CategoryId, UNKNOWN_CATEGORY_ID } from './categories'
import { TimeEvent } from './events'

/** Which calendars map wholesale to a category. Keyed by calendar id. */
export type CalendarRules = Readonly<Record<string, CategoryId>>

export type ResolutionSource =
  /** A text rule the user wrote. */
  | 'activity'
  /** The event's calendar is mapped to a category. */
  | 'calendar'
  /** The built-in keyword table. */
  | 'keyword'
  /** An on-device model. Not implemented yet; the vocabulary is reserved. */
  | 'model'
  /** Nothing matched. */
  | 'none'

export type Resolution = {
  categoryId: CategoryId
  source: ResolutionSource
  /** The rule that decided, when one did. */
  activityId?: string
}

export type RuleSet = {
  activities: readonly Activity[]
  calendars: CalendarRules
}

export const EMPTY_RULES: RuleSet = { activities: [], calendars: {} }

/**
 * More specific rules win. Within a mode, the longer pattern wins, so a user can refine
 * a broad rule by adding a narrower one without having to delete the first.
 */
const SPECIFICITY: Record<Activity['match'], number> = {
  exact: 3,
  startsWith: 2,
  endsWith: 2,
  contains: 1,
}

const bestActivity = (
  eventTitle: string,
  activities: readonly Activity[],
): Activity | undefined => {
  let best: Activity | undefined
  for (const activity of activities) {
    if (!matches(activity, eventTitle)) continue
    if (
      best === undefined ||
      SPECIFICITY[activity.match] > SPECIFICITY[best.match] ||
      (SPECIFICITY[activity.match] === SPECIFICITY[best.match] &&
        normalizeTitle(activity.title).length > normalizeTitle(best.title).length)
    ) {
      best = activity
    }
  }
  return best
}

/**
 * The full answer, including *why*. The UI uses the reason: a calendar-wide match is
 * shown differently from a rule the user wrote by hand, and a keyword guess is shown as a
 * guess with a one-tap way to confirm it.
 */
export const resolve = (
  event: Pick<TimeEvent, 'title' | 'calendarId'>,
  rules: RuleSet,
  { includeKeywords = false } = {},
): Resolution => {
  const activity = bestActivity(event.title, rules.activities)
  if (activity !== undefined) {
    return {
      categoryId: activity.categoryId,
      source: 'activity',
      activityId: activity.id,
    }
  }

  const fromCalendar = rules.calendars[event.calendarId]
  if (fromCalendar !== undefined && fromCalendar !== UNKNOWN_CATEGORY_ID) {
    return { categoryId: fromCalendar, source: 'calendar' }
  }

  if (includeKeywords) {
    const guess = suggestCategoryId(event.title)
    if (guess !== undefined) return { categoryId: guess, source: 'keyword' }
  }

  return { categoryId: UNKNOWN_CATEGORY_ID, source: 'none' }
}

/** The common case: just the category. */
export const categoryOf = (
  event: Pick<TimeEvent, 'title' | 'calendarId'>,
  rules: RuleSet,
): CategoryId => resolve(event, rules).categoryId

export const isCategorised = (
  event: Pick<TimeEvent, 'title' | 'calendarId'>,
  rules: RuleSet,
): boolean => resolve(event, rules).source !== 'none'

// ---------------------------------------------------------------------------
// Bulk categorisation
// ---------------------------------------------------------------------------

export type Suggestion = {
  /** The raw event title, as the user sees it in their calendar. */
  title: string
  categoryId: CategoryId
  source: ResolutionSource
  /** Total minutes this title accounts for over the analysed window. */
  minutes: number
  /** How many occurrences. */
  count: number
}

/**
 * Everything still uncategorised in a window, with a guess for each and enough weight
 * information to sort by impact — the user should be shown the title worth 6 hours before
 * the one worth 20 minutes.
 *
 * This is the data behind the bulk categorisation screen, and it is exactly the payload
 * an on-device model would fill in instead of the keyword table.
 */
export const suggestAll = (
  events: readonly TimeEvent[],
  rules: RuleSet,
  minutesOf: (event: TimeEvent) => number,
): Suggestion[] => {
  const byTitle = new Map<string, Suggestion>()

  for (const event of events) {
    if (event.allDay) continue
    if (isCategorised(event, rules)) continue
    const minutes = minutesOf(event)
    if (minutes <= 0) continue

    const existing = byTitle.get(event.title)
    if (existing !== undefined) {
      existing.minutes += minutes
      existing.count += 1
      continue
    }

    const guess = resolve(event, rules, { includeKeywords: true })
    byTitle.set(event.title, {
      title: event.title,
      categoryId: guess.categoryId,
      source: guess.source,
      minutes,
      count: 1,
    })
  }

  return [...byTitle.values()].sort(
    (a, b) => b.minutes - a.minutes || a.title.localeCompare(b.title),
  )
}

/** How much of a window is already categorised, 0…1. Drives the "you're done" state. */
export const coverage = (
  events: readonly TimeEvent[],
  rules: RuleSet,
  minutesOf: (event: TimeEvent) => number,
): number => {
  let total = 0
  let known = 0
  for (const event of events) {
    if (event.allDay) continue
    const minutes = minutesOf(event)
    if (minutes <= 0) continue
    total += minutes
    if (isCategorised(event, rules)) known += minutes
  }
  return total > 0 ? known / total : 1
}
