/**
 * Activities: the user-defined mapping from calendar event titles to categories.
 *
 * v1 matched with strict lowercase equality (`Activities.isSimilar`), so "Standup",
 * "Daily standup" and "Standup — team" were three unrelated activities each needing
 * separate categorisation. v1's own help text already promised prefix/suffix matching as
 * a "Premium" feature that was never built; it is built here.
 */

import { CategoryId, UNKNOWN_CATEGORY_ID } from './categories'

export type MatchMode = 'exact' | 'startsWith' | 'endsWith' | 'contains'

/**
 * v1 built ids by Caesar-shifting `"title@timestamp"` (`Utils.makeId`), which is neither
 * unique nor meaningful. A prefixed timestamp plus the normalised title is enough here:
 * ids are local to the device and only need to be stable and collision-free.
 */
export const makeActivityId = (title: string, createdAt: number): string =>
  `act_${createdAt.toString(36)}_${normalizeTitle(title).replace(/\W+/gu, '-').slice(0, 32)}`

export type Activity = {
  id: string
  /** The pattern to match event titles against. */
  title: string
  match: MatchMode
  categoryId: CategoryId
  createdAt: number
}

/**
 * Normalisation applied to both sides before matching: case-folded, whitespace
 * collapsed, leading emoji/symbols dropped, and a trailing " — someone" / " w/ someone"
 * suffix removed. Cheap, invisible to the user, and it collapses a lot of real-world
 * calendar noise into a single activity.
 */
export const normalizeTitle = (title: string): string =>
  title
    .normalize('NFKC')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/\s+[—–-]\s+.*$/u, '')
    .replace(/\s+w\/\s+.*$/iu, '')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase()

export const matches = (activity: Activity, eventTitle: string): boolean => {
  const pattern = normalizeTitle(activity.title)
  const title = normalizeTitle(eventTitle)
  if (pattern.length === 0) return false
  switch (activity.match) {
    case 'exact':
      return title === pattern
    case 'startsWith':
      return title.startsWith(pattern)
    case 'endsWith':
      return title.endsWith(pattern)
    case 'contains':
      return title.includes(pattern)
  }
}

/**
 * More specific rules win, so a `contains` catch-all never shadows an `exact` rule.
 * Within the same mode, the longer pattern wins.
 */
const SPECIFICITY: Record<MatchMode, number> = {
  exact: 3,
  startsWith: 2,
  endsWith: 2,
  contains: 1,
}

export const resolveCategoryId = (
  eventTitle: string,
  activities: readonly Activity[],
): CategoryId => {
  let best: Activity | undefined
  for (const activity of activities) {
    if (!matches(activity, eventTitle)) continue
    if (
      best === undefined ||
      SPECIFICITY[activity.match] > SPECIFICITY[best.match] ||
      (SPECIFICITY[activity.match] === SPECIFICITY[best.match] &&
        activity.title.length > best.title.length)
    ) {
      best = activity
    }
  }
  return best?.categoryId ?? UNKNOWN_CATEGORY_ID
}

export const isSkipped = (eventTitle: string, skipped: readonly string[]): boolean => {
  const title = normalizeTitle(eventTitle)
  return skipped.some((s) => normalizeTitle(s) === title)
}

/**
 * First-sight category suggestion, from a small bilingual keyword table. No ML, no
 * network — it exists so a new user sees a meaningful chart in the first 30 seconds
 * instead of after categorising dozens of activities by hand.
 * Always a suggestion: the user's own mapping overrides it.
 */
const SUGGESTIONS: [RegExp, CategoryId][] = [
  [/\b(sleep|nap|nuit|dodo|sieste|sommeil)\b/iu, 'rest'],
  [/\b(gym|run|running|swim|yoga|workout|training|sport|course|muscu|v[ée]lo|bike)\b/iu, 'exercise'],
  [/\b(lunch|dinner|breakfast|brunch|d[ée]jeuner|d[îi]ner|petit.?d[ée]j|repas)\b/iu, 'food'],
  [/\b(standup|meeting|1:1|retro|sprint|review|call|r[ée]union|point|boulot|work)\b/iu, 'work'],
  [/\b(drinks|party|birthday|apero|ap[ée]ro|anniversaire|famille|family|friends|amis)\b/iu, 'social'],
  [/\b(meditation|therapy|m[ée]ditation|th[ée]rapie|massage|coiffeur|doctor|m[ée]decin)\b/iu, 'self'],
  [/\b(movie|cinema|netflix|game|gaming|concert|s[ée]rie|film|jeu)\b/iu, 'fun'],
  [/\b(clean|laundry|groceries|courses|m[ée]nage|lessive|vaisselle|admin)\b/iu, 'chores'],
]

export const suggestCategoryId = (eventTitle: string): CategoryId | undefined => {
  const title = normalizeTitle(eventTitle)
  for (const [pattern, categoryId] of SUGGESTIONS) {
    if (pattern.test(title)) return categoryId
  }
  return undefined
}
