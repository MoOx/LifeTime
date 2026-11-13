/**
 * The week's activities, heaviest first: docs/SCREENS.md §3.2, `TopActivities.res` on
 * `main`. Drawn by SwiftUI (INTENT.md D27): each row is a button holding the category
 * icon, the title, a bar in the category colour with the duration after it, and the
 * chevron.
 */

import { Button, Capsule, HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  background,
  containerRelativeFrame,
  font,
  foregroundStyle,
  frame,
  layoutPriority,
  lineLimit,
  monospacedDigit,
  shapes,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'
import { useState } from 'react'
import { useColorScheme } from 'react-native'

import type { Bucket } from '@/domain/aggregate'
import { getCategory, type CategoryId } from '@/domain/categories'
import { formatMinutes } from '@/domain/time'
import { Section } from '@/ui/Form'
import { categoryColor } from '@/ui/theme/colors'
import { layout } from '@/ui/theme/space'

/** `TopActivities.res:6`: eight rows, then Show More. */
const ROWS_COLLAPSED = 8
/**
 * The longest bar spans this share of the list's width, leaving room for the duration
 * after it. v1 subtracted 85 pt for the duration from the row width (`TopActivities.res:28`).
 */
const BAR_SHARE = 40

export type TopActivity = Bucket & { categoryId: CategoryId }

export function TopActivities({
  activities,
  onCustomize,
}: {
  activities: TopActivity[]
  onCustomize?: () => void
}) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? activities : activities.slice(0, ROWS_COLLAPSED)
  const max = activities[0]?.minutes ?? 0

  return (
    <Section
      title="Top Activities"
      action={{ label: 'Customize report', onPress: onCustomize }}
      footer={
        activities.length === 0
          ? 'You should add some events to your calendar or activate more calendars.'
          : undefined
      }>
      {activities.length === 0 ? <Text>No activities</Text> : null}
      {shown.map((activity) => {
        const category = getCategory(activity.categoryId)
        const color = categoryColor(category.color, scheme)
        const span = max > 0 ? Math.max(1, Math.round((activity.minutes / max) * BAR_SHARE)) : 1
        return (
          <Button
            key={activity.key}
            onPress={() =>
              router.push({
                pathname: '/summary/activity',
                params: { title: activity.key },
              })
            }
            modifiers={[tint('primary'), accessibilityIdentifier(`activity-${activity.key}`)]}>
            <HStack spacing={layout.iconGap}>
              <Image
                systemName={category.sf}
                color="white"
                size={15}
                modifiers={[
                  frame({ width: layout.iconSize, height: layout.iconSize }),
                  background(
                    color,
                    shapes.roundedRectangle({
                      cornerRadius: 7,
                      roundedCornerStyle: 'continuous',
                    }),
                  ),
                ]}
              />
              <VStack alignment="leading" spacing={6}>
                <Text modifiers={[font({ textStyle: 'callout' }), lineLimit(1)]}>
                  {activity.key}
                </Text>
                <HStack spacing={6}>
                  <Capsule
                    modifiers={[
                      foregroundStyle(color),
                      containerRelativeFrame({
                        axes: 'horizontal',
                        count: 100,
                        span,
                        alignment: 'leading',
                      }),
                      frame({ height: 6 }),
                    ]}
                  />
                  <Text
                    modifiers={[
                      font({ textStyle: 'footnote' }),
                      foregroundStyle({
                        type: 'hierarchical',
                        style: 'secondary',
                      }),
                      monospacedDigit(),
                      lineLimit(1),
                      // The duration is never cut: the bar gives way first.
                      layoutPriority(1),
                    ]}>
                    {formatMinutes(activity.minutes)}
                  </Text>
                  <Spacer />
                </HStack>
              </VStack>
              <Image
                systemName="chevron.right"
                modifiers={[
                  font({ textStyle: 'footnote', weight: 'semibold' }),
                  foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
                ]}
              />
            </HStack>
          </Button>
        )
      })}
      {activities.length > ROWS_COLLAPSED ? (
        <Button
          label={expanded ? 'Show Less' : 'Show More'}
          onPress={() => setExpanded(!expanded)}
          modifiers={[accessibilityIdentifier('activities-more')]}
        />
      ) : null}
    </Section>
  )
}
