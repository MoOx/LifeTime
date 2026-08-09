import {
  MINUTES_PER_DAY,
  formatMinutes,
  minutesElapsedInDay,
  overlapMs,
  startOfDay,
} from '../time'

const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m, d, h, min).getTime()

describe('formatMinutes', () => {
  it('collapses empty units', () => {
    expect(formatMinutes(0)).toBe('0m')
    expect(formatMinutes(45)).toBe('45m')
    expect(formatMinutes(60)).toBe('1h')
    expect(formatMinutes(75)).toBe('1h 15m')
    expect(formatMinutes(MINUTES_PER_DAY)).toBe('1d')
    expect(formatMinutes(MINUTES_PER_DAY + 195)).toBe('1d 3h 15m')
  })

  it('never renders negative durations', () => {
    expect(formatMinutes(-10)).toBe('0m')
  })
})

describe('overlapMs', () => {
  it('clamps an event to a window', () => {
    const eventStart = at(2026, 7, 9, 22)
    const eventEnd = at(2026, 7, 10, 6)
    const windowEnd = at(2026, 7, 10, 0)

    // 22:00 → midnight is two hours inside the window
    expect(overlapMs(eventStart, eventEnd, startOfDay(eventStart), windowEnd)).toBe(
      2 * 60 * 60_000,
    )
  })

  it('is zero for disjoint intervals', () => {
    expect(overlapMs(0, 10, 20, 30)).toBe(0)
    expect(overlapMs(20, 30, 0, 10)).toBe(0)
  })
})

describe('minutesElapsedInDay', () => {
  const day = at(2026, 7, 9)

  it('is zero before the day starts', () => {
    expect(minutesElapsedInDay(day, at(2026, 7, 8, 23))).toBe(0)
  })

  it('is pro rata during the day', () => {
    expect(minutesElapsedInDay(day, at(2026, 7, 9, 6))).toBe(360)
  })

  it('caps at a full day', () => {
    expect(minutesElapsedInDay(day, at(2026, 7, 12))).toBe(MINUTES_PER_DAY)
  })
})
