/**
 * Activity categories.
 *
 * v1 hardcoded these as a `list<(id, name, color, icon)>` in source, which made them
 * impossible for users to extend (see IMPROVEMENTS.md §B.1). Here they are plain data
 * with the v1 set as seed values, so moving them into user settings later is a change of
 * *source*, not of *shape*.
 *
 * Icons are named per platform: SF Symbols on iOS, Material Symbols on Android. v1
 * shipped 40 hand-drawn SVGs converted at install time; every one of them has a system
 * equivalent.
 */

export const UNKNOWN_CATEGORY_ID = 'unknown'

export type CategoryId = string

export type Category = {
  id: CategoryId
  name: string
  /** Key into the app palette — see `src/ui/theme/colors.ts`. */
  color: CategoryColor
  sf: string
  material: string
}

export type CategoryColor =
  | 'indigo'
  | 'green'
  | 'pink'
  | 'blue'
  | 'orange'
  | 'teal'
  | 'purple'
  | 'yellow'
  | 'gray'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'rest', name: 'Rest', color: 'indigo', sf: 'moon.zzz', material: 'bedtime' },
  { id: 'food', name: 'Nutrition', color: 'green', sf: 'fork.knife', material: 'restaurant' },
  { id: 'exercise', name: 'Exercise', color: 'pink', sf: 'figure.run', material: 'fitness_center' },
  { id: 'work', name: 'Work', color: 'blue', sf: 'briefcase', material: 'work' },
  { id: 'social', name: 'Social', color: 'orange', sf: 'person.2', material: 'group' },
  { id: 'self', name: 'Self-care', color: 'teal', sf: 'leaf', material: 'self_improvement' },
  { id: 'fun', name: 'Entertainment', color: 'purple', sf: 'theatermasks', material: 'theater_comedy' },
  { id: 'chores', name: 'Chores', color: 'yellow', sf: 'house', material: 'cleaning_services' },
  { id: UNKNOWN_CATEGORY_ID, name: 'Uncategorized', color: 'gray', sf: 'bookmark', material: 'bookmark' },
]

const byId = new Map(DEFAULT_CATEGORIES.map((c) => [c.id, c]))

export const getCategory = (id: CategoryId): Category =>
  byId.get(id) ?? byId.get(UNKNOWN_CATEGORY_ID)!

export const isKnownCategory = (id: CategoryId): boolean =>
  byId.has(id) && id !== UNKNOWN_CATEGORY_ID
