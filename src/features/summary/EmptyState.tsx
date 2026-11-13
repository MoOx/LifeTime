/**
 * The Summary's empty states: SCREENS.md §3.1, `NoEventBox.res` on `main`. The reason is
 * judged over the last two weeks by `explainEmptinessOverWeeks`; each reason has v1's
 * message and two buttons. "relevent" is corrected (spec/30-screens.md). `Get Started`
 * opens Help, as v2 decided and the spec keeps.
 */

import { Button, Text } from '@expo/ui/swift-ui'
import { accessibilityIdentifier } from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'

import type { EmptyReason } from '@/domain/events'
import { openCalendarApp } from '@/data/calendar'
import { Section } from '@/ui/Form'

/** `NoEventBox.res:76-79`: appended to the first message only. */
const SUFFIX =
  ' LifeTime can help you to understand how you use your time and rely on calendar events to learn how you use it. By saving events into your calendars, you will be able to visualize reports so you can take more informed decisions about how to use your valuable time.'

const MESSAGES: Record<Exclude<EmptyReason, 'has-events'>, string> = {
  'no-events': 'LifeTime could not find any events on the last two weeks.' + SUFFIX,
  'only-all-day':
    'LifeTime could not find any relevant events on the last two weeks. All day events are not suitable for time tracking.',
  'only-skipped-calendars':
    "LifeTime could not find any recent events that aren't part of skipped calendars.",
  'only-skipped-activities':
    "LifeTime could not find any recent events that aren't part of skipped activities.",
}

export function EmptyState({
  reason,
  onToggleHidden,
}: {
  reason: Exclude<EmptyReason, 'has-events'>
  onToggleHidden: () => void
}) {
  const primary =
    reason === 'only-skipped-calendars'
      ? { label: 'Help me customize settings', onPress: () => router.push('/filters') }
      : reason === 'only-skipped-activities'
        ? { label: 'Toggle Hidden Activities', onPress: onToggleHidden }
        : { label: 'Get Started', onPress: () => router.push('/help') }
  return (
    <Section>
      <Text modifiers={[accessibilityIdentifier(`empty-${reason}`)]}>{MESSAGES[reason]}</Text>
      <Button
        label={primary.label}
        onPress={primary.onPress}
        modifiers={[accessibilityIdentifier('empty-primary')]}
      />
      <Button
        label="Open Calendar"
        onPress={openCalendarApp}
        modifiers={[accessibilityIdentifier('empty-open-calendar')]}
      />
    </Section>
  )
}
