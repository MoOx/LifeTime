/**
 * "Nothing to show" is never the whole truth — there is always a reason, and the reason
 * is what the user can act on.
 *
 * v1 already got this right and it is the piece most worth keeping: four distinct states,
 * each naming its cause. What is added here is the action. Telling someone "every event
 * this week is in a calendar you deselected" and then making them go find that screen is
 * most of the way to useless.
 */

import { Link } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

import type { EmptyReason } from '@/domain/events'
import { AppText } from '@/ui/AppText'
import { Symbol, type SymbolName } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'

type Copy = {
  symbol: SymbolName
  title: string
  body: string
  action?: { label: string; href: string }
}

const COPY: Record<Exclude<EmptyReason, 'has-events'>, Copy> = {
  'no-events': {
    symbol: 'calendar',
    title: 'Nothing logged this week',
    body: 'LifeTime reads the events already in your calendars. Add a few — even after the fact — and they will show up here.',
  },
  'only-all-day': {
    symbol: 'clock',
    title: 'Only all-day events',
    body: 'All-day events have no duration, so there is no time to measure. Give them a start and an end and they will count.',
  },
  'only-skipped-calendars': {
    symbol: 'calendarBadgeExclamation',
    title: 'Every event is in a calendar you turned off',
    body: 'There is time logged this week, but all of it sits in calendars excluded from your reports.',
    action: { label: 'Choose calendars', href: '/filters' },
  },
  'only-skipped-activities': {
    symbol: 'hidden',
    title: 'Everything this week is hidden',
    body: 'The activities logged this week are all on your hidden list. They still count towards your goals.',
    action: { label: 'Manage hidden activities', href: '/filters' },
  },
}

export type EmptyStateProps = {
  reason: Exclude<EmptyReason, 'has-events'>
}

export function EmptyState({ reason }: EmptyStateProps) {
  const copy = COPY[reason]

  return (
    <View style={styles.container}>
      <Symbol name={copy.symbol} size={34} color={colors.tertiaryLabel} />
      <AppText role="cardTitle" style={styles.centered}>
        {copy.title}
      </AppText>
      <AppText role="secondary" tone="secondary" style={styles.centered}>
        {copy.body}
      </AppText>
      {copy.action !== undefined && (
        <Link href={copy.action.href} asChild>
          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
            <AppText role="button" tone="accent">
              {copy.action.label}
            </AppText>
          </Pressable>
        </Link>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.xxl,
    paddingVertical: space.section,
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
  actionPressed: {
    opacity: 0.6,
  },
})
