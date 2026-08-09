import { clampToNow, daysOfWeek, lastWeeks, startOfWeek, weekRange } from '../week'

const at = (y: number, m: number, d: number, h = 0) => new Date(y, m, d, h).getTime()
const iso = (t: number) => new Date(t).toDateString()

// 2026-08-09 is a Sunday.
const sunday = at(2026, 7, 9, 15)
const wednesday = at(2026, 7, 12, 10)

describe('startOfWeek', () => {
  it('respects a Monday-first locale', () => {
    expect(iso(startOfWeek(wednesday, 1))).toBe('Mon Aug 10 2026')
    // On a Sunday, a Monday-first week started six days earlier.
    expect(iso(startOfWeek(sunday, 1))).toBe('Mon Aug 03 2026')
  })

  it('respects a Sunday-first locale', () => {
    expect(iso(startOfWeek(wednesday, 0))).toBe('Sun Aug 09 2026')
    expect(iso(startOfWeek(sunday, 0))).toBe('Sun Aug 09 2026')
  })

  it('respects a Saturday-first locale', () => {
    expect(iso(startOfWeek(wednesday, 6))).toBe('Sat Aug 08 2026')
  })
})

describe('weekRange', () => {
  it('spans exactly seven days', () => {
    const { start, end } = weekRange(wednesday, 1)
    expect(daysOfWeek({ start, end })).toHaveLength(7)
    expect(end - start).toBeGreaterThan(6 * 86_400_000)
    expect(end - start).toBeLessThan(7 * 86_400_000)
  })
})

describe('lastWeeks', () => {
  it('returns the requested count, oldest first, ending on the current week', () => {
    const weeks = lastWeeks(wednesday, 1, 6)
    expect(weeks).toHaveLength(6)
    expect(iso(weeks[5].start)).toBe('Mon Aug 10 2026')
    expect(iso(weeks[0].start)).toBe('Mon Jul 06 2026')
  })
})

describe('clampToNow', () => {
  it('never lets a range extend into the future', () => {
    const week = weekRange(wednesday, 1)
    expect(clampToNow(week, wednesday).end).toBe(wednesday)
  })

  it('leaves past ranges untouched', () => {
    const week = weekRange(at(2026, 6, 1), 1)
    expect(clampToNow(week, wednesday).end).toBe(week.end)
  })
})
