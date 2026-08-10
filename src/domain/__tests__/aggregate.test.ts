import { Activity } from '../activities'
import {
  breakdownByDay,
  chartMaximum,
  gridLines,
  minutesByCategory,
  minutesByTitle,
  stackedSegments,
} from '../aggregate'
import { TimeEvent } from '../events'
import { RuleSet } from '../rules'
import { startOfDay } from '../time'

const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m, d, h, min).getTime()

const event = (
  title: string,
  start: number,
  end: number,
  overrides: Partial<TimeEvent> = {},
): TimeEvent => ({
  id: `${title}-${start}`,
  calendarId: 'cal',
  title,
  start,
  end,
  allDay: false,
  ...overrides,
})

const activities: Activity[] = [
  { id: 'a1', title: 'Sleep', match: 'exact', categoryId: 'rest', createdAt: 0 },
  { id: 'a2', title: 'Standup', match: 'contains', categoryId: 'work', createdAt: 0 },
]

const ruleSet: RuleSet = { activities, calendars: {} }

describe('minutesByTitle', () => {
  const range = { start: at(2026, 7, 10), end: at(2026, 7, 10, 12) }

  it('sums and sorts descending', () => {
    const events = [
      event('Standup', at(2026, 7, 10, 9), at(2026, 7, 10, 9, 15)),
      event('Deep work', at(2026, 7, 10, 10), at(2026, 7, 10, 12)),
      event('Standup', at(2026, 7, 10, 9, 30), at(2026, 7, 10, 9, 45)),
    ]
    expect(minutesByTitle(events, range)).toEqual([
      { key: 'Deep work', minutes: 120 },
      { key: 'Standup', minutes: 30 },
    ])
  })

  it('clamps events that overflow the window', () => {
    // 11:00 → 14:00, but the window ends at 12:00
    const events = [event('Deep work', at(2026, 7, 10, 11), at(2026, 7, 10, 14))]
    expect(minutesByTitle(events, range)).toEqual([{ key: 'Deep work', minutes: 60 }])
  })

  it('ignores events entirely outside the window', () => {
    const events = [event('Later', at(2026, 7, 10, 18), at(2026, 7, 10, 19))]
    expect(minutesByTitle(events, range)).toEqual([])
  })
})

describe('minutesByCategory', () => {
  it('routes titles through the activity rules', () => {
    const range = { start: at(2026, 7, 10), end: at(2026, 7, 10, 23, 59) }
    const events = [
      event('Sleep', at(2026, 7, 10, 0), at(2026, 7, 10, 7)),
      event('Daily Standup', at(2026, 7, 10, 9), at(2026, 7, 10, 9, 30)),
      event('Mystery', at(2026, 7, 10, 14), at(2026, 7, 10, 15)),
    ]
    expect(minutesByCategory(events, ruleSet, range)).toEqual([
      { key: 'rest', minutes: 420 },
      { key: 'unknown', minutes: 60 },
      { key: 'work', minutes: 30 },
    ])
  })
})

describe('breakdownByDay', () => {
  it('splits an event that crosses midnight across both days', () => {
    const days = [at(2026, 7, 10), at(2026, 7, 11)]
    // 22:00 Monday → 06:00 Tuesday
    const events = [event('Sleep', at(2026, 7, 10, 22), at(2026, 7, 11, 6))]

    const [monday, tuesday] = breakdownByDay(events, ruleSet, days)

    expect(monday.day).toBe(startOfDay(days[0]))
    expect(Math.round(monday.totalMinutes)).toBe(120)
    expect(Math.round(tuesday.totalMinutes)).toBe(360)
    expect(monday.byCategory[0].key).toBe('rest')
  })

  it('reports empty days as zero', () => {
    const days = [at(2026, 7, 10), at(2026, 7, 11)]
    const [, tuesday] = breakdownByDay(
      [event('Sleep', at(2026, 7, 10, 1), at(2026, 7, 10, 2))],
      ruleSet,
      days,
    )
    expect(tuesday.totalMinutes).toBe(0)
    expect(tuesday.byCategory).toEqual([])
  })
})

describe('chartMaximum', () => {
  it('rounds to round numbers', () => {
    expect(chartMaximum(0)).toBe(0)
    expect(chartMaximum(35)).toBe(40)
    expect(chartMaximum(61)).toBe(240)
    expect(chartMaximum(500)).toBe(720)
  })
})

describe('gridLines', () => {
  it('spaces lines so a tall chart does not turn into a ladder', () => {
    expect(gridLines(0)).toEqual([])
    expect(gridLines(480)).toEqual([120, 240, 360, 480])
    expect(gridLines(960)).toEqual([240, 480, 720, 960])
  })
})

describe('stackedSegments', () => {
  it('orders segments identically on every day, whatever their size', () => {
    const range = { start: at(2026, 7, 10), end: at(2026, 7, 10, 23, 59) }
    const monday = breakdownByDay(
      [
        event('Sleep', at(2026, 7, 10, 0), at(2026, 7, 10, 7)),
        event('Standup', at(2026, 7, 10, 9), at(2026, 7, 10, 9, 30)),
      ],
      ruleSet,
      [range.start],
    )[0]

    // `rest` is declared before `work`, so it sits lower in every bar — even though
    // sorting by size would also put it first here.
    expect(stackedSegments(monday).map((s) => s.categoryId)).toEqual(['rest', 'work'])
  })

  it('drops categories with no time', () => {
    const monday = breakdownByDay(
      [event('Standup', at(2026, 7, 10, 9), at(2026, 7, 10, 9, 30))],
      ruleSet,
      [at(2026, 7, 10)],
    )[0]
    expect(stackedSegments(monday)).toEqual([{ categoryId: 'work', minutes: 30 }])
  })
})
