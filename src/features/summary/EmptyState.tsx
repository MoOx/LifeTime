/**
 * "Nothing to show" is never the whole truth — there is always a reason, and the reason
 * is what the user can act on.
 *
 * Rebuilt against `docs/SCREENS.md` §3.1. Two things came back from v1 that the first
 * version had quietly dropped, and both change what the screen means:
 *
 *   • **It judges the last two weeks, not the visible one.** On a Monday morning the
 *     current week is empty for everybody. Telling someone with a full calendar that
 *     "LifeTime could not find any events" is the message for a brand-new user, shown to
 *     the wrong person, on the day they are most likely to open the app.
 *
 *   • **Every state offers two ways out.** One that fixes the app's settings and one that
 *     goes to the calendar, because those are the only two places the problem can be.
 *     A single button forces a guess about which one the user needs.
 *
 * The copy is v1's, verbatim, with one typo corrected — "relevent" → "relevant" — which is
 * recorded in the blueprint so the change stays a decision rather than a drift.
 */

import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

import { openCalendarApp } from '@/data/calendars'
import type { EmptyReason } from '@/domain/events'
import { AppText } from '@/ui/AppText'
import { Symbol, type SymbolName } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

/**
 * Appended to the first message only, as in v1 — it explains the *product*, which is only
 * worth saying to someone who has no data at all.
 */
const PITCH =
  'LifeTime can help you to understand how you use your time and rely on calendar events to learn how you use it. By saving events into your calendars, you will be able to visualize reports so you can take more informed decisions about how to use your valuable time.'

type ActionKind = 'getStarted' | 'customize' | 'toggleHidden' | 'openCalendar'

type Copy = {
  symbol: SymbolName
  title: string
  body: string
  actions: [ActionKind, ActionKind]
}

const COPY: Record<Exclude<EmptyReason, 'has-events'>, Copy> = {
  'no-events': {
    symbol: 'calendar',
    title: 'Nothing logged in the last two weeks',
    body: `LifeTime could not find any events on the last two weeks. ${PITCH}`,
    actions: ['getStarted', 'openCalendar'],
  },
  'only-all-day': {
    symbol: 'clock',
    title: 'Only all-day events',
    body: 'LifeTime could not find any relevant events on the last two weeks. All day events are not suitable for time tracking.',
    actions: ['getStarted', 'openCalendar'],
  },
  'only-skipped-calendars': {
    symbol: 'calendarBadgeExclamation',
    title: 'Every event is in a calendar you turned off',
    body: "LifeTime could not find any recent events that aren't part of skipped calendars.",
    actions: ['customize', 'openCalendar'],
  },
  'only-skipped-activities': {
    symbol: 'hidden',
    title: 'Everything recent is hidden',
    body: "LifeTime could not find any recent events that aren't part of skipped activities.",
    actions: ['toggleHidden', 'openCalendar'],
  },
}

const LABELS: Record<ActionKind, string> = {
  getStarted: 'Get started',
  customize: 'Customize report',
  toggleHidden: 'Reveal hidden activities',
  openCalendar: 'Open Calendar',
}

export type EmptyStateProps = {
  reason: Exclude<EmptyReason, 'has-events'>
  onToggleHidden: () => void
}

export function EmptyState({ reason, onToggleHidden }: EmptyStateProps) {
  const router = useRouter()
  const copy = COPY[reason]

  const run = (kind: ActionKind) => {
    switch (kind) {
      case 'getStarted':
        return router.push('/welcome')
      case 'customize':
        return router.push('/filters')
      case 'toggleHidden':
        return onToggleHidden()
      case 'openCalendar':
        return void openCalendarApp()
    }
  }

  const [primary, secondary] = copy.actions

  return (
    <View style={styles.container}>
      <Symbol name={copy.symbol} size={34} color={colors.tertiaryLabel} />
      <AppText role="cardTitle" style={styles.centered}>
        {copy.title}
      </AppText>
      <AppText role="secondary" tone="secondary" style={styles.centered}>
        {copy.body}
      </AppText>

      <Pressable
        accessibilityRole="button"
        onPress={() => run(primary)}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
        <AppText role="button" tone="inverse">
          {LABELS[primary]}
        </AppText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => run(secondary)}
        hitSlop={8}
        style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
        <AppText role="button" tone="accent">
          {LABELS[secondary]}
        </AppText>
      </Pressable>
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
  primary: {
    marginTop: space.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: space.md,
    borderRadius: layout.groupRadius,
    backgroundColor: colors.accent,
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  pressed: {
    opacity: 0.6,
  },
})
