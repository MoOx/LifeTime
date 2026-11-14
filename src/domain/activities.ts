/**
 * Activities: the user-defined mapping from calendar event titles to categories.
 *
 * v1 matched with strict lowercase equality (`Activities.isSimilar`), so "Standup",
 * "Daily standup" and "Standup — team" were three unrelated activities each needing
 * separate categorisation. v1's own help text already promised prefix/suffix matching as
 * a "Premium" feature that was never built; it is built here.
 */

import { CategoryId } from './categories'

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
 * Rule precedence lives in `./rules.ts`, next to the calendar rules it competes with.
 */

/** "starts with 1:1" — the rule in plain language, for a list row. */
export const describeMatch = (activity: Activity): string => {
  switch (activity.match) {
    case 'exact':
      return `exactly “${activity.title}”`
    case 'startsWith':
      return `starts with “${activity.title}”`
    case 'endsWith':
      return `ends with “${activity.title}”`
    case 'contains':
      return `contains “${activity.title}”`
  }
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
  [
    /\b(gym|run|running|swim|yoga|workout|training|sport|course|muscu|v[ée]lo|bike)\b/iu,
    'exercise',
  ],
  [/\b(lunch|dinner|breakfast|brunch|d[ée]jeuner|d[îi]ner|petit.?d[ée]j|repas)\b/iu, 'food'],
  [/\b(standup|meeting|1:1|retro|sprint|review|call|r[ée]union|point|boulot|work)\b/iu, 'work'],
  [
    /\b(drinks|party|birthday|apero|ap[ée]ro|anniversaire|famille|family|friends|amis)\b/iu,
    'social',
  ],
  [
    /\b(meditation|therapy|m[ée]ditation|th[ée]rapie|massage|coiffeur|doctor|m[ée]decin)\b/iu,
    'self',
  ],
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

/** The user's rule written for this exact pattern, if any. */
export const ruleFor = (activities: readonly Activity[], title: string): Activity | undefined => {
  const pattern = normalizeTitle(title)
  return activities.find((a) => normalizeTitle(a.title) === pattern)
}

/**
 * Activity detail's category list: writes the rule for this title, replacing the one with
 * the same pattern (v1 wrote an `exact` rule and replaced any existing one,
 * `ActivityOptions.res:74-92`). The match mode is the Match row's (issue #13).
 */
export const withRule = (
  activities: readonly Activity[],
  title: string,
  categoryId: CategoryId,
  match: MatchMode,
  now: number,
): Activity[] => {
  const pattern = normalizeTitle(title)
  return [
    ...activities.filter((a) => normalizeTitle(a.title) !== pattern),
    { id: makeActivityId(title, now), title, match, categoryId, createdAt: now },
  ]
}

/**
 * The blast radius of a rule (issue #13, CATEGORISATION.md): the other titles it would also
 * claim, each once, in the order given. The Match row shows their count before the rule is
 * widened.
 */
export const alsoMatches = (
  rule: Pick<Activity, 'title' | 'match'>,
  titles: readonly string[],
): string[] => {
  const own = normalizeTitle(rule.title)
  const probe: Activity = { id: '', categoryId: '', createdAt: 0, ...rule }
  const seen = new Set<string>()
  const result: string[] = []
  for (const title of titles) {
    const normalized = normalizeTitle(title)
    if (normalized === own || seen.has(normalized)) continue
    if (!matches(probe, title)) continue
    seen.add(normalized)
    result.push(title)
  }
  return result
}

/**
 * One rule for several titles (D26, spec/10-model.md, "A rule from a selection"), on
 * normalised titles:
 *
 *   1. all identical: `exact`;
 *   2. a common prefix of at least 3 characters ending on a word boundary: `startsWith`;
 *   3. otherwise a common suffix under the same condition: `endsWith`;
 *   4. otherwise a common run of at least one whole word: `contains`;
 *   5. otherwise `undefined`: the caller writes one `exact` rule per title.
 *
 * The pattern is normalised (lower case), as `matches` compares normalised titles anyway.
 */
export const inferRule = (
  titles: readonly string[],
): { title: string; match: MatchMode } | undefined => {
  const all = [...new Set(titles.map(normalizeTitle))].filter((t) => t.length > 0)
  if (all.length === 0) return undefined
  if (all.length === 1) return { title: all[0], match: 'exact' }

  const minLength = Math.min(...all.map((t) => t.length))

  // 2. Prefix: the longest common one, cut back to a word boundary in every title.
  let prefix = 0
  while (prefix < minLength && all.every((t) => t[prefix] === all[0][prefix])) prefix++
  for (let end = prefix; end >= 3; end--) {
    const candidate = all[0].slice(0, end)
    if (candidate.endsWith(' ')) continue
    if (all.every((t) => t.length === end || t[end] === ' ')) {
      return { title: candidate, match: 'startsWith' }
    }
  }

  // 3. Suffix, the mirror image.
  let suffix = 0
  const at = (t: string, i: number) => t[t.length - 1 - i]
  while (suffix < minLength && all.every((t) => at(t, suffix) === at(all[0], suffix))) suffix++
  for (let length = suffix; length >= 3; length--) {
    const candidate = all[0].slice(all[0].length - length)
    if (candidate.startsWith(' ')) continue
    if (all.every((t) => t.length === length || t[t.length - length - 1] === ' ')) {
      return { title: candidate, match: 'endsWith' }
    }
  }

  // 4. The longest run of whole words found, as whole words, in every title.
  const words = all[0].split(' ')
  const hasWords = (t: string, run: string) => ` ${t} `.includes(` ${run} `)
  for (let size = words.length; size >= 1; size--) {
    for (let start = 0; start + size <= words.length; start++) {
      const run = words.slice(start, start + size).join(' ')
      if (all.every((t) => hasWords(t, run))) return { title: run, match: 'contains' }
    }
  }
  return undefined
}
