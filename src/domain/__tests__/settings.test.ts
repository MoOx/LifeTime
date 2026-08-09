import { DEFAULT_SETTINGS, importV1Settings, parseSettings } from '../settings'

// The v1 → v2 migration is the upgrade path for existing users: v1's "Export Backup"
// copies exactly this JSON to the clipboard.

// The exact shape v1's "Export Backup" copies to the clipboard.
const v1Backup = {
  theme: 'dark',
  lastUpdated: 1_646_654_083_000,
  notificationsPermissionsDismissed: 0,
  notificationsRecurrentRemindersOn: false,
  notificationsRecurrentReminders: [[30, 20]],
  calendarsSkipped: [
    { id: 'cal-1', title: 'Birthdays', source: 'iCloud', color: '#ff0000' },
  ],
  activitiesSkippedFlag: false,
  activitiesSkipped: ['Commute'],
  activities: [
    { id: 'act-1', title: 'Sleep', createdAt: 1_600_000_000_000, categoryId: 'rest' },
  ],
  goals: [
    {
      id: 'goal-1',
      title: 'Move more',
      createdAt: 1_610_000_000_000,
      mode: 1,
      days: [false, true, true, true, true, true, false],
      durationPerDay: 45,
      categoriesId: ['exercise'],
      activitiesId: ['act-1'],
      period: 1,
    },
  ],
}

describe('importV1Settings', () => {
  const settings = importV1Settings(v1Backup)

  it('keeps the theme', () => {
    expect(settings.theme).toBe('dark')
  })

  it('treats a non-zero lastUpdated as "already onboarded"', () => {
    expect(settings.onboarded).toBe(true)
  })

  it('carries calendars, activities and skip lists across', () => {
    expect(settings.skippedCalendars).toHaveLength(1)
    expect(settings.skippedCalendars[0].title).toBe('Birthdays')
    expect(settings.activities[0]).toMatchObject({ title: 'Sleep', categoryId: 'rest' })
    expect(settings.skippedActivityTitles).toEqual(['Commute'])
    expect(settings.hideSkippedActivities).toBe(false)
  })

  it('defaults v1 activities to exact matching', () => {
    expect(settings.activities[0].match).toBe('exact')
  })

  it('decodes the integer enums and the renamed goal fields', () => {
    const goal = settings.goals[0]
    expect(goal.id).toBe('goal-1')
    expect(goal.createdAt).toBe(1_610_000_000_000)
    expect(goal.mode).toBe('limit') // v1 serialised Limit as 1
    expect(goal.period).toBe('week') // v1 serialised week as 1
    expect(goal.categoryIds).toEqual(['exercise'])
    expect(goal.activityIds).toEqual(['act-1'])
  })

  it('flips reminders from [minute, hour] pairs to named fields', () => {
    expect(settings.remindersEnabled).toBe(false)
    expect(settings.reminders).toEqual([{ hour: 20, minute: 30 }])
  })
})

describe('parseSettings', () => {
  it('round-trips its own format', () => {
    const settings = importV1Settings(v1Backup)
    expect(parseSettings(JSON.parse(JSON.stringify(settings)))).toEqual(settings)
  })

  it('routes an unversioned document through the v1 importer', () => {
    expect(parseSettings(v1Backup).goals[0].mode).toBe('limit')
  })

  it('falls back to defaults on garbage', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('nope')).toEqual(DEFAULT_SETTINGS)
  })

  it('survives a document with missing fields', () => {
    const settings = parseSettings({ version: 2 })
    expect(settings.goals).toEqual([])
    expect(settings.theme).toBe('auto')
    expect(settings.hideSkippedActivities).toBe(true)
  })
})
