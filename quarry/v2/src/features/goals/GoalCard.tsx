/**
 * One goal.
 *
 * Rebuilt against `docs/SCREENS.md` §8c. The card is v1's: **filled with the goal's own
 * category colour**, darkened by a gradient, with on-dark text in both appearances
 * (`GoalCard.res:173-176`). That is not decoration — a wall of white cards makes every
 * goal look alike, and the colour is the fastest way to tell a Rest goal from a Work one
 * before reading a word. The first rebuild used a light surface and lost it.
 *
 * Restored with it: the **daily average** beside the ring (`GoalCard.res:334-352`), which
 * is the number that answers "am I actually doing this" better than a percentage does.
 *
 * The status is written as well as coloured. Colour alone excludes anyone who cannot
 * separate the greens from the oranges, and it does not survive being glanced at.
 */

import { LinearGradient } from 'expo-linear-gradient'
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
import { formatHoursMinutes, formatMinutes } from '@/domain/time'
import { AppText } from '@/ui/AppText'
import { RawSymbol } from '@/ui/Symbol'
import { CATEGORY_PALETTE, STATUS_PALETTE } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'
import { GoalRing } from './GoalRing'

const STATUS_LABEL: Record<GoalStatus, { goal: string; limit: string }> = {
  achieved: { goal: 'Reached', limit: 'Kept' },
  onTrack: { goal: 'On track', limit: 'Within limit' },
  behind: { goal: 'Behind', limit: 'Over pace' },
  missed: { goal: 'Out of reach', limit: 'Exceeded' },
}

/**
 * Text over a saturated card. v1 called this `textOnDarkLight` and it is the one colour
 * role the platform cannot supply — `PlatformColor('label')` is black in light mode and
 * would vanish here. Fixed white at two opacities, which is legible over every category
 * colour because the gradient guarantees the card is dark at the top.
 */
const ON_CARD = 'rgba(255,255,255,0.96)'
const ON_CARD_DIM = 'rgba(255,255,255,0.72)'

export type GoalCardProps = {
  goal: Goal
  progress: GoalProgress
  ringMode: RingMode
  locale: string
  /** Needed to name a goal that tracks activities rather than categories. */
  activities: readonly Activity[]
}

export function GoalCard({ goal, progress, ringMode, locale, activities }: GoalCardProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const status = STATUS_PALETTE[progress.status][scheme]

  // The card takes the colour of the first category the goal tracks, so a Rest goal and
  // a Rest bar in the chart are visibly the same thing.
  const categoryId = goal.categoryIds[0]
  const paletteName = categoryId === undefined ? undefined : getCategory(categoryId).color
  const tint = paletteName === undefined ? status : CATEGORY_PALETTE[paletteName].light

  /**
   * The ring is white, not the category colour — the *card* already carries the category.
   * Drawing an indigo ring on an indigo card makes the arc all but invisible, which the
   * preview showed at once. Apple's rings are bright on a dark ground for the same reason.
   */
  const ringColors: [string, string] = [ON_CARD, 'rgba(255,255,255,0.62)']

  const label = STATUS_LABEL[progress.status][goal.mode]
  const category = categoryId === undefined ? undefined : getCategory(categoryId)

  return (
    <View style={[styles.card, { backgroundColor: tint }]}>
      {/* v1 laid a gradient to 50 % black over the tint (`GoalCard.res:213-231`), which is
          what makes every category colour safe to put white text on. */}
      <LinearGradient
        colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.5)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.body}>
        <AppText role="caption" style={[styles.dim, styles.kind]}>
          {`${goal.mode === 'limit' ? 'LIMIT' : 'GOAL'} · ${label.toUpperCase()}`}
        </AppText>
        <AppText role="metric" numberOfLines={1} style={styles.on}>
          {goalTitle(goal, activities, (id) => getCategory(id).name)}
        </AppText>
        <AppText role="footnote" style={styles.dim}>
          {`${formatMinutes(goal.durationPerDay)}, ${describeDays(goal.days, locale)}`}
        </AppText>
      </View>

      <View style={styles.readout}>
        <GoalRing
          fraction={ringFraction(progress, ringMode)}
          size={72}
          colors={ringColors}
          trackColor="rgba(255,255,255,0.18)">
          {category === undefined ? (
            <AppText role="caption" tabular style={styles.on}>
              {`${ringPercent(progress, ringMode)}%`}
            </AppText>
          ) : (
            <RawSymbol
              pair={{ ios: category.sf, android: category.material }}
              size={26}
              color="rgba(255,255,255,0.35)"
            />
          )}
        </GoalRing>

        <View style={styles.figures}>
          <AppText role="caption" style={styles.dim}>
            Daily average
          </AppText>
          <AppText role="cardTitle" tabular style={styles.on}>
            {progress.dailyAverage > 0 ? formatMinutes(progress.dailyAverage) : '-'}
          </AppText>
          <AppText role="footnote" style={styles.dim}>
            {/* Both figures in hours, so the comparison is readable: "15h 1m of 40h",
                not "15h 1m of 1d 16h". */}
            {ringMode === 'period'
              ? `${formatHoursMinutes(progress.current)} of ${formatHoursMinutes(progress.target)} this ${goal.period}`
              : `${formatHoursMinutes(progress.current)} of ${formatHoursMinutes(progress.expectedByTonight)} due today`}
          </AppText>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.groupRadius,
    overflow: 'hidden',
    padding: space.lg,
    gap: space.lg,
  },
  body: {
    gap: space.xxs,
  },
  kind: {
    letterSpacing: 0.6,
  },
  readout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  figures: {
    flex: 1,
    gap: space.xxs,
  },
  on: {
    color: ON_CARD,
  },
  dim: {
    color: ON_CARD_DIM,
  },
})
