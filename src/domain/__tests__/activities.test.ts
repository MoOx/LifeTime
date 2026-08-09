import {
  Activity,
  MatchMode,
  matches,
  normalizeTitle,
  resolveCategoryId,
  suggestCategoryId,
} from '../activities'
import { UNKNOWN_CATEGORY_ID } from '../categories'

const activity = (
  title: string,
  match: MatchMode,
  categoryId: string,
): Activity => ({ id: `${match}:${title}`, title, match, categoryId, createdAt: 0 })

describe('normalizeTitle', () => {
  it('case-folds and collapses whitespace', () => {
    expect(normalizeTitle('  Daily   Standup ')).toBe('daily standup')
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

describe('resolveCategoryId', () => {
  it('falls back to uncategorized', () => {
    expect(resolveCategoryId('Whatever', [])).toBe(UNKNOWN_CATEGORY_ID)
  })

  it('prefers the more specific rule over a catch-all', () => {
    const rules = [
      activity('stand', 'contains', 'chores'),
      activity('daily standup', 'exact', 'work'),
    ]
    expect(resolveCategoryId('Daily standup', rules)).toBe('work')
  })

  it('prefers the longer pattern at equal specificity', () => {
    const rules = [
      activity('run', 'contains', 'chores'),
      activity('morning run', 'contains', 'exercise'),
    ]
    expect(resolveCategoryId('My morning run in the park', rules)).toBe('exercise')
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
