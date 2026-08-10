/**
 * A plausible calendar, generated on the device.
 *
 * Two jobs:
 *
 *   1. **The app has something to show before it asks for anything.** v1 opened on a
 *      dimmed, empty Summary with a permission dialog over it, which asks the user to
 *      trust an app they have not seen work. Here the real Summary renders over demo
 *      data, and the request sits on top of it as a glass sheet — you can see exactly
 *      what you would get.
 *
 *   2. **Tests do not need a calendar.** Every automated check that used to require
 *      seeding a real `EKEventStore` / `CalendarContract` can run against this instead,
 *      which is both faster and the only way it works in CI.
 *
 * Deterministic by construction: the generator is seeded from the week's own start
 * instant, so the same week always produces the same events — screenshots are stable and
 * a snapshot test means something. No `Math.random()`.
 */

import type { Activity } from './activities'
import { TimeEvent } from './events'
import type { RuleSet } from './rules'
import { MS_PER_MINUTE, addDays, dayOfWeek, startOfDay } from './time'
import { Range } from './week'

export const DEMO_CALENDAR_ID = 'demo'

/**
 * The demo ships with its own rules, so the chart is in full colour from the first frame.
 * A grey week would misrepresent the product — the whole promise is "here is where your
 * time goes", and undifferentiated bars say nothing.
 *
 * `Charge airpods` is left out on purpose: something has to remain uncategorised, or the
 * sorter has nothing to demonstrate and the coverage figure is a meaningless 100 %.
 */
const rule = (title: string, categoryId: string): Activity => ({
  id: `demo_${categoryId}_${title}`,
  title,
  match: 'exact',
  categoryId,
  createdAt: 0,
})

export const DEMO_RULES: RuleSet = {
  activities: [
    rule('Sleep', 'rest'),
    rule('Breakfast', 'food'),
    rule('Lunch', 'food'),
    rule('Dinner', 'food'),
    rule('Standup', 'work'),
    rule('Deep work', 'work'),
    rule('Sprint review', 'work'),
    rule('Running', 'exercise'),
    rule('Climbing', 'exercise'),
    rule('Netflix', 'fun'),
    rule('Drinks with friends', 'social'),
    rule('Groceries', 'chores'),
    rule('Laundry', 'chores'),
    rule('Meditation', 'self'),
  ],
  calendars: {},
}

/**
 * A tiny LCG (Numerical Recipes constants). Good enough to vary a demo, and — unlike
 * `Math.random()` — reproducible.
 */
const rng = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 0x1_0000_0000
  }
}

type Slot = {
  title: string
  /** Minutes after midnight. */
  startMinute: number
  durationMinutes: number
  /** Day-of-week indices this slot occurs on, 0 = Sunday. */
  days: number[]
  /** Probability the slot happens on a given eligible day. */
  chance?: number
  /** Random spread applied to the start time and duration, in minutes. */
  jitter?: number
}

/**
 * Titles are ordinary English calendar entries that the keyword table in `activities.ts`
 * recognises, so the demo Summary shows a full, colourful week rather than one grey bar.
 */
const WEEK: Slot[] = [
  { title: 'Sleep', startMinute: 0, durationMinutes: 450, days: [0, 1, 2, 3, 4, 5, 6], jitter: 45 },
  { title: 'Breakfast', startMinute: 8 * 60, durationMinutes: 30, days: [1, 2, 3, 4, 5], jitter: 15 },
  { title: 'Standup', startMinute: 9 * 60 + 30, durationMinutes: 15, days: [1, 2, 3, 4, 5] },
  { title: 'Deep work', startMinute: 10 * 60, durationMinutes: 150, days: [1, 2, 3, 4, 5], jitter: 30 },
  { title: 'Lunch', startMinute: 12 * 60 + 30, durationMinutes: 45, days: [1, 2, 3, 4, 5], jitter: 15 },
  { title: 'Sprint review', startMinute: 14 * 60, durationMinutes: 60, days: [4] },
  { title: 'Deep work', startMinute: 14 * 60, durationMinutes: 120, days: [1, 2, 3, 5], jitter: 30 },
  { title: 'Running', startMinute: 18 * 60, durationMinutes: 45, days: [2, 4], chance: 0.8, jitter: 20 },
  { title: 'Climbing', startMinute: 18 * 60 + 30, durationMinutes: 90, days: [6], chance: 0.7 },
  { title: 'Dinner', startMinute: 19 * 60 + 30, durationMinutes: 60, days: [0, 1, 2, 3, 4, 5, 6], jitter: 20 },
  { title: 'Netflix', startMinute: 21 * 60, durationMinutes: 90, days: [0, 2, 4, 5], chance: 0.7, jitter: 30 },
  { title: 'Drinks with friends', startMinute: 20 * 60, durationMinutes: 150, days: [5], chance: 0.6 },
  { title: 'Groceries', startMinute: 10 * 60, durationMinutes: 60, days: [6], chance: 0.9 },
  { title: 'Laundry', startMinute: 11 * 60 + 30, durationMinutes: 45, days: [0], chance: 0.6 },
  { title: 'Meditation', startMinute: 7 * 60 + 30, durationMinutes: 20, days: [1, 3, 5], chance: 0.5 },
  { title: 'Charge airpods', startMinute: 22 * 60 + 30, durationMinutes: 60, days: [0, 3], chance: 0.5 },
]

/**
 * Demo events overlapping `range`.
 *
 * `until` clamps the last event, so "this week" in demo mode stops at the current moment
 * exactly as real data would — a demo week that is already full on Tuesday morning would
 * misrepresent what the app does.
 */
export const demoEvents = (range: Range, until = range.end): TimeEvent[] => {
  const events: TimeEvent[] = []
  const limit = Math.min(range.end, until)

  for (let day = startOfDay(range.start); day <= range.end; day = addDays(day, 1)) {
    const weekday = dayOfWeek(day)
    const next = rng(day / 86_400_000)

    for (const [index, slot] of WEEK.entries()) {
      if (!slot.days.includes(weekday)) continue
      if (next() > (slot.chance ?? 1)) continue

      const jitter = slot.jitter ?? 0
      const offset = jitter === 0 ? 0 : Math.round((next() - 0.5) * jitter)
      const stretch = jitter === 0 ? 0 : Math.round((next() - 0.5) * jitter)

      const start = day + (slot.startMinute + offset) * MS_PER_MINUTE
      const end = start + Math.max(15, slot.durationMinutes + stretch) * MS_PER_MINUTE
      if (end <= range.start || start >= limit) continue

      events.push({
        id: `demo_${day}_${index}`,
        calendarId: DEMO_CALENDAR_ID,
        title: slot.title,
        start,
        end: Math.min(end, limit),
        allDay: false,
      })
    }
  }

  return events.sort((a, b) => a.start - b.start)
}
