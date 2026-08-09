/**
 * Goals — the corrected progress model, rendered.
 *
 * Parity target: v1's `GoalsScreen` + `Goals` + `GoalCard` (docs/SPEC.md §4.7). Present
 * here: the goal list with progress computed by `domain/goals.ts`. Still to port: the
 * goal editor, the progress ring, and the onboarding block.
 */

import { useMemo } from 'react'
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native'

import { useCalendarPermissions } from '@/data/calendars'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useSettings } from '@/data/settingsStore'
import { useCalendarList } from '@/data/useCalendarList'
import { useEventRanges } from '@/data/useEvents'
import { minutesByCategory, minutesByTitle } from '@/domain/aggregate'
import { getCategory } from '@/domain/categories'
import { filterEvents } from '@/domain/events'
import {
  computeProgress,
  describeDays,
  goalMinutes,
  goalTitle,
  periodRange,
  type GoalStatus,
} from '@/domain/goals'
import { formatMinutes } from '@/domain/time'
import { clampToNow } from '@/domain/week'
import { AppText } from '@/ui/AppText'
import { Section } from '@/ui/Section'
import { STATUS_PALETTE, colors } from '@/ui/theme/colors'

const STATUS_LABEL: Record<GoalStatus, string> = {
  achieved: 'Achieved',
  onTrack: 'On track',
  behind: 'Behind',
  missed: 'Missed',
}

export default function GoalsScreen() {
  const settings = useSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const [permission] = useCalendarPermissions()
  const calendars = useCalendarList(permission?.granted ?? false)

  const now = useMemo(() => Date.now(), [])

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

  const { byRange } = useEventRanges(calendarIds, ranges)

  if (settings.goals.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <Section style={styles.intro}>
          <AppText role="screenTitle">Goals</AppText>
          <AppText role="body" tone="secondary">
            Add a goal to reach, or a limit to respect, and LifeTime will tell you where
            you stand — measured only on the days you chose.
          </AppText>
        </Section>
      </ScrollView>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
      <Section>
        <AppText role="screenTitle">Goals</AppText>
      </Section>

      {settings.goals.map((goal, index) => {
        const range = ranges[index]!
        const raw = byRange[index]
        const events =
          raw === undefined
            ? undefined
            : filterEvents(raw, {
                skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
                skippedActivityTitles: settings.skippedActivityTitles,
                hideSkippedActivities: settings.hideSkippedActivities,
              })

        const current =
          events === undefined
            ? 0
            : goalMinutes(
                goal,
                minutesByCategory(events, settings.activities, range),
                minutesByTitle(events, range),
                settings.activities,
              )

        const progress = computeProgress(goal, current, range, now)
        const accent = STATUS_PALETTE[progress.status][scheme]

        return (
          <View key={goal.id} style={[styles.card, { borderLeftColor: accent }]}>
            <Section style={styles.cardBody}>
              <AppText role="caption" tone="tertiary">
                {`${goal.mode === 'limit' ? 'LIMIT' : 'GOAL'} · ${STATUS_LABEL[progress.status]}`}
              </AppText>
              <AppText role="cardTitle" numberOfLines={1}>
                {goalTitle(goal, settings.activities, (id) => getCategory(id).name)}
              </AppText>
              <AppText role="secondary" tone="secondary">
                {`${formatMinutes(goal.durationPerDay)}, ${describeDays(goal.days, locale)}`}
              </AppText>
              <AppText role="body">
                {`${formatMinutes(progress.current)} of ${formatMinutes(progress.target)}`}
              </AppText>
              <AppText role="secondary" tone="secondary">
                {`Daily average ${formatMinutes(progress.dailyAverage)}`}
              </AppText>
            </Section>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: accent,
                    width: `${Math.min(100, Math.max(0, progress.completion * 100))}%`,
                  },
                ]}
              />
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  intro: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardBody: {
    padding: 16,
    gap: 4,
  },
  track: {
    height: 6,
    backgroundColor: colors.separator,
  },
  fill: {
    height: 6,
  },
})
