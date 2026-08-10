/**
 * The shape of the single persisted document, its defaults, and the parsing/migration
 * rules. Pure — no storage, no native modules — so the v1 → v2 migration is unit-tested
 * without a device. The store that actually reads and writes it lives in
 * `src/data/settingsStore.ts`.
 *
 * v1 decoded the same document with ~90 lines of hand-written per-field decoders wrapped
 * in `try/catch`, which silently reset everything to defaults on any mismatch.
 */

import type { Activity, MatchMode } from './activities'
import type { CategoryId } from './categories'
import { UNKNOWN_CATEGORY_ID } from './categories'
import type { Goal, GoalMode, GoalPeriod, RingMode } from './goals'
import { DEFAULT_RING_MODE } from './goals'
import type { CalendarRules } from './rules'

export type ThemePreference = 'light' | 'dark' | 'auto'

export type Reminder = { hour: number; minute: number }

/** Enough of a calendar to recognise it again after a restore on another device. */
export type CalendarRef = {
  id: string
  title: string
  source: string
  color: string
}

export type Settings = {
  version: 2
  theme: ThemePreference
  onboarded: boolean
  skippedCalendars: CalendarRef[]
  /** "Everything in this calendar is Work." Keyed by calendar id. */
  calendarCategories: CalendarRules
  activities: Activity[]
  skippedActivityTitles: string[]
  hideSkippedActivities: boolean
  goals: Goal[]
  /** How goal rings read: filling over the period, or measured against today's pace. */
  ringMode: RingMode
  remindersEnabled: boolean
  reminders: Reminder[]
  /** Weeks of history the bulk categorisation screen analyses. */
  categorisationWeeks: number
}

export const DEFAULT_SETTINGS: Settings = {
  version: 2,
  theme: 'auto',
  onboarded: false,
  skippedCalendars: [],
  calendarCategories: {},
  activities: [],
  skippedActivityTitles: [],
  hideSkippedActivities: true,
  goals: [],
  ringMode: DEFAULT_RING_MODE,
  remindersEnabled: true,
  reminders: [{ hour: 9, minute: 0 }],
  categorisationWeeks: 6,
}

// ---------------------------------------------------------------------------
// Coercion helpers
// ---------------------------------------------------------------------------

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback
const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback
const asBoolean = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback

const MATCH_MODES: readonly string[] = ['exact', 'startsWith', 'endsWith', 'contains']
const GOAL_PERIODS: readonly GoalPeriod[] = ['day', 'week', 'month', 'year']

const parseCalendarRules = (raw: unknown): CalendarRules => {
  if (typeof raw !== 'object' || raw === null) return {}
  const rules: Record<string, CategoryId> = {}
  for (const [calendarId, categoryId] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof categoryId === 'string' && categoryId.length > 0) {
      rules[calendarId] = categoryId
    }
  }
  return rules
}

const parseDays = (raw: unknown): boolean[] => {
  const days = asArray(raw)
  return Array.from({ length: 7 }, (_, i) => asBoolean(days[i], true))
}

const parseCalendarRef = (raw: any): CalendarRef => ({
  id: asString(raw?.id),
  title: asString(raw?.title),
  source: asString(raw?.source),
  color: asString(raw?.color),
})

const parseActivity = (raw: any): Activity => ({
  id: asString(raw?.id),
  title: asString(raw?.title),
  match: (MATCH_MODES.includes(raw?.match) ? raw.match : 'exact') as MatchMode,
  categoryId: asString(raw?.categoryId, UNKNOWN_CATEGORY_ID),
  createdAt: asNumber(raw?.createdAt),
})

