/**
 * The goal editor. `id === 'new'` creates one.
 *
 * Three things v1 got wrong here, all fixed by construction:
 *
 *   • **Identity survived editing.** v1 rebuilt the goal through `Goal.make` on every
 *     keystroke, regenerating both `id` and `createdAt` (IMPROVEMENTS.md §A.2). Here the
 *     draft is local state and `updateGoal` preserves identity on save.
 *
 *   • **Activities are sorted, and grouped under their category** — issue #6. v1 listed
 *     them in insertion order, which for anyone with more than a dozen activities is no
 *     order at all.
 *
 *   • **Nothing is saved until it is valid.** `isValid` requires a duration, at least one
 *     day and at least one thing to track, so a goal cannot exist in a state where its
 *     progress is meaningless.
 */

import { Button, Host, List, ListItem, Picker, Switch, TextInput } from '@expo/ui'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useLocaleTag } from '@/data/locale'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { DEFAULT_CATEGORIES, UNKNOWN_CATEGORY_ID, getCategory } from '@/domain/categories'
import {
  ALL_DAYS,
  type Goal,
  type GoalMode,
  type GoalPeriod,
  describeDays,
  isValid,
  makeGoal,
  updateGoal,
} from '@/domain/goals'
import { formatMinutes } from '@/domain/time'
import { colors } from '@/ui/theme/colors'

const MODES: { label: string; value: GoalMode }[] = [
  { label: 'Reach', value: 'goal' },
  { label: 'Stay under', value: 'limit' },
]

const PERIODS: { label: string; value: GoalPeriod }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
]

/** 15 min → 12 h. Finer than that is false precision for a calendar-derived number. */
const DURATIONS = Array.from({ length: 48 }, (_, i) => (i + 1) * 15)

const DRAFT: Omit<Goal, 'id' | 'createdAt'> = {
  title: '',
  mode: 'goal',
  days: ALL_DAYS,
  durationPerDay: 60,
  categoryIds: [],
  activityIds: [],
  period: 'week',
}

/** Sunday-first, matching `Date.getDay`; rotated for display by `weekStartsOn`. */
const dayNames = (locale: string): string[] => {
  const reference = Date.UTC(2026, 0, 4) // a Sunday
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
  return Array.from({ length: 7 }, (_, i) =>
    format.format(new Date(reference + i * 86_400_000)),
  )
}

