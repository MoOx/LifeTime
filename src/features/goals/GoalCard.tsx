/**
 * One goal, as a card in iOS 27's Health style (INTENT.md D28, docs/reference/health-27.md):
 * a heading in the category's colour with its icon and a chevron, a sentence saying where
 * the goal stands, then the daily average beside the ring.
 *
 * Carried from v1 (SCREENS.md §8c, `GoalCard.res` on `main`): `GOAL` / `LIMIT`, the title,
 * the duration and cadence ("30m, every day"), the daily average, the ring with the
 * scope or hourglass at its centre, and the ring's colours (`ringColors`). Changed: v1's
 * card was filled with the category colour; Health's white card keeps the colour in the
 * heading and the icon, and the status is written, not only coloured. The whole card opens
 * the editor, where v1 had a `...` button.
 */

import { Button, HStack, Image, RNHostView, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  font,
  foregroundStyle,
  lineLimit,
  padding,
  textCase,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { SymbolView } from 'expo-symbols'
import { useColorScheme } from 'react-native'

import type { Activity } from '@/domain/activities'
import { getCategory, UNKNOWN_CATEGORY_ID } from '@/domain/categories'
import {
  describeDays,
  goalTitle,
  ringColors,
  ringFraction,
  statusSentence,
  type Goal,
  type GoalProgress,
  type RingMode,
} from '@/domain/goals'
import { formatMinutes } from '@/domain/time'
import { DurationMetric } from '@/ui/Metric'
import { Section } from '@/ui/Form'
import { categoryColor } from '@/ui/theme/colors'

import { GoalRing } from './GoalRing'

const RING_SIZE = 76

export function GoalCard({
  goal,
  progress,
  ringMode,
  activities,
  locale,
  onPress,
}: {
  goal: Goal
  progress: GoalProgress
  ringMode: RingMode
  activities: readonly Activity[]
  locale: string
  onPress: () => void
}) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const category = getCategory(goal.categoryIds[0] ?? UNKNOWN_CATEGORY_ID)
  const color = categoryColor(category.color, scheme)
  const title = goalTitle(goal, activities, (id) => getCategory(id).name)
  const colors = ringColors(goal.mode, progress)

  return (
    <Section>
      <Button
        onPress={onPress}
        modifiers={[tint('primary'), accessibilityIdentifier(`goal-${title}`)]}>
        <VStack alignment="leading" spacing={10} modifiers={[padding({ vertical: 4 })]}>
          <HStack spacing={6}>
            <Image systemName={category.sf} color={color} size={15} />
            <Text
              modifiers={[
                font({ textStyle: 'subheadline', weight: 'semibold' }),
                foregroundStyle(color),
                textCase('uppercase'),
              ]}>
              {goal.mode === 'goal' ? 'Goal' : 'Limit'}
            </Text>
            <Spacer />
            <Image
              systemName="chevron.right"
              modifiers={[
                font({ textStyle: 'footnote', weight: 'semibold' }),
                foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
              ]}
            />
          </HStack>
          <VStack alignment="leading" spacing={2}>
            <Text modifiers={[font({ textStyle: 'title2', weight: 'bold' }), lineLimit(1)]}>
              {title}
            </Text>
            <Text
              modifiers={[
                font({ textStyle: 'subheadline' }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}>
              {`${formatMinutes(goal.durationPerDay)}, ${describeDays(goal.days, locale)}`}
            </Text>
          </VStack>
          <Text modifiers={[font({ textStyle: 'body', weight: 'semibold' })]}>
            {statusSentence(goal, progress)}
          </Text>
          <HStack alignment="center">
            <VStack alignment="leading" spacing={0}>
              <Text
                modifiers={[
                  font({ textStyle: 'footnote', weight: 'semibold' }),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                Daily Average
              </Text>
              {progress.dailyAverage > 0 ? (
                <DurationMetric minutes={progress.dailyAverage} />
              ) : (
                // v1 showed "-" when nothing was logged (`GoalCard.res:334-352`).
                <Text modifiers={[font({ textStyle: 'largeTitle', weight: 'semibold' })]}>-</Text>
              )}
            </VStack>
            <Spacer />
            <RNHostView matchContents>
              <GoalRing
                fraction={ringFraction(progress, ringMode)}
                size={RING_SIZE}
                colors={colors}>
                <SymbolView
                  name={goal.mode === 'goal' ? 'scope' : 'hourglass'}
                  size={22}
                  tintColor={colors[0]}
                />
              </GoalRing>
            </RNHostView>
          </HStack>
        </VStack>
      </Button>
    </Section>
  )
}
