import { Activity } from '../activities'
import { TimeEvent } from '../events'
import {
  ALL_DAYS,
  Goal,
  computeProgress,
  describeDays,
  goalMinutes,
  goalRanges,
  periodRange,
  ringFraction,
  scheduledDays,
  updateGoal,
} from '../goals'
import { RuleSet } from '../rules'
import { weekRange } from '../week'

const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m, d, h, min).getTime()

// 2026-08-10 is a Monday; the week runs Mon 10 → Sun 16 with a Monday-first locale.
const MONDAY = at(2026, 7, 10)
const WEEK = weekRange(MONDAY, 1)

const WEEKDAYS = [false, true, true, true, true, true, false]

const goal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'g1',
  title: '',
  createdAt: 0,
  mode: 'goal',
  days: WEEKDAYS,
  durationPerDay: 60,
  categoryIds: ['exercise'],
  activityIds: [],
  period: 'week',
  ...overrides,
})

describe('scheduledDays', () => {
  it('only counts the days the goal applies to', () => {
    expect(scheduledDays(goal(), WEEK)).toHaveLength(5)
    expect(scheduledDays(goal({ days: ALL_DAYS }), WEEK)).toHaveLength(7)
  })
})

/**
 * The Goals screen used to clamp the period to now and then hand that same range to
 * `computeProgress`, so a goal's target shrank to the days that had already happened: an
 * "8 h every weekday" goal read "15h 1m of 16h this week" on a Tuesday, under a footnote
 * promising the ring filled across the whole period. `goalRanges` exists so the two uses
 * cannot be confused, and these pin the distinction.
 */
describe('goalRanges', () => {
  const tuesdayNoon = at(2026, 7, 11, 12)
  const eightHoursWeekdays = goal({ durationPerDay: 480 })

  it('keeps the period whole and clamps only the counting window', () => {
    const { period, counted } = goalRanges(eightHoursWeekdays, tuesdayNoon, 1)
    expect(period.end).toBe(WEEK.end)
    expect(counted.end).toBe(tuesdayNoon)
    expect(counted.start).toBe(period.start)
  })

  it('targets the whole period, not the part of it that has gone by', () => {
    const { period } = goalRanges(eightHoursWeekdays, tuesdayNoon, 1)
    // Five weekdays at eight hours, whatever day it is today.
    expect(computeProgress(eightHoursWeekdays, 901, period, tuesdayNoon).target).toBe(2400)
  })

  it('stops clamping once the period is over', () => {
    // The last instant of the week: there is no future left inside it to cut off.
    const { period, counted } = goalRanges(eightHoursWeekdays, WEEK.end, 1)
    expect(counted.end).toBe(period.end)
  })
})

describe('computeProgress — the v1 weekend bug', () => {
  // v1 measured progress against the elapsed fraction of the *calendar* week, so a
  // weekday goal completed on Friday appeared to decay across Saturday and Sunday.
  const g = goal()
  const perfectWeek = 300 // 60 min × 5 weekdays

  it('is on pace on Friday evening after a perfect week', () => {
    const friday = computeProgress(g, perfectWeek, WEEK, at(2026, 7, 14, 20))
    expect(friday.target).toBe(300)
    expect(friday.completion).toBeCloseTo(1)
    expect(friday.pace).toBeCloseTo(1)
    expect(friday.status).toBe('achieved')
  })

  it('does not change over the weekend when nothing happens', () => {
    const friday = computeProgress(g, perfectWeek, WEEK, at(2026, 7, 14, 20))
    const saturday = computeProgress(g, perfectWeek, WEEK, at(2026, 7, 15, 20))
    const sunday = computeProgress(g, perfectWeek, WEEK, at(2026, 7, 16, 20))

    expect(saturday.pace).toBeCloseTo(friday.pace)
    expect(sunday.pace).toBeCloseTo(friday.pace)
    expect(sunday.dailyAverage).toBeCloseTo(friday.dailyAverage)
  })
})

