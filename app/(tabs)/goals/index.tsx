/**
 * Goals.
 *
 * Cards rather than rows, because a goal is not a setting — it is a reading, and the ring
 * is the reading. What the list *does* borrow from v1's grammar is the heading with an
 * action on the right, which is where the ring-mode control belongs: it changes what the
 * section shows, exactly like "Show This Week" on the Summary.
 *
 * The title is drawn by `headerLargeTitle`, so it is UIKit's large title at UIKit's size.
 */

import { Host, Picker } from '@expo/ui'
import { useRouter } from 'expo-router'
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
import { type RingMode, computeProgress, goalMinutes, periodRange } from '@/domain/goals'
import { clampToNow } from '@/domain/week'
import { GoalCard } from '@/features/goals/GoalCard'
import { AppText } from '@/ui/AppText'
import { ListFootnote, ListHeader } from '@/ui/List'
import { Symbol } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

const RING_MODES: { label: string; value: RingMode }[] = [
  { label: 'Whole period', value: 'period' },
  { label: 'Today’s pace', value: 'pace' },
]

export default function GoalsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const settings = useSettings()
  const update = useUpdateSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const [permission] = useCalendarPermissions()
  const granted = permission?.granted ?? false
  const calendars = useCalendarList(granted)

  const now = useMemo(() => Date.now(), [])
  const rules = useMemo(() => rulesOf(settings, !granted), [settings, granted])

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

  const setRingMode = useCallback((ringMode: RingMode) => update({ ringMode }), [update])

  if (settings.goals.length === 0) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.empty, { paddingBottom: insets.bottom + 32 }]}
        contentInsetAdjustmentBehavior="automatic">
        <Symbol name="goals" size={34} color={colors.tertiaryLabel} />
        <AppText role="cardTitle" style={styles.centered}>
          No goals yet
        </AppText>
        <AppText role="secondary" tone="secondary" style={styles.centered}>
          Set a goal to reach, or a limit to respect, and LifeTime will tell you where you
          stand — counted only on the days you chose.
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/goals/new')}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <AppText role="button" tone="accent">
            Add a goal
          </AppText>
        </Pressable>
      </ScrollView>
    )
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        granted ? (
          <RefreshControl refreshing={live.loading} onRefresh={live.refresh} />
        ) : undefined
      }>
      <View style={styles.headerRow}>
        <ListHeader title="Showing" style={styles.headerFlex} />
        <Host matchContents style={styles.picker}>
          <Picker
            selectedValue={settings.ringMode}
            onValueChange={(value) => setRingMode(value as RingMode)}>
            {RING_MODES.map((mode) => (
              <Picker.Item key={mode.value} label={mode.label} value={mode.value} />
            ))}
          </Picker>
        </Host>
      </View>

      <View style={styles.cards}>
        {settings.goals.map((goal, index) => {
          const range = ranges[index]!
          const raw = granted ? live.byRange[index] : demoEvents(range, now)
          const counted = raw === undefined ? undefined : goalEvents(raw, filter, rules)
          const current =
            counted === undefined ? 0 : goalMinutes(goal, counted, rules, range)

          return (
            <Pressable
              key={goal.id}
              onPress={() =>
                router.push({ pathname: '/goals/[id]', params: { id: goal.id } })
              }
              style={({ pressed }) => pressed && styles.pressed}>
              <GoalCard
                goal={goal}
                progress={computeProgress(goal, current, range, now)}
                ringMode={settings.ringMode}
                locale={locale}
                activities={settings.activities}
              />
            </Pressable>
          )
        })}
      </View>

      <ListFootnote>
        {settings.ringMode === 'period'
          ? 'The ring fills across the whole period, so it starts empty and finishes full.'
          : 'The ring is full whenever you are where you meant to be by tonight.'}
      </ListFootnote>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/goals/new')}
        style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}>
        <Symbol name="add" size={18} color={colors.accent} />
        <AppText role="button" tone="accent">
          Add a goal
        </AppText>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: space.lg,
  },
  headerFlex: {
    flex: 1,
  },
  picker: {
    marginTop: space.sm,
  },
  cards: {
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  empty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    paddingHorizontal: space.xxl,
  },
  centered: {
    textAlign: 'center',
  },
  action: {
    marginTop: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: 999,
    backgroundColor: colors.selection,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.xl,
    marginHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: layout.groupRadius,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
})
