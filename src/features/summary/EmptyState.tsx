/**
 * The Summary's empty states: SCREENS.md §3.1, `NoEventBox.res` on `main`. The reason is
 * judged over the last two weeks by `explainEmptinessOverWeeks`; each reason has v1's
 * message and two buttons. "relevent" is corrected (spec/30-screens.md). `Get Started`
 * opens Help, as v2 decided and the spec keeps.
 *
 * Drawn as v1 drew it, a card under a coloured banner with a close button, in iOS 27's
 * Health style (INTENT.md D28): an icon, the bold title, the message, capsule buttons.
 */

import { router } from 'expo-router'
import { Alert } from 'react-native'

import type { EmptyReason } from '@/domain/events'
import { openCalendarApp } from '@/data/calendar'
import { NoticeCard } from '@/ui/Card'

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

/**
 * v1's close button did not close: it explained why the box stays (`NoEventBox.res:205-217`,
 * "foward" and "advices" corrected).
 */
const explain = () =>
  Alert.alert(
    "Let's stay motivated!",
    'LifeTime is here to help you move forward and can give you advice & motivate you to achieve your personal goals.\nTo stop seeing this message, try to fill your calendar with events or adjust settings to reveal some that are currently hidden.',
    [{ text: 'Got it', style: 'cancel' }],
  )

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
    <NoticeCard
      banner={{ label: 'No Events Available', onClose: explain, closeTestID: 'empty-about' }}
      icon="calendar.badge.exclamationmark"
      title="No Events"
      body={MESSAGES[reason]}
      primary={{ ...primary, testID: 'empty-primary' }}
      secondary={{ label: 'Open Calendar', onPress: openCalendarApp, testID: 'empty-open-calendar' }}
      testID={`empty-${reason}`}
    />
  )
}
