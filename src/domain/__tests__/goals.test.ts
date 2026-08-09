import { Activity } from '../activities'
import {
  ALL_DAYS,
  Goal,
  computeProgress,
  describeDays,
  goalMinutes,
  periodRange,
  scheduledDays,
  updateGoal,
} from '../goals'
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

  it('is behind when below pace', () => {
    expect(computeProgress(g, 120, WEEK, wednesdayNoon).status).toBe('behind')
  })

  it('is on track at or near pace', () => {
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

  it('keeps a goal alive while it is still reachable', () => {
    const p = computeProgress(g, 0, WEEK, at(2026, 7, 10, 9))
    expect(p.status).toBe('behind')
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
  ]

  it('sums the goal categories', () => {
    const minutes = goalMinutes(
      goal(),
      [
        { key: 'exercise', minutes: 90 },
        { key: 'work', minutes: 500 },
      ],
      [],
      activities,
    )
    expect(minutes).toBe(90)
  })

  it('sums explicitly selected activities through their match rule', () => {
    const minutes = goalMinutes(
      goal({ categoryIds: [], activityIds: ['a1'] }),
      [],
      [
        { key: 'Morning run', minutes: 45 },
        { key: 'Lunch', minutes: 60 },
      ],
      activities,
    )
    expect(minutes).toBe(45)
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
    expect(describeDays([true, false, false, false, false, false, true], 'en-US')).toBe(
      'every weekend day',
    )
  })

  it('falls back to a locale-formatted day list', () => {
    const monWedFri = [false, true, false, true, false, true, false]
    expect(describeDays(monWedFri, 'en-US')).toBe('Mon, Wed, Fri')
  })
})
