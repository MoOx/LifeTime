/**
 * The goal editor. `id === 'new'` creates one.
 *
 * v1's layout, which was better than a list of rows and worth porting properly:
 *
 *   • **Days are seven circles in a row**, letter above, filled tick below. Seven switch
 *     rows say the same thing in seven times the height and make "weekdays only" a
 *     five-tap operation you have to scroll through.
 *   • **Duration has quick chips** before the fine control, because almost every goal is
 *     30 min, 1 h or 2 h and nobody wants to spin a wheel to say so.
 *   • **A footnote under every group**, explaining the thing the labels cannot.
 *
 * And three bugs of v1's that cannot recur here:
 *
 *   • Identity survives editing. v1 rebuilt the goal through `Goal.make` on every
 *     keystroke, regenerating `id` and `createdAt` (IMPROVEMENTS.md §A.2). The draft is
 *     local state; `updateGoal` merges it.
 *   • Activities are sorted and grouped under their category — issue #6.
 *   • Nothing saves until `isValid`, so a goal cannot exist whose progress is undefined.
 */

import { Host, Slider, TextInput } from '@expo/ui'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
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
import { MINUTES_PER_DAY, formatHoursMinutes, formatMinutes } from '@/domain/time'
import { AppText } from '@/ui/AppText'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { RawSymbol, Symbol } from '@/ui/Symbol'
import { categoryColor, colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

/**
 * "Goal" and "Limit", not "Reach" and "Stay under". v1 used the former and it reads
 * better: they are the two things the app measures, and the card says the same word back
 * to you. A verb phrase describes an action once; a noun names the object forever.
 */
const MODES: { label: string; value: GoalMode; description: string }[] = [
  { label: 'Goal', value: 'goal', description: 'Time you want to reach' },
  { label: 'Limit', value: 'limit', description: 'Time you want to stay under' },
]

const PERIODS: { label: string; value: GoalPeriod }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
]

/** The durations almost every goal actually uses. */
/** v1's slider granularity (`GoalEdit.res:294`). */
const DURATION_STEP = 15

const QUICK_DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240, 480]

const DRAFT: Omit<Goal, 'id' | 'createdAt'> = {
  title: '',
  mode: 'goal',
  days: ALL_DAYS,
  durationPerDay: 60,
  categoryIds: [],
  activityIds: [],
  period: 'week',
}

/** Sunday-first, matching `Date.getDay`. */
const dayNames = (locale: string): string[] => {
  const reference = Date.UTC(2026, 0, 4) // a Sunday
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
  return Array.from({ length: 7 }, (_, i) =>
    format.format(new Date(reference + i * 86_400_000)),
  )
}