export default function GoalEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const settings = useSettings()
  const update = useUpdateSettings()
  const router = useRouter()
  const locale = useLocaleTag()

  const existing = useMemo(
    () => settings.goals.find((goal) => goal.id === id),
    [settings.goals, id],
  )
  const [draft, setDraft] = useState<Omit<Goal, 'id' | 'createdAt'>>(
    () => existing ?? DRAFT,
  )

  const patch = useCallback(
    (change: Partial<Omit<Goal, 'id' | 'createdAt'>>) =>
      setDraft((current) => ({ ...current, ...change })),
    [],
  )

  const toggleDay = useCallback((index: number) => {
    setDraft((current) => ({
      ...current,
      days: current.days.map((on, i) => (i === index ? !on : on)),
    }))
  }, [])

  const toggleCategory = useCallback((categoryId: string) => {
    setDraft((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((c) => c !== categoryId)
        : [...current.categoryIds, categoryId],
    }))
  }, [])

  const toggleActivity = useCallback((activityId: string) => {
    setDraft((current) => ({
      ...current,
      activityIds: current.activityIds.includes(activityId)
        ? current.activityIds.filter((a) => a !== activityId)
        : [...current.activityIds, activityId],
    }))
  }, [])

  /** Issue #6: alphabetical, grouped under the category each activity resolves to. */
  const activitiesByCategory = useMemo(() => {
    const groups = new Map<string, typeof settings.activities>()
    for (const activity of settings.activities) {
      const key = activity.categoryId || UNKNOWN_CATEGORY_ID
      groups.set(key, [...(groups.get(key) ?? []), activity])
    }
    return [...groups.entries()]
      .map(([categoryId, activities]) => ({
        categoryId,
        activities: [...activities].sort((a, b) =>
          a.title.localeCompare(b.title, locale),
        ),
      }))
      .sort((a, b) =>
        getCategory(a.categoryId).name.localeCompare(getCategory(b.categoryId).name, locale),
      )
  }, [settings.activities, locale])

  const save = useCallback(() => {
    const now = Date.now()
    update((current) => ({
      ...current,
      goals:
        existing === undefined
          ? [...current.goals, makeGoal(draft, now, `goal_${now.toString(36)}`)]
          : current.goals.map((goal) =>
              goal.id === existing.id ? updateGoal(goal, draft) : goal,
            ),
    }))
    router.back()
  }, [update, existing, draft, router])

  const remove = useCallback(() => {
    if (existing === undefined) return
    update((current) => ({
      ...current,
      goals: current.goals.filter((goal) => goal.id !== existing.id),
    }))
    router.back()
  }, [update, existing, router])

  const names = useMemo(() => dayNames(locale), [locale])
  const valid = isValid({ ...draft, id: '', createdAt: 0 })

  return (
    <>
      <Stack.Screen
        options={{ title: existing === undefined ? 'New goal' : 'Edit goal' }}
      />
      <View style={styles.screen}>
        <Host style={styles.list} useViewportSizeMeasurement>
          <List>
            <ListItem
              trailing={
                <TextInput
                  defaultValue={draft.title}
                  placeholder="Optional"
                  onChangeText={(title) => patch({ title })}
                />
              }>
              Name
            </ListItem>

            <ListItem
              trailing={
                <Picker
                  selectedValue={draft.mode}
                  onValueChange={(value) => patch({ mode: value as GoalMode })}>
                  {MODES.map((mode) => (
                    <Picker.Item key={mode.value} label={mode.label} value={mode.value} />
                  ))}
                </Picker>
              }>
              Type
            </ListItem>

            <ListItem
              supportingText={`Per selected day, ${describeDays(draft.days, locale)}`}
              trailing={
                <Picker
                  selectedValue={draft.durationPerDay}
                  onValueChange={(value) => patch({ durationPerDay: Number(value) })}>
                  {DURATIONS.map((minutes) => (
                    <Picker.Item
                      key={minutes}
                      label={formatMinutes(minutes)}
                      value={minutes}
                    />
                  ))}
                </Picker>
              }>
              Duration
            </ListItem>

            <ListItem
              supportingText="The window progress is measured over"
              trailing={
                <Picker
                  selectedValue={draft.period}
                  onValueChange={(value) => patch({ period: value as GoalPeriod })}>
                  {PERIODS.map((period) => (
                    <Picker.Item
                      key={period.value}
                      label={period.label}
                      value={period.value}
                    />
                  ))}
                </Picker>
              }>
              Period
            </ListItem>

            <ListItem supportingText="Only the days you pick count towards progress.">
              Days
            </ListItem>
            {names.map((name, index) => (
              <ListItem
                key={name}
                trailing={
                  <Switch
                    value={draft.days[index] ?? false}
                    onValueChange={() => toggleDay(index)}
                  />
                }>
                {name}
              </ListItem>
            ))}

            <ListItem supportingText="Everything filed under a selected category counts.">
              Categories
            </ListItem>
            {DEFAULT_CATEGORIES.filter((c) => c.id !== UNKNOWN_CATEGORY_ID).map(
              (category) => (
                <ListItem
                  key={category.id}
                  trailing={
                    <Switch
                      value={draft.categoryIds.includes(category.id)}
                      onValueChange={() => toggleCategory(category.id)}
                    />
                  }>
                  {category.name}
                </ListItem>
              ),
            )}

            {activitiesByCategory.length > 0 && (
              <ListItem supportingText="Track a single activity instead of a whole category.">
                Activities
              </ListItem>
            )}
            {activitiesByCategory.flatMap(({ categoryId, activities }) => [
              <ListItem key={`head-${categoryId}`}>
                {getCategory(categoryId).name}
              </ListItem>,
              ...activities.map((activity) => (
                <ListItem
                  key={activity.id}
                  trailing={
                    <Switch
                      value={draft.activityIds.includes(activity.id)}
                      onValueChange={() => toggleActivity(activity.id)}
                    />
                  }>
                  {activity.title}
                </ListItem>
              )),
            ])}

            <ListItem
              trailing={
                <Button label="Save" onPress={save} disabled={!valid} />
              }
              supportingText={
                valid
                  ? undefined
                  : 'Pick a duration, at least one day, and something to track.'
              }>
              {existing === undefined ? 'Create goal' : 'Save changes'}
            </ListItem>

            {existing !== undefined && (
              <ListItem
                trailing={<Button variant="text" label="Delete" onPress={remove} />}>
                Delete this goal
              </ListItem>
            )}
          </List>
        </Host>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
})