describe('computeProgress — mid-week', () => {
  const g = goal()
  // Wednesday noon: Mon and Tue are done, Wed is half over → 2.5 scheduled days elapsed.
  const wednesdayNoon = at(2026, 7, 12, 12)

  it('expects a full day of target for every scheduled day up to tonight', () => {
    const p = computeProgress(g, 120, WEEK, wednesdayNoon)
    expect(p.expectedByTonight).toBeCloseTo(180) // Mon + Tue + Wed
  })

  it('reports a daily average over scheduled days, counting today whole', () => {
    const p = computeProgress(g, 120, WEEK, wednesdayNoon)
    expect(p.dailyAverage).toBeCloseTo(40) // 120 over Mon + Tue + Wed
  })

  it('keeps the daily average stable across a day with no activity', () => {
    const morning = computeProgress(g, 120, WEEK, at(2026, 7, 12, 8))
    const evening = computeProgress(g, 120, WEEK, at(2026, 7, 12, 22))
    expect(evening.dailyAverage).toBeCloseTo(morning.dailyAverage)
  })

  it('is behind when the days already over came up short', () => {
    // Mon + Tue asked for 120; only 60 logged.
    expect(computeProgress(g, 60, WEEK, wednesdayNoon).status).toBe('behind')
  })

  it('is on track once those days are covered, whatever today looks like so far', () => {
    expect(computeProgress(g, 120, WEEK, wednesdayNoon).status).toBe('onTrack')
    expect(computeProgress(g, 180, WEEK, wednesdayNoon).status).toBe('onTrack')
  })
})

describe('computeProgress — reachability', () => {
  const g = goal()

  it('marks a goal missed once the remaining scheduled time cannot cover it', () => {
    // Friday 23:30: only 30 min of scheduled time left in the week, 300 still needed.
    const p = computeProgress(g, 0, WEEK, at(2026, 7, 14, 23, 30))
    expect(p.remainingCapacity).toBeLessThan(60)
    expect(p.status).toBe('missed')
  })

  // The empty-ring rule: on the first morning of a goal's week, nothing has gone wrong.
  it('does not call a goal behind before any scheduled day has finished', () => {
    const p = computeProgress(g, 0, WEEK, at(2026, 7, 10, 9))
    expect(p.expectedByYesterday).toBe(0)
    expect(p.status).toBe('onTrack')
  })
})

describe('computeProgress — limits', () => {
  const limit = goal({ mode: 'limit', days: ALL_DAYS, durationPerDay: 30 }) // 210/week

  it('is missed once exceeded', () => {
    expect(computeProgress(limit, 400, WEEK, at(2026, 7, 12, 12)).status).toBe('missed')
  })

  it('is on track while under pace', () => {
    expect(computeProgress(limit, 40, WEEK, at(2026, 7, 12, 12)).status).toBe('onTrack')
  })

  it('is behind when burning through it too fast', () => {
    expect(computeProgress(limit, 150, WEEK, at(2026, 7, 12, 12)).status).toBe('behind')
  })

  it('is achieved once it can no longer be exceeded', () => {
    // Sunday 23:30: 30 min of week left, 210 still allowed.
    expect(computeProgress(limit, 0, WEEK, at(2026, 7, 16, 23, 30)).status).toBe('achieved')
  })
})

describe('periodRange', () => {
  it('supports every period', () => {
    const now = at(2026, 7, 12, 12)
    expect(new Date(periodRange('day', now, 1).start).getDate()).toBe(12)
    expect(new Date(periodRange('week', now, 1).start).getDate()).toBe(10)
    expect(new Date(periodRange('month', now, 1).start).getDate()).toBe(1)
    expect(new Date(periodRange('year', now, 1).start).getMonth()).toBe(0)
  })

  it('scales a daily goal to a single day', () => {
    const daily = goal({ period: 'day', days: [true, ...ALL_DAYS.slice(1)] })
    const range = periodRange('day', at(2026, 7, 12, 12), 1)
    expect(computeProgress(daily, 30, range, at(2026, 7, 12, 12)).target).toBe(60)
  })
})

