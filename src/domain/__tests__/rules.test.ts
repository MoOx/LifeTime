import { Activity, MatchMode } from '../activities'
import { UNKNOWN_CATEGORY_ID } from '../categories'
import { TimeEvent, goalEvents, isCountedInGoals } from '../events'
import { RuleSet, categoryOf, coverage, resolve, suggestAll } from '../rules'

const activity = (title: string, match: MatchMode, categoryId: string): Activity => ({
  id: `${match}:${title}`,
  title,
  match,
  categoryId,
  createdAt: 0,
})

const event = (
  title: string,
  overrides: Partial<TimeEvent> = {},
): TimeEvent => ({
  id: title,
  calendarId: 'personal',
  title,
  start: 0,
  end: 60 * 60 * 1000,
  allDay: false,
  ...overrides,
})

const rules = (over: Partial<RuleSet> = {}): RuleSet => ({
  activities: [],
  calendars: {},
  ...over,
})

describe('resolve', () => {
  it('falls back to uncategorized', () => {
    expect(categoryOf(event('Whatever'), rules())).toBe(UNKNOWN_CATEGORY_ID)
  })

  // Issue #13: the "smart activities" v1's help text promised and never shipped.
  it('prefers the more specific rule over a catch-all', () => {
    const set = rules({
      activities: [
        activity('stand', 'contains', 'chores'),
        activity('daily standup', 'exact', 'work'),
      ],
    })
    expect(categoryOf(event('Daily standup'), set)).toBe('work')
  })

  it('prefers the longer pattern at equal specificity', () => {
    const set = rules({
      activities: [
        activity('run', 'contains', 'chores'),
        activity('morning run', 'contains', 'exercise'),
      ],
    })
    expect(categoryOf(event('My morning run in the park'), set)).toBe('exercise')
  })

  it('categorises a whole calendar at once', () => {
    const set = rules({ calendars: { office: 'work' } })
    const resolution = resolve(event('Anything at all', { calendarId: 'office' }), set)
    expect(resolution).toEqual({ categoryId: 'work', source: 'calendar' })
  })

  it('lets a text rule override its calendar', () => {
    const set = rules({
      activities: [activity('lunch', 'contains', 'food')],
      calendars: { office: 'work' },
    })
    expect(categoryOf(event('Team lunch', { calendarId: 'office' }), set)).toBe('food')
  })

  it('only offers keyword guesses when asked', () => {
    expect(resolve(event('Yoga'), rules()).source).toBe('none')
    expect(resolve(event('Yoga'), rules(), { includeKeywords: true })).toEqual({
      categoryId: 'exercise',
      source: 'keyword',
    })
  })
})

describe('suggestAll', () => {
  const minutesOf = (e: TimeEvent) => (e.end - e.start) / 60_000

  it('groups by title, sorts by weight and guesses a category', () => {
    const events = [
      event('Yoga', { id: '1', end: 30 * 60_000 }),
      event('Yoga', { id: '2', end: 30 * 60_000 }),
      event('Deep work', { id: '3', end: 180 * 60_000 }),
    ]
    const suggestions = suggestAll(events, rules(), minutesOf)

    expect(suggestions.map((s) => s.title)).toEqual(['Deep work', 'Yoga'])
    expect(suggestions[1]).toMatchObject({
      categoryId: 'exercise',
      source: 'keyword',
      minutes: 60,
      count: 2,
    })
  })

  it('leaves out anything already covered by a rule', () => {
    const set = rules({ calendars: { personal: 'self' } })
    expect(suggestAll([event('Yoga')], set, minutesOf)).toEqual([])
  })
})

describe('coverage', () => {
  const minutesOf = (e: TimeEvent) => (e.end - e.start) / 60_000

  it('is measured in minutes, not in event count', () => {
    const set = rules({ activities: [activity('Sleep', 'exact', 'rest')] })
    const events = [
      event('Sleep', { id: '1', end: 480 * 60_000 }),
      event('Mystery', { id: '2', end: 120 * 60_000 }),
    ]
    expect(coverage(events, set, minutesOf)).toBeCloseTo(0.8)
  })

  it('is complete when there is nothing to categorise', () => {
    expect(coverage([], rules(), minutesOf)).toBe(1)
  })
})

// Issue #29: "I want to hide 'sleep' from my Home Screen, but still have a Rest goal
// (that include sleep activity). It should count."
describe('isCountedInGoals', () => {
  const filter = {
    skippedCalendarIds: [] as string[],
    skippedActivityTitles: ['Sleep'],
    hideSkippedActivities: true,
  }

  it('counts a hidden activity once it has been categorised', () => {
    const set = rules({ activities: [activity('Sleep', 'exact', 'rest')] })
    expect(isCountedInGoals(event('Sleep'), filter, set)).toBe(true)
  })

  it('still leaves out a hidden activity nobody categorised', () => {
    expect(isCountedInGoals(event('Sleep'), filter, rules())).toBe(false)
  })

  it('honours a deselected calendar everywhere, categorised or not', () => {
    const set = rules({ activities: [activity('Sleep', 'exact', 'rest')] })
    expect(
      isCountedInGoals(event('Sleep'), { ...filter, skippedCalendarIds: ['personal'] }, set),
    ).toBe(false)
  })

  it('never counts all-day events', () => {
    const set = rules({ activities: [activity('Sleep', 'exact', 'rest')] })
    expect(isCountedInGoals(event('Sleep', { allDay: true }), filter, set)).toBe(false)
  })

  it('keeps visible events too', () => {
    const set = rules({ activities: [activity('Sleep', 'exact', 'rest')] })
    const events = [event('Sleep'), event('Deep work', { id: 'w' })]
    expect(goalEvents(events, filter, set).map((e) => e.title)).toEqual([
      'Sleep',
      'Deep work',
    ])
  })
})
