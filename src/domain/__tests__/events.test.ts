import { TimeEvent, explainEmptiness, filterEvents, initialWeekIndex } from '../events'

const event = (overrides: Partial<TimeEvent> = {}): TimeEvent => ({
  id: 'e',
  calendarId: 'personal',
  title: 'Deep work',
  start: 0,
  end: 3_600_000,
  allDay: false,
  ...overrides,
})

const filter = {
  skippedCalendarIds: [] as string[],
  skippedActivityTitles: [] as string[],
  hideSkippedActivities: true,
}

describe('filterEvents', () => {
  it('drops all-day events, which have no duration to measure', () => {
    expect(filterEvents([event({ allDay: true })], filter)).toEqual([])
  })

  it('drops events from deselected calendars', () => {
    expect(filterEvents([event()], { ...filter, skippedCalendarIds: ['personal'] })).toEqual(
      [],
    )
  })

  it('honours the master switch for hidden activities', () => {
    const hiding = { ...filter, skippedActivityTitles: ['Deep work'] }
    expect(filterEvents([event()], hiding)).toEqual([])
    expect(filterEvents([event()], { ...hiding, hideSkippedActivities: false })).toHaveLength(
      1,
    )
  })
})

describe('explainEmptiness', () => {
  it('names the cause rather than reporting "no data"', () => {
    expect(explainEmptiness([], filter)).toBe('no-events')
    expect(explainEmptiness([event({ allDay: true })], filter)).toBe('only-all-day')
    expect(
      explainEmptiness([event()], { ...filter, skippedCalendarIds: ['personal'] }),
    ).toBe('only-skipped-calendars')
    expect(
      explainEmptiness([event()], { ...filter, skippedActivityTitles: ['Deep work'] }),
    ).toBe('only-skipped-activities')
    expect(explainEmptiness([event()], filter)).toBe('has-events')
  })

  it('reports the first cause in the order the user would fix them', () => {
    // An all-day event in a deselected calendar: the calendar is the actionable one, but
    // there is no timed event at all, so that is what gets reported.
    expect(
      explainEmptiness([event({ allDay: true })], {
        ...filter,
        skippedCalendarIds: ['personal'],
      }),
    ).toBe('only-all-day')
  })
})

// Issue #19.
describe('initialWeekIndex', () => {
  const week = (titles: string[]) => titles.map((title) => event({ title }))

  it('opens on the current week when it has something in it', () => {
    expect(initialWeekIndex([week(['a']), week(['b'])])).toBe(1)
  })

  it('falls back to last week on an empty Monday morning', () => {
    expect(initialWeekIndex([week(['a']), []])).toBe(0)
  })

  it('does not reach further back than `lookBack` allows', () => {
    expect(initialWeekIndex([week(['a']), [], []])).toBe(2)
    expect(initialWeekIndex([week(['a']), [], []], 2)).toBe(0)
  })

  it('stays on the current week while a week is still loading', () => {
    expect(initialWeekIndex([week(['a']), undefined])).toBe(1)
  })

  it('ignores all-day events, which is what made the week look empty', () => {
    expect(initialWeekIndex([week(['a']), [event({ allDay: true })]])).toBe(0)
  })

  it('stays on the current week when nothing anywhere has data', () => {
    expect(initialWeekIndex([[], []])).toBe(1)
  })
})