describe('goalMinutes', () => {
  const activities: Activity[] = [
    { id: 'a1', title: 'Run', match: 'contains', categoryId: 'exercise', createdAt: 0 },
    { id: 'a2', title: 'Deep work', match: 'exact', categoryId: 'work', createdAt: 0 },
  ]
  const ruleSet: RuleSet = { activities, calendars: {} }

  const day = at(2026, 7, 12)
  const range = { start: day, end: day + 24 * 60 * 60_000 }
  const ev = (title: string, startHour: number, minutes: number): TimeEvent => ({
    id: `${title}@${startHour}`,
    calendarId: 'cal',
    title,
    start: day + startHour * 60 * 60_000,
    end: day + startHour * 60 * 60_000 + minutes * 60_000,
    allDay: false,
  })

  it('sums the goal categories', () => {
    const events = [ev('Morning run', 7, 90), ev('Deep work', 10, 500)]
    expect(goalMinutes(goal(), events, ruleSet, range)).toBe(90)
  })

  it('sums explicitly selected activities through their match rule', () => {
    const events = [ev('Morning run', 7, 45), ev('Lunch', 12, 60)]
    const tracked = goal({ categoryIds: [], activityIds: ['a1'] })
    expect(goalMinutes(tracked, events, ruleSet, range)).toBe(45)
  })

  it('counts an event once when the goal names both its category and its activity', () => {
    const both = goal({ categoryIds: ['exercise'], activityIds: ['a1'] })
    expect(goalMinutes(both, [ev('Morning run', 7, 45)], ruleSet, range)).toBe(45)
  })

  it('clamps an event to the period, so a night crossing midnight is not counted twice', () => {
    const nightly = goal({ categoryIds: ['work'] })
    // 23:00 → 03:00, but the range ends at midnight.
    expect(goalMinutes(nightly, [ev('Deep work', 23, 240)], ruleSet, range)).toBe(60)
  })
})

describe('ringFraction', () => {
  const weekly = goal({ period: 'week', durationPerDay: 60, days: ALL_DAYS })

  // Monday 09:00: 7 h into a 7-day week, one hour already logged.
  const mondayMorning = at(2026, 7, 10, 9)
  const progress = computeProgress(weekly, 60, WEEK, mondayMorning)

  it('reads as a share of the whole period in `period` mode', () => {
    // 60 of the 420 minutes the week asks for.
    expect(ringFraction(progress, 'period')).toBeCloseTo(60 / 420)
  })

  it('reads as a share of what is due tonight in `pace` mode', () => {
    // Monday is the only elapsed day by tonight, so 60 of 60.
    expect(ringFraction(progress, 'pace')).toBeCloseTo(1)
  })

  it('is what makes an empty Monday-morning ring correct rather than alarming', () => {
    const nothingYet = computeProgress(weekly, 0, WEEK, mondayMorning)
    expect(ringFraction(nothingYet, 'period')).toBe(0)
    expect(nothingYet.status).toBe('onTrack')
  })
})

describe('updateGoal', () => {
  it('preserves identity and creation date', () => {
    const original = goal({ id: 'keep-me', createdAt: 1234 })
    const edited = updateGoal(original, { title: 'Renamed', durationPerDay: 90 })
    expect(edited.id).toBe('keep-me')
    expect(edited.createdAt).toBe(1234)
    expect(edited.title).toBe('Renamed')
  })
})

describe('describeDays', () => {
  it('names the common cadences', () => {
    expect(describeDays(ALL_DAYS, 'en-US')).toBe('every day')
    expect(describeDays(WEEKDAYS, 'en-US')).toBe('every weekday')
    // v1's wording (`GoalCard.res:283`) — it reads better than "every weekend day".
    expect(describeDays([true, false, false, false, false, false, true], 'en-US')).toBe(
      'every day of the weekend',
    )
  })

  // The four cases v1 spelled out and the first rebuild dropped. "Mon, Tue, Thu, Fri"
  // makes the reader do the subtraction; naming the missing day does not.
  it('names a weekday cadence with one day missing', () => {
    const exceptWednesday = [false, true, true, false, true, true, false]
    expect(describeDays(exceptWednesday, 'en-US')).toBe('every weekday except wednesday')

    const exceptMonday = [false, false, true, true, true, true, false]
    expect(describeDays(exceptMonday, 'en-US')).toBe('every weekday except monday')

    const exceptFriday = [false, true, true, true, true, false, false]
    expect(describeDays(exceptFriday, 'en-US')).toBe('every weekday except friday')
  })

  it('does not claim a weekday cadence when a weekend day is involved', () => {
    const fourDaysWithSunday = [true, true, true, true, false, false, false]
    expect(describeDays(fourDaysWithSunday, 'en-US')).toBe('Sun, Mon, Tue, Wed')
  })

  it('falls back to a locale-formatted day list', () => {
    const monWedFri = [false, true, false, true, false, true, false]
    expect(describeDays(monWedFri, 'en-US')).toBe('Mon, Wed, Fri')
  })
})
