/**
 * Goals and limits.
 *
 * This module contains the fix for the most visible bug in v1 (see IMPROVEMENTS.md §A.1).
 *
 * v1 measured progress against the elapsed fraction of the *calendar* week
 * (`GoalCard.res:655-666`). A goal of "60 min every weekday" was therefore judged against
 * a target that kept rising through Saturday and Sunday, on days the user had explicitly
 * excluded — so a week completed perfectly on Friday showed ~71 % on Sunday evening.
 *
 * Here, progress is measured against elapsed *scheduled* time: only the days the goal
 * actually applies to count, and today counts pro rata. The same change makes the daily
 * average correct, and generalises the whole model to day / month / year periods for
 * free, because everything is expressed in terms of "the selected days inside the
 * period's range" rather than "one week".
 */

import { Activity, matches } from './activities'
import { Bucket } from './aggregate'
import { CategoryId } from './categories'
import {
  MINUTES_PER_DAY,
  addDays,
  dayOfWeek,
  endOfDay,
  endOfMonth,
  endOfYear,
  minutesElapsedInDay,
  startOfDay,
  startOfMonth,
  startOfYear,
} from './time'
import { Range, WeekStartsOn, endOfWeek, startOfWeek } from './week'

export type GoalMode = 'goal' | 'limit'
export type GoalPeriod = 'day' | 'week' | 'month' | 'year'

export type Goal = {
  id: string
  /** Optional; the UI falls back to the joined category/activity names. */
  title: string
  createdAt: number
  mode: GoalMode
  /** Length 7, index 0 = Sunday, matching `Date.prototype.getDay`. */
  days: boolean[]
  /** Minutes per scheduled day. */
  durationPerDay: number
  categoryIds: CategoryId[]
  activityIds: string[]
  period: GoalPeriod
}

export const ALL_DAYS: boolean[] = [true, true, true, true, true, true, true]

export const makeGoal = (
  input: Omit<Goal, 'id' | 'createdAt'>,
  createdAt: number,
  id: string,
): Goal => ({ ...input, id, createdAt })

/**
 * Editing preserves identity. v1 rebuilt the goal through `Goal.make` on every keystroke,
 * which regenerated both `id` and `createdAt` (IMPROVEMENTS.md §A.2).
 */
export const updateGoal = (goal: Goal, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>): Goal => ({
  ...goal,
  ...patch,
})

export const isValid = (goal: Goal): boolean =>
  goal.durationPerDay > 0 &&
  goal.days.some(Boolean) &&
  (goal.categoryIds.length > 0 || goal.activityIds.length > 0)

// ---------------------------------------------------------------------------
// Period windows
// ---------------------------------------------------------------------------

export const periodRange = (
  period: GoalPeriod,
  now: number,
  weekStartsOn: WeekStartsOn,
): Range => {
  switch (period) {
    case 'day':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'week':
      return { start: startOfWeek(now, weekStartsOn), end: endOfWeek(now, weekStartsOn) }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) }
  }
}

