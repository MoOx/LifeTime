/**
 * One goal.
 *
 * The status is written as well as coloured. Colour alone excludes anyone who cannot
 * separate the greens from the oranges, and it does not survive being glanced at — v1
 * relied on it entirely.
 */

import { StyleSheet, View, useColorScheme } from 'react-native'

import type { Activity } from '@/domain/activities'
import { getCategory } from '@/domain/categories'
import {
  type Goal,
  type GoalProgress,
  type GoalStatus,
  type RingMode,
  describeDays,
  goalTitle,
  ringFraction,
  ringPercent,
} from '@/domain/goals'
import { formatMinutes } from '@/domain/time'
import { AppText } from '@/ui/AppText'
import { CATEGORY_PALETTE, STATUS_PALETTE, colors } from '@/ui/theme/colors'
import { GoalRing } from './GoalRing'

const STATUS_LABEL: Record<GoalStatus, { goal: string; limit: string }> = {
  achieved: { goal: 'Reached', limit: 'Kept' },
  onTrack: { goal: 'On track', limit: 'Within limit' },
  behind: { goal: 'Behind', limit: 'Over pace' },
  missed: { goal: 'Out of reach', limit: 'Exceeded' },
}

export type GoalCardProps = {
  goal: Goal
  progress: GoalProgress
  ringMode: RingMode
  locale: string
  /** Needed to name a goal that tracks activities rather than categories. */
  activities: readonly Activity[]
}

export function GoalCard({
  goal,
  progress,
  ringMode,
  locale,
  activities,
}: GoalCardProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const status = STATUS_PALETTE[progress.status][scheme]

  // The ring takes the colour of the first category the goal tracks, so a Rest goal and
  // a Rest bar in the chart are visibly the same thing. Status colour is the fallback.
  const categoryId = goal.categoryIds[0]
  const paletteName = categoryId === undefined ? undefined : getCategory(categoryId).color
  const ringColors: [string, string] =
    paletteName === undefined
      ? [status, status]
      : [CATEGORY_PALETTE[paletteName][scheme], CATEGORY_PALETTE[paletteName].light]

  const fraction = ringFraction(progress, ringMode)
  const label = STATUS_LABEL[progress.status][goal.mode]

  const caption =
    ringMode === 'period'
      ? `of ${formatMinutes(progress.target)} this ${goal.period}`
      : `of ${formatMinutes(progress.expectedByTonight)} due today`

  return (
    <View style={styles.card}>
      <GoalRing
        fraction={fraction}
        size={84}
        colors={ringColors}
        trackColor={scheme === 'dark' ? '#2A2A2E' : '#EAEAEF'}>
        <AppText role="headline" tabular>
          {`${ringPercent(progress, ringMode)}%`}
        </AppText>
      </GoalRing>

      <View style={styles.body}>
        <AppText role="caption" tone="tertiary">
          {`${goal.mode === 'limit' ? 'LIMIT' : 'GOAL'} · ${label.toUpperCase()}`}
        </AppText>
        <AppText role="cardTitle" numberOfLines={2}>
          {goalTitle(goal, activities, (id) => getCategory(id).name)}
        </AppText>
        <AppText role="secondary" tone="secondary">
          {`${formatMinutes(goal.durationPerDay)}, ${describeDays(goal.days, locale)}`}
        </AppText>
        <AppText role="body" tabular>
          {formatMinutes(progress.current)}
        </AppText>
        <AppText role="footnote" tone="tertiary">
          {caption}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    gap: 2,
  },
})
