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
import { minutesInRange } from './aggregate'
import { CategoryId } from './categories'
import { TimeEvent } from './events'
import { RuleSet, categoryOf } from './rules'
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
  /**
   * Minutes the goal asked for on scheduled days that are *already over*. This, not
   * `expectedByTonight`, is what "behind" is measured against — see `statusOf`.
   */
  expectedByYesterday: number
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

/**
 * Minutes logged against a goal in a window.
 *
 * Counted per event rather than by summing two pre-aggregated bucket lists, because a
 * goal that names both a category and an activity resolving *into* that category would
 * otherwise count those minutes twice — v1 had that bug, and so did the first pass here.
 *
 * `events` should already be narrowed with `goalEvents`, which is what lets an activity
 * hidden from the reports still count (issue #29).
 */
export const goalMinutes = (
  goal: Goal,
  events: readonly TimeEvent[],
  rules: RuleSet,
  range: Range,
): number => {
  const tracked = rules.activities.filter((a) => goal.activityIds.includes(a.id))
  let total = 0

  for (const event of events) {
    const minutes = minutesInRange(event, range)
    if (minutes <= 0) continue
    const byActivity = tracked.some((a) => matches(a, event.title))
    const byCategory = goal.categoryIds.includes(categoryOf(event, rules))
    if (byActivity || byCategory) total += minutes
  }

  return total
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

  // Scheduled days that are entirely behind us. `minutesElapsedInDay` returns 0 for
  // today at its own midnight, so today drops out on its own.
  const elapsedYesterday = scheduledMinutesElapsed(goal, range, startOfDay(now))
  const expectedByYesterday = (goal.durationPerDay * elapsedYesterday) / MINUTES_PER_DAY

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
    expectedByYesterday,
    completion,
    pace,
    dailyAverage,
    remainingCapacity,
    status: statusOf(goal.mode, {
      current,
      target,
      expectedByTonight,
      expectedByYesterday,
      remainingCapacity,
    }),
  }
}

/**
 * Whether a goal is being kept.
 *
 * The subtlety is *when* a goal is allowed to be called "behind". Judging it against
 * `expectedByTonight` means a daily goal is failing from one minute past midnight, every
 * single day, until the user does the thing — which is both useless and demoralising, and
 * is exactly what an Apple Fitness ring does *not* do: an empty ring at 9 a.m. is a
 * prompt, not a verdict.
 *
 * So a goal is behind only when it fell short on days that are *already over*
 * (`expectedByYesterday`). Today is judged when it ends.
 *
 * A limit is the mirror image and keeps the tonight-based comparison: the warning has to
 * arrive while there is still time to stop, not the following morning.
 */
const statusOf = (
  mode: GoalMode,
  p: {
    current: number
    target: number
    expectedByTonight: number
    expectedByYesterday: number
    remainingCapacity: number
  },
): GoalStatus => {
  if (mode === 'goal') {
    if (p.current >= p.target) return 'achieved'
    if (p.target - p.current > p.remainingCapacity) return 'missed'
    if (p.expectedByYesterday <= 0) return 'onTrack'
    return p.current / p.expectedByYesterday >= 0.9 ? 'onTrack' : 'behind'
  }
  // limit
  if (p.current > p.target) return 'missed'
  if (p.target - p.current > p.remainingCapacity) return 'achieved'
  if (p.expectedByTonight <= 0) return 'onTrack'
  return p.current <= p.expectedByTonight ? 'onTrack' : 'behind'
}

// ---------------------------------------------------------------------------
// How the ring reads
// ---------------------------------------------------------------------------

export type RingMode =
  /**
   * Fills over the whole period. Empty on Monday morning, full on Sunday evening — the
   * Apple Fitness reading, where the empty ring *is* the motivation.
   */
  | 'period'
  /**
   * Fills against what the goal asks for by tonight. Answers "am I on track *right now*",
   * and sits near 1 all week when the user is keeping up.
   */
  | 'pace'

export const DEFAULT_RING_MODE: RingMode = 'period'

/** 0…1+ — the fraction of the ring to draw. Can exceed 1; the UI shows the overshoot. */
export const ringFraction = (progress: GoalProgress, mode: RingMode): number =>
  mode === 'period' ? progress.completion : progress.pace

/**
 * The number under the ring. In `period` mode it is the share of the period's target; in
 * `pace` mode, of what was due by tonight.
 */
export const ringPercent = (progress: GoalProgress, mode: RingMode): number =>
  Math.round(ringFraction(progress, mode) * 100)

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
  if (count === 2 && days.every((on, i) => on === !isWeekday(i))) {
    // v1's wording (`GoalCard.res:283`), which reads better than "every weekend day".
    return 'every day of the weekend'
  }

  /**
   * "every weekday except wednesday" — four weekdays and no weekend day. v1 spelled all
   * five cases out by hand (`GoalCard.res:278-282`); they are worth keeping because
   * "Mon, Tue, Thu, Fri" makes the reader do the subtraction themselves.
   */
  if (count === 4 && days.every((on, i) => (on ? isWeekday(i) : true)) && !days[0] && !days[6]) {
    const missing = days.findIndex((on, i) => isWeekday(i) && !on)
    const name = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(2026, 0, 4) + missing * 86_400_000))
    return `every weekday except ${name.toLocaleLowerCase(locale)}`
  }

  // 2026-01-04 is a Sunday, so index 0 lines up with `Date.getDay()`.
  const reference = Date.UTC(2026, 0, 4)
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
  return days
    .map((on, i) => (on ? format.format(new Date(reference + i * 86_400_000)) : null))
    .filter((n): n is string => n !== null)
    .join(', ')
}