/** Start-of-day instants inside `range` on which the goal applies. */
export const scheduledDays = (goal: Goal, range: Range): number[] => {
  const days: number[] = []
  for (let day = startOfDay(range.start); day <= range.end; day = addDays(day, 1)) {
    if (goal.days[dayOfWeek(day)]) days.push(day)
  }
  return days
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export type GoalStatus =
  /** Goal: target already met. Limit: cannot be exceeded any more. */
  | 'achieved'
  /** On or ahead of the pace needed to finish the period. */
  | 'onTrack'
  /** Behind pace, but still reachable / still respectable. */
  | 'behind'
  /** Goal: no longer reachable. Limit: already over. */
  | 'missed'

export type GoalProgress = {
  /** Minutes logged against this goal so far in the period. */
  current: number
  /** Total minutes the goal asks for over the whole period. */
  target: number
  /** Minutes the goal asks for by the end of today. */
  expectedByTonight: number
  /** `current / target` — 1 means the period's target is met. */
  completion: number
  /** `current / expectedByTonight` — 1 means exactly on pace. */
  pace: number
  /**
   * Average minutes per scheduled day, counting today as a whole day. Using elapsed
   * *wall-clock* time here would make the figure drift downwards through the day even
   * when nothing changes — and explode just after midnight. Counting today whole means it
   * only moves when the user actually logs time.
   */
  dailyAverage: number
  /** Wall-clock minutes left on scheduled days, including the rest of today. */
  remainingCapacity: number
  status: GoalStatus
}

/**
 * Minutes of scheduled time that have elapsed at `at`. Days before `at` count fully,
 * today counts pro rata, future days count zero.
 */
const scheduledMinutesElapsed = (goal: Goal, range: Range, at: number): number =>
  scheduledDays(goal, range).reduce(
    (sum, day) => sum + minutesElapsedInDay(day, at),
    0,
  )

export const goalMinutes = (
  goal: Goal,
  byCategory: readonly Bucket[],
  byTitle: readonly Bucket[],
  activities: readonly Activity[],
): number => {
  const fromCategories = byCategory
    .filter((b) => goal.categoryIds.includes(b.key))
    .reduce((sum, b) => sum + b.minutes, 0)

  const selected = activities.filter((a) => goal.activityIds.includes(a.id))
  const fromActivities = byTitle
    .filter((b) => selected.some((a) => matches(a, b.key)))
    .reduce((sum, b) => sum + b.minutes, 0)

  return fromCategories + fromActivities
}

export const computeProgress = (
  goal: Goal,
  current: number,
  range: Range,
  now: number,
): GoalProgress => {
  const days = scheduledDays(goal, range)
  const target = goal.durationPerDay * days.length

  const elapsedTonight = scheduledMinutesElapsed(goal, range, endOfDay(now))
  const expectedByTonight = (goal.durationPerDay * elapsedTonight) / MINUTES_PER_DAY
  const daysThroughTonight = elapsedTonight / MINUTES_PER_DAY

  // Remaining capacity is real wall-clock time, so it uses `now`, not tonight.
  const elapsedNow = scheduledMinutesElapsed(goal, range, now)
  const totalScheduledMinutes = days.length * MINUTES_PER_DAY
  const remainingCapacity = Math.max(0, totalScheduledMinutes - elapsedNow)

  const completion = target > 0 ? current / target : 0
  const pace = expectedByTonight > 0 ? current / expectedByTonight : 0
  const dailyAverage = daysThroughTonight > 0 ? current / daysThroughTonight : 0

  return {
    current,
    target,
    expectedByTonight,
    completion,
    pace,
    dailyAverage,
    remainingCapacity,
    status: statusOf(goal.mode, current, target, pace, remainingCapacity),
  }
}

const statusOf = (
  mode: GoalMode,
  current: number,
  target: number,
  pace: number,
  remainingCapacity: number,
): GoalStatus => {
  if (mode === 'goal') {
    if (current >= target) return 'achieved'
    if (target - current > remainingCapacity) return 'missed'
    return pace >= 0.9 ? 'onTrack' : 'behind'
  }
  // limit
  if (current > target) return 'missed'
  if (target - current > remainingCapacity) return 'achieved'
  return pace <= 1 ? 'onTrack' : 'behind'
}

/**
 * A goal's display title: its own if set, otherwise the joined names of what it tracks.
 */
export const goalTitle = (
  goal: Goal,
  activities: readonly Activity[],
  categoryName: (id: CategoryId) => string,
): string => {
  if (goal.title.trim().length > 0) return goal.title
  const names = [
    ...goal.activityIds.map((id) => activities.find((a) => a.id === id)?.title ?? ''),
    ...goal.categoryIds.map(categoryName),
  ].filter((n) => n.length > 0)
  return names.join(', ')
}

/**
 * "every day" / "every weekday" / "Mon, Wed, Fri" — the cadence in plain language.
 * v1 pattern-matched a handful of hardcoded English arrays; this derives it and defers
 * day names to `Intl`.
 */
export const describeDays = (days: readonly boolean[], locale: string): string => {
  const count = days.filter(Boolean).length
  if (count === 7) return 'every day'
  if (count === 0) return 'never'

  const isWeekday = (i: number) => i >= 1 && i <= 5
  if (count === 5 && days.every((on, i) => on === isWeekday(i))) return 'every weekday'
  if (count === 2 && days.every((on, i) => on === !isWeekday(i))) return 'every weekend day'

  // 2026-01-04 is a Sunday, so index 0 lines up with `Date.getDay()`.
  const reference = Date.UTC(2026, 0, 4)
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
  return days
    .map((on, i) => (on ? format.format(new Date(reference + i * 86_400_000)) : null))
    .filter((n): n is string => n !== null)
    .join(', ')
}
