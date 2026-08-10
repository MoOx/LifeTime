import { minutesByCategory, totalMinutes } from '../aggregate'
import { DEMO_CALENDAR_ID, demoEvents } from '../demo'
import { EMPTY_RULES, RuleSet, coverage } from '../rules'
import { weekRange } from '../week'

const MONDAY = new Date(2026, 7, 10).getTime()
const WEEK = weekRange(MONDAY, 1)

// The demo exists so the app can be seen before it asks for anything, so the guess table
// alone has to be enough to fill a chart.
const keywordRules: RuleSet = EMPTY_RULES

describe('demoEvents', () => {
  it('is deterministic', () => {
    expect(demoEvents(WEEK)).toEqual(demoEvents(WEEK))
  })

  it('fills a week with events that all sit inside it', () => {
    const events = demoEvents(WEEK)
    expect(events.length).toBeGreaterThan(40)
    for (const event of events) {
      expect(event.end).toBeGreaterThan(event.start)
      expect(event.end).toBeLessThanOrEqual(WEEK.end)
      expect(event.calendarId).toBe(DEMO_CALENDAR_ID)
      expect(event.allDay).toBe(false)
    }
  })

  it('is sorted by start time', () => {
    const starts = demoEvents(WEEK).map((e) => e.start)
    expect(starts).toEqual([...starts].sort((a, b) => a - b))
  })

  it('stops at `until`, so a partial week looks partial', () => {
    const tuesdayNoon = new Date(2026, 7, 11, 12).getTime()
    const events = demoEvents(WEEK, tuesdayNoon)
    expect(events.length).toBeGreaterThan(0)
    for (const event of events) expect(event.end).toBeLessThanOrEqual(tuesdayNoon)
  })

  it('spreads across enough categories to make the chart worth looking at', () => {
    const buckets = minutesByCategory(demoEvents(WEEK), keywordRules, WEEK)
    expect(totalMinutes(buckets)).toBeGreaterThan(60 * 24 * 3)
  })

  it('leaves something uncategorised, so the bulk screen has work to show', () => {
    expect(coverage(demoEvents(WEEK), keywordRules, (e) => (e.end - e.start) / 60_000))
      .toBeLessThan(1)
  })
})
