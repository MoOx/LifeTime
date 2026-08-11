import {
  MINIMUM_GAP_MINUTES,
  addReminder,
  firesTooSoon,
  hasReminder,
  nextOccurrence,
  removeReminder,
  sortReminders,
} from '../reminders'
import type { Reminder } from '../settings'

const at = (hour: number, minute = 0): Reminder => ({ hour, minute })
const clock = (hour: number, minute = 0) =>
  new Date(2026, 7, 11, hour, minute).getTime()

describe('sortReminders', () => {
  it('reads like a day, not like an edit history', () => {
    expect(sortReminders([at(21), at(9), at(12, 30), at(12)])).toEqual([
      at(9),
      at(12),
      at(12, 30),
      at(21),
    ])
  })
})

describe('addReminder', () => {
  it('keeps the list sorted', () => {
    expect(addReminder([at(9), at(21)], at(12))).toEqual([at(9), at(12), at(21)])
  })

  // Two identical reminders is always a mistake; v1 raised an alert rather than merging.
  it('refuses a duplicate rather than merging it', () => {
    const existing = [at(9), at(21)]
    expect(addReminder(existing, at(9))).toEqual(existing)
    expect(hasReminder(existing, at(9))).toBe(true)
    expect(hasReminder(existing, at(9, 1))).toBe(false)
  })
})

describe('removeReminder', () => {
  it('removes only the one asked for', () => {
    expect(removeReminder([at(9), at(12), at(21)], at(12))).toEqual([at(9), at(21)])
  })
})

describe('nextOccurrence', () => {
  it('is today when the time is still ahead', () => {
    expect(nextOccurrence(at(21), clock(18))).toBe(clock(21))
  })

  it('rolls to tomorrow once the time has passed', () => {
    expect(nextOccurrence(at(9), clock(18))).toBe(clock(9) + 86_400_000)
  })

  // On the minute counts as past: it has just fired, and calling it "now" for the next
  // sixty seconds reads worse than calling it tomorrow.
  it('treats the exact minute as already fired', () => {
    expect(nextOccurrence(at(9), clock(9))).toBe(clock(9) + 86_400_000)
  })
})

describe('firesTooSoon', () => {
  it('flags a reminder set just before its own time', () => {
    expect(firesTooSoon(at(9), clock(8, 55))).toBe(true)
    expect(firesTooSoon(at(9), clock(8, 60 - MINIMUM_GAP_MINUTES - 1))).toBe(false)
  })
})
