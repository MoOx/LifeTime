/**
 * A duration drawn as iOS 27's Health draws its figures: the numbers large, the units small
 * ("5 h 33 min", docs/reference/health-27.md, INTENT.md D28). VoiceOver reads it as one value.
 */

import { HStack, Text } from '@expo/ui/swift-ui'
import {
  accessibilityElement,
  accessibilityIdentifier,
  accessibilityLabel,
  font,
  foregroundStyle,
  monospacedDigit,
  padding,
} from '@expo/ui/swift-ui/modifiers'

import { durationParts, formatMinutes } from '@/domain/time'

export function DurationMetric({ minutes, testID }: { minutes: number; testID?: string }) {
  const parts = durationParts(minutes)
  return (
    <HStack
      alignment="firstTextBaseline"
      spacing={0}
      modifiers={[
        accessibilityElement('ignore'),
        accessibilityLabel(formatMinutes(minutes)),
        ...(testID ? [accessibilityIdentifier(testID)] : []),
      ]}>
      {parts.map(({ value, unit }, index) => (
        <HStack key={unit} alignment="firstTextBaseline" spacing={1}>
          <Text
            modifiers={[
              font({ textStyle: 'largeTitle', weight: 'semibold', design: 'rounded' }),
              monospacedDigit(),
            ]}>
            {String(value)}
          </Text>
          <Text
            modifiers={[
              font({ textStyle: 'title3', weight: 'semibold', design: 'rounded' }),
              foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ...(index < parts.length - 1 ? [padding({ trailing: 6 })] : []),
            ]}>
            {unit}
          </Text>
        </HStack>
      ))}
    </HStack>
  )
}