const parseGoal = (raw: any): Goal => ({
  id: asString(raw?.id),
  title: asString(raw?.title),
  createdAt: asNumber(raw?.createdAt),
  mode: raw?.mode === 'limit' ? 'limit' : 'goal',
  days: parseDays(raw?.days),
  durationPerDay: asNumber(raw?.durationPerDay, 60),
  categoryIds: asArray(raw?.categoryIds).map((v) => asString(v)),
  activityIds: asArray(raw?.activityIds).map((v) => asString(v)),
  period: (GOAL_PERIODS as readonly string[]).includes(raw?.period)
    ? (raw.period as GoalPeriod)
    : 'week',
})

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export const parseSettings = (raw: unknown): Settings => {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SETTINGS
  const value = raw as Record<string, unknown>

  // A v1 backup carries no `version` field; route it through the migration.
  if (value.version !== 2) return importV1Settings(value)

  return {
    version: 2,
    theme: value.theme === 'light' || value.theme === 'dark' ? value.theme : 'auto',
    onboarded: asBoolean(value.onboarded, false),
    skippedCalendars: asArray(value.skippedCalendars).map(parseCalendarRef),
    calendarCategories: parseCalendarRules(value.calendarCategories),
    activities: asArray(value.activities).map(parseActivity),
    skippedActivityTitles: asArray(value.skippedActivityTitles).map((v) => asString(v)),
    hideSkippedActivities: asBoolean(value.hideSkippedActivities, true),
    goals: asArray(value.goals).map(parseGoal),
    ringMode: value.ringMode === 'pace' ? 'pace' : DEFAULT_RING_MODE,
    remindersEnabled: asBoolean(value.remindersEnabled, true),
    reminders: asArray(value.reminders).map((r: any) => ({
      hour: asNumber(r?.hour, 9),
      minute: asNumber(r?.minute, 0),
    })),
    categorisationWeeks: clampWeeks(asNumber(value.categorisationWeeks, 6)),
  }
}

/** 1…52. The bulk screen reads a window, not the whole calendar history. */
const clampWeeks = (weeks: number): number =>
  Math.min(52, Math.max(1, Math.round(weeks) || 6))

/**
 * Accepts the JSON that v1's *Export Backup* copies to the clipboard, so an existing
 * user's setup survives the rewrite. Shape differences: `mode` and `period` were integer
 * enums, goal field names were `categoriesId` / `activitiesId`, activity matching was
 * always exact, and reminders were `[minute, hour]` pairs.
 */
export const importV1Settings = (raw: unknown): Settings => {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_SETTINGS
  const v1 = raw as Record<string, any>

  return {
    version: 2,
    theme: v1.theme === 'light' || v1.theme === 'dark' ? v1.theme : 'auto',
    onboarded: asNumber(v1.lastUpdated) > 0,
    skippedCalendars: asArray(v1.calendarsSkipped).map(parseCalendarRef),
    // v1 had no calendar-level rules.
    calendarCategories: {},
    activities: asArray(v1.activities).map((a: any) => ({
      id: asString(a?.id),
      title: asString(a?.title),
      match: 'exact' as MatchMode,
      categoryId: asString(a?.categoryId, UNKNOWN_CATEGORY_ID),
      createdAt: asNumber(a?.createdAt),
    })),
    skippedActivityTitles: asArray(v1.activitiesSkipped).map((v) => asString(v)),
    hideSkippedActivities: asBoolean(v1.activitiesSkippedFlag, true),
    goals: asArray(v1.goals).map((g: any) => ({
      id: asString(g?.id),
      title: asString(g?.title),
      createdAt: asNumber(g?.createdAt),
      mode: (asNumber(g?.mode) === 1 ? 'limit' : 'goal') as GoalMode,
      days: parseDays(g?.days),
      durationPerDay: asNumber(g?.durationPerDay, 60),
      categoryIds: asArray(g?.categoriesId).map((v) => asString(v)),
      activityIds: asArray(g?.activitiesId).map((v) => asString(v)),
      period: GOAL_PERIODS[asNumber(g?.period, 1)] ?? 'week',
    })),
    ringMode: DEFAULT_RING_MODE,
    remindersEnabled: asBoolean(v1.notificationsRecurrentRemindersOn, true),
    reminders: asArray(v1.notificationsRecurrentReminders).map((r: any) => ({
      minute: asNumber(asArray(r)[0], 0),
      hour: asNumber(asArray(r)[1], 9),
    })),
    categorisationWeeks: 6,
  }
}
