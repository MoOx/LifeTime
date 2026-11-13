import {
  Activity,
  alsoMatches,
  MatchMode,
  matches,
  normalizeTitle,
  ruleFor,
  suggestCategoryId,
  withRule,
} from '../activities'

const activity = (title: string, match: MatchMode, categoryId: string): Activity => ({
  id: `${match}:${title}`,
  title,
  match,
  categoryId,
  createdAt: 0,
})

describe('normalizeTitle', () => {
  it('case-folds and collapses whitespace', () => {
    expect(normalizeTitle('  Daily   Standup ')).toBe('daily standup')
  })

  // Issue #12: a stray trailing space must not create a second activity.
  it('matches a title that carries a stray trailing space', () => {
    expect(matches(activity('Gym', 'exact', 'exercise'), 'Gym ')).toBe(true)
    expect(normalizeTitle('Gym ')).toBe(normalizeTitle('Gym'))
  })

  it('drops leading emoji and symbols', () => {
    expect(normalizeTitle('🏃 Run')).toBe('run')
  })

  it('drops a trailing attendee suffix', () => {
    expect(normalizeTitle('1:1 — Alice')).toBe('1:1')
    expect(normalizeTitle('Coffee w/ Bob')).toBe('coffee')
  })
})

describe('matches', () => {
  it('supports every mode', () => {
    expect(matches(activity('standup', 'exact', 'work'), 'Standup')).toBe(true)
    expect(matches(activity('standup', 'exact', 'work'), 'Daily standup')).toBe(false)
    expect(matches(activity('daily', 'startsWith', 'work'), 'Daily standup')).toBe(true)
    expect(matches(activity('standup', 'endsWith', 'work'), 'Daily standup')).toBe(true)
    expect(matches(activity('stand', 'contains', 'work'), 'Daily standup')).toBe(true)
  })

  it('never matches on an empty pattern', () => {
    expect(matches(activity('', 'contains', 'work'), 'anything')).toBe(false)
  })
})

describe('suggestCategoryId', () => {
  it('recognises common English and French titles', () => {
    expect(suggestCategoryId('Sleep')).toBe('rest')
    expect(suggestCategoryId('Sieste')).toBe('rest')
    expect(suggestCategoryId('Déjeuner')).toBe('food')
    expect(suggestCategoryId('Sprint review')).toBe('work')
    expect(suggestCategoryId('Yoga')).toBe('exercise')
  })

  it('returns nothing when it has no opinion', () => {
    expect(suggestCategoryId('Zblorb')).toBeUndefined()
  })
})

describe('withRule', () => {
  it('replaces the rule with the same pattern and keeps the others', () => {
    const first = withRule([], 'Deep work', 'work', 'exact', 1)
    const both = withRule(first, 'Lunch', 'food', 'exact', 2)
    const replaced = withRule(both, 'deep work', 'fun', 'startsWith', 3)
    expect(replaced.map((a) => [a.title, a.categoryId, a.match])).toEqual([
      ['Lunch', 'food', 'exact'],
      ['deep work', 'fun', 'startsWith'],
    ])
    expect(ruleFor(replaced, 'Deep Work')?.categoryId).toBe('fun')
  })
})

describe('alsoMatches', () => {
  const titles = ['Client call', 'Client lunch', 'client call', 'Call mum', 'Lunch']
  it('lists the other titles a widened rule would claim, once each', () => {
    expect(alsoMatches({ title: 'Client call', match: 'startsWith' }, titles)).toEqual([])
    expect(alsoMatches({ title: 'Client', match: 'startsWith' }, titles)).toEqual([
      'Client call',
      'Client lunch',
    ])
    expect(alsoMatches({ title: 'call', match: 'contains' }, titles)).toEqual([
      'Client call',
      'Call mum',
    ])
  })
  it('claims nothing else when exact', () => {
    expect(alsoMatches({ title: 'Lunch', match: 'exact' }, titles)).toEqual([])
  })
})
