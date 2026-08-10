import {
  MINUTES_PER_DAY,
  formatMinutes,
  formatRelative,
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

describe('formatRelative', () => {
  const t = new Date(2026, 7, 10, 12, 0).getTime()

  // Node has the full Intl; Hermes does not. Both paths have to work, because which
  // one runs is decided by the engine, not by this code.
  describe('without Intl.RelativeTimeFormat, as on Hermes', () => {
    const withoutIt = <T,>(run: () => T): T => {
      const original = (Intl as { RelativeTimeFormat?: unknown }).RelativeTimeFormat
      delete (Intl as { RelativeTimeFormat?: unknown }).RelativeTimeFormat
      jest.resetModules()
      try {
        return run()
      } finally {
        ;(Intl as { RelativeTimeFormat?: unknown }).RelativeTimeFormat = original
        jest.resetModules()
      }
    }

    it('falls back to an absolute time instead of throwing', () => {
      const fallback = withoutIt(() => {
        // Re-require so the module-level capability check sees the missing constructor.
        const time = require('../time') as typeof import('../time')
        expect(time.HAS_RELATIVE_TIME_FORMAT).toBe(false)
        return time.formatRelative(t, t + 5 * 60_000, 'en-GB')
      })
      expect(fallback).toMatch(/\d/)
      expect(fallback).not.toMatch(/ago/)
    })

    it('gives a date rather than a clock time once it is older than a day', () => {
      const fallback = withoutIt(() => {
        const time = require('../time') as typeof import('../time')
        return time.formatRelative(t, t + 3 * 86_400_000, 'en-GB')
      })
      expect(fallback).toMatch(/Aug/)
    })
  })

  it('says "now" rather than counting seconds', () => {
    expect(formatRelative(t, t + 5_000, 'en-GB')).toBe('now')
  })

  it('picks the largest unit that fits', () => {
    expect(formatRelative(t, t + 5 * 60_000, 'en-GB')).toBe('5 minutes ago')
    expect(formatRelative(t, t + 3 * 3_600_000, 'en-GB')).toBe('3 hours ago')
    expect(formatRelative(t, t + 26 * 3_600_000, 'en-GB')).toBe('yesterday')
    expect(formatRelative(t, t + 9 * 86_400_000, 'en-GB')).toBe('last week')
  })

  it('follows the locale', () => {
    expect(formatRelative(t, t + 5 * 60_000, 'fr-FR')).toBe('il y a 5 minutes')
  })
})
