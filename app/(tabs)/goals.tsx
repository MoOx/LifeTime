/**
 * Goals — the corrected progress model, rendered.
 *
 * Parity target: v1's `GoalsScreen` + `Goals` + `GoalCard` (docs/SPEC.md §4.7).
 *
 * The control in the top right is the one thing v1 had no equivalent of, and it settles a
 * genuine ambiguity: a ring can answer "how much of this week have I done" or "am I where
 * I should be right now", and those are different questions with different right answers.
 * The default is the first, because that is the Fitness reading — the ring is empty on
 * Monday morning, and filling it is the point.
 */

import { Host, Picker } from '@expo/ui'
import { Link } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarPermissions } from '@/data/calendars'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { useCalendarList } from '@/data/useCalendarList'
import { useEventRanges } from '@/data/useEvents'
import { rulesOf } from '@/data/useReport'
import { demoEvents } from '@/domain/demo'
import { goalEvents } from '@/domain/events'
import {
  type RingMode,
  computeProgress,
  goalMinutes,
  periodRange,
} from '@/domain/goals'
import { clampToNow } from '@/domain/week'
import { GoalCard } from '@/features/goals/GoalCard'
import { AppText } from '@/ui/AppText'
import { Symbol } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'

const RING_MODES: { label: string; value: RingMode }[] = [
  { label: 'Whole period', value: 'period' },
  { label: 'Today’s pace', value: 'pace' },
]

export default function GoalsScreen() {
  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const update = useUpdateSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const [permission] = useCalendarPermissions()
  const granted = permission?.granted ?? false
  const calendars = useCalendarList(granted)

  const now = useMemo(() => Date.now(), [])
  const rules = useMemo(() => rulesOf(settings), [settings])

  // Goals can have different periods, so fetch the union of the ranges they need.
  const ranges = useMemo(
    () =>
      settings.goals.map((goal) =>
        clampToNow(periodRange(goal.period, now, weekStartsOn), now),
      ),
    [settings.goals, now, weekStartsOn],
  )

  const calendarIds = useMemo(
    () =>
      calendars
        .map((c) => c.id)
        .filter((id) => !settings.skippedCalendars.some((s) => s.id === id)),
    [calendars, settings.skippedCalendars],
  )

  const live = useEventRanges(granted ? calendarIds : [], ranges)

  const filter = useMemo(
    () => ({
      skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
      skippedActivityTitles: settings.skippedActivityTitles,
      hideSkippedActivities: settings.hideSkippedActivities,
    }),
    [settings],
  )

  const setRingMode = useCallback(
    (ringMode: RingMode) => update({ ringMode }),
    [update],
  )

  const header = (
    <View style={styles.header}>
      <AppText role="screenTitle" style={styles.headerTitle}>
        Goals
      </AppText>
      {settings.goals.length > 0 && (
        <Host matchContents>
          <Picker
            selectedValue={settings.ringMode}
            onValueChange={(value) => setRingMode(value as RingMode)}>
            {RING_MODES.map((mode) => (
              <Picker.Item key={mode.value} label={mode.label} value={mode.value} />
            ))}
          </Picker>
        </Host>
      )}
    </View>
  )

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        granted ? (
          <RefreshControl refreshing={live.loading} onRefresh={live.refresh} />
        ) : undefined
      }>
      {header}

      {settings.goals.length === 0 ? (
        <View style={styles.empty}>
          <Symbol name="goals" size={34} color={colors.tertiaryLabel} />
          <AppText role="cardTitle" style={styles.centered}>
            No goals yet
          </AppText>
          <AppText role="secondary" tone="secondary" style={styles.centered}>
            Set a goal to reach, or a limit to respect, and LifeTime will tell you where
            you stand — counted only on the days you chose.
          </AppText>
          <Link href="/goal/new" asChild>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
              <AppText role="button" tone="accent">
                Add a goal
              </AppText>
            </Pressable>
          </Link>
        </View>
      ) : (
        settings.goals.map((goal, index) => {
          const range = ranges[index]!
          const raw = granted ? live.byRange[index] : demoEvents(range, now)
          const counted =
            raw === undefined ? undefined : goalEvents(raw, filter, rules)

          const current =
            counted === undefined ? 0 : goalMinutes(goal, counted, rules, range)

          return (
            <Link
              key={goal.id}
              href={{ pathname: '/goal/[id]', params: { id: goal.id } }}
              asChild>
              <Pressable style={({ pressed }) => pressed && styles.pressed}>
                <GoalCard
                  goal={goal}
                  progress={computeProgress(goal, current, range, now)}
                  ringMode={settings.ringMode}
                  locale={locale}
                  activities={settings.activities}
                />
              </Pressable>
            </Link>
          )
        })
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  headerTitle: {
    flexShrink: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  centered: {
    textAlign: 'center',
  },
  action: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: colors.selection,
  },
  pressed: {
    opacity: 0.7,
  },
})