export default function GoalEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const update = useUpdateSettings()
  const router = useRouter()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'

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
        activities: [...activities].sort((a, b) => a.title.localeCompare(b.title, locale)),
      }))
      .sort((a, b) =>
        getCategory(a.categoryId).name.localeCompare(
          getCategory(b.categoryId).name,
          locale,
        ),
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
    Alert.alert('Delete this goal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          update((current) => ({
            ...current,
            goals: current.goals.filter((goal) => goal.id !== existing.id),
          }))
          router.back()
        },
      },
    ])
  }, [update, existing, router])

  const names = useMemo(() => dayNames(locale), [locale])
  /** Display order follows the locale's first weekday, the data stays Sunday-indexed. */
  const dayOrder = useMemo(
    () => Array.from({ length: 7 }, (_, i) => (weekStartsOn + i) % 7),
    [weekStartsOn],
  )
  const valid = isValid({ ...draft, id: '', createdAt: 0 })
  const total = draft.durationPerDay * draft.days.filter(Boolean).length

  /**
   * What is missing, named. "Pick a duration, at least one day, and something to track"
   * makes the user check three things; naming only the ones that are actually wrong makes
   * them check none.
   */
  const missing = [
    draft.durationPerDay > 0 ? undefined : 'a duration',
    draft.days.some(Boolean) ? undefined : 'at least one day',
    draft.categoryIds.length > 0 || draft.activityIds.length > 0
      ? undefined
      : 'a category or an activity',
  ].filter((item): item is string => item !== undefined)

  return (
    <>
      <Stack.Screen
        options={{ title: existing === undefined ? 'New goal' : 'Edit goal' }}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
        contentInsetAdjustmentBehavior="automatic">
        <ListHeader title="Type" />
        <ListGroup>
          {MODES.map((mode) => (
            <ListRow
              key={mode.value}
              title={mode.label}
              subtitle={mode.description}
              onPress={() => patch({ mode: mode.value })}
              accessory={
                draft.mode === mode.value ? (
                  <Symbol name="checkmark" size={17} color={colors.accent} />
                ) : undefined
              }
            />
          ))}
        </ListGroup>

        <ListHeader title="Name" />
        <ListGroup>
          <ListRow
            title="Name"
            accessory={
              <Host matchContents>
                <TextInput
                  defaultValue={draft.title}
                  placeholder="Optional"
                  onChangeText={(title) => patch({ title })}
                />
              </Host>
            }
          />
        </ListGroup>
        <ListFootnote>
          Leave it empty and the goal is named after what it tracks.
        </ListFootnote>

        <ListHeader title="Days" />
        <View style={styles.daysCard}>
          {dayOrder.map((day) => {
            const on = draft.days[day] ?? false
            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(day)}
                hitSlop={6}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={names[day]}
                style={({ pressed }) => [styles.day, pressed && styles.pressed]}>
                {/* The day's own name inside the circle, the way every repeat picker on
                    both platforms does it. A label above a tick below says the same thing
                    twice, in two rows, and the tick has to be read against the label to
                    mean anything. */}
                <View style={[styles.dayCircle, on ? styles.dayOn : styles.dayOff]}>
                  <AppText
                    role="footnote"
                    tone={on ? 'inverse' : 'secondary'}
                    numberOfLines={1}>
                    {names[day]}
                  </AppText>
                </View>
              </Pressable>
            )
          })}
        </View>
        <ListFootnote>
          {`Counted ${describeDays(draft.days, locale)}. Days you leave out never count against you.`}
        </ListFootnote>

        <ListHeader title="Duration" />
        <View style={styles.durationCard}>
          <View style={styles.chips}>
            {QUICK_DURATIONS.map((minutes) => {
              const selected = draft.durationPerDay === minutes
              return (
                <Pressable
                  key={minutes}
                  onPress={() => patch({ durationPerDay: minutes })}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipOn,
                    pressed && styles.pressed,
                  ]}>
                  <AppText role="footnote" tone={selected ? 'inverse' : 'primary'} tabular>
                    {formatMinutes(minutes)}
                  </AppText>
                </Pressable>
              )
            })}
          </View>

          {/*
            The slider is not decoration and not a duplicate of the chips: the chips are
            the nine durations almost everyone wants, the slider is how you say 3 h 45.
            v1 had both (`GoalEdit.res:288-300`) and the first rebuild kept only the chips,
            which quietly made a third of the range unreachable. Same bounds as v1 —
            0 to 24 h in 15-minute steps — with the ends labelled, as it had them.
          */}
          <View style={styles.sliderRow}>
            <AppText role="caption" tone="tertiary" tabular>
              0
            </AppText>
            <Host matchContents={{ vertical: true }} style={styles.slider}>
              <Slider
                value={draft.durationPerDay}
                min={0}
                max={MINUTES_PER_DAY}
                step={DURATION_STEP}
                onValueChange={(minutes) =>
                  patch({ durationPerDay: Math.round(minutes / DURATION_STEP) * DURATION_STEP })
                }
              />
            </Host>
            <AppText role="caption" tone="tertiary" tabular>
              24
            </AppText>
          </View>
        </View>
        <ListFootnote>
          {`${formatMinutes(draft.durationPerDay)} per selected day — ${formatHoursMinutes(total)} over a full week.`}
        </ListFootnote>

        <ListHeader title="Period" />
        <ListGroup>
          {PERIODS.map((period) => (
            <ListRow
              key={period.value}
              title={period.label}
              onPress={() => patch({ period: period.value })}
              accessory={
                draft.period === period.value ? (
                  <Symbol name="checkmark" size={17} color={colors.accent} />
                ) : undefined
              }
            />
          ))}
        </ListGroup>
        <ListFootnote>
          The window progress is measured over. A weekly goal resets every week; what
          matters is the total across it.
        </ListFootnote>

        <ListHeader title="Categories" />
        <ListGroup separatorInset="text">
          {DEFAULT_CATEGORIES.filter((c) => c.id !== UNKNOWN_CATEGORY_ID).map(
            (category) => {
              const color = categoryColor(category.color, scheme)
              const selected = draft.categoryIds.includes(category.id)
              return (
                <ListRow
                  key={category.id}
                  title={category.name}
                  onPress={() => toggleCategory(category.id)}
                  leading={
                    <View style={[styles.icon, { backgroundColor: color }]}>
                      <RawSymbol
                        pair={{ ios: category.sf, android: category.material }}
                        size={15}
                        color={colors.onAccent}
                      />
                    </View>
                  }
                  accessory={
                    selected ? (
                      <Symbol name="checkmark" size={17} color={color} />
                    ) : undefined
                  }
                />
              )
            },
          )}
        </ListGroup>
        <ListFootnote>
          Picking a category includes every future activity filed under it, not just
          today's.
        </ListFootnote>

        {activitiesByCategory.map(({ categoryId, activities }) => (
          <View key={categoryId}>
            <ListHeader title={getCategory(categoryId).name} />
            <ListGroup>
              {activities.map((activity) => (
                <ListRow
                  key={activity.id}
                  title={activity.title}
                  onPress={() => toggleActivity(activity.id)}
                  accessory={
                    draft.activityIds.includes(activity.id) ? (
                      <Symbol name="checkmark" size={17} color={colors.accent} />
                    ) : undefined
                  }
                />
              ))}
            </ListGroup>
          </View>
        ))}

        <ListGroup style={styles.spaced}>
          <ListRow
            centeredAction
            disabled={!valid}
            title={existing === undefined ? 'Create goal' : 'Save changes'}
            onPress={save}
          />
        </ListGroup>
        {!valid && (
          <ListFootnote tone="destructive">
            {`Still needed: ${missing.join(', ')}.`}
          </ListFootnote>
        )}

        {existing !== undefined && (
          <ListGroup style={styles.spaced}>
            <ListRow destructive title="Delete this goal" onPress={remove} />
          </ListGroup>
        )}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  daysCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: layout.groupRadius,
    marginHorizontal: space.lg,
    paddingVertical: space.lg,
    paddingHorizontal: space.md,
  },
  day: {
    alignItems: 'center',
    gap: space.xs,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: {
    backgroundColor: colors.accent,
  },
  dayOff: {
    borderWidth: 1.5,
    borderColor: colors.fill,
  },
  durationCard: {
    gap: space.lg,
    backgroundColor: colors.surface,
    borderRadius: layout.groupRadius,
    marginHorizontal: space.lg,
    padding: space.lg,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  slider: {
    flex: 1,
  },
  chip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: 999,
    backgroundColor: colors.selection,
  },
  chipOn: {
    backgroundColor: colors.accent,
  },
  icon: {
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: layout.iconSize / 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaced: {
    marginTop: space.xl,
  },
  pressed: {
    opacity: 0.6,
  },
})
