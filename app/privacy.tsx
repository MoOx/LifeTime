/**
 * The privacy statement.
 *
 * This is not boilerplate: v1's App Store submission was rejected over the wording of its
 * calendar request (commit `eec1755`), and the whole proposition of the app is that your
 * diary never leaves your phone. Saying that plainly, in one screen, is part of the
 * product.
 *
 * Every claim here is checkable against the code, which is why each one names where.
 */

import { ScrollView, StyleSheet, View } from 'react-native'

import { AppText } from '@/ui/AppText'
import { Symbol, type SymbolName } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'

const POINTS: { symbol: SymbolName; title: string; body: string }[] = [
  {
    symbol: 'calendar',
    title: 'Read-only',
    body: 'LifeTime asks for calendar access so it can add up the events already there. It never creates, edits or deletes anything.',
  },
  {
    symbol: 'privacy',
    title: 'Nothing leaves the device',
    body: 'There is no account, no server and no analytics. Your events are read, counted, and forgotten when you close the app.',
  },
  {
    symbol: 'hidden',
    title: 'You choose what counts',
    body: 'Turn off a calendar and it is excluded everywhere. Hide an activity and it stays out of your reports.',
  },
  {
    symbol: 'backup',
    title: 'Your settings are yours',
    body: 'Categories, rules and goals are stored on this device and can be exported as plain text at any time.',
  },
]

export default function PrivacyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AppText role="screenTitle">Privacy</AppText>
      <AppText role="body" tone="secondary">
        A calendar is one of the most revealing things on a phone. Here is exactly what
        this app does with yours.
      </AppText>

      {POINTS.map((point) => (
        <View key={point.title} style={styles.point}>
          <Symbol name={point.symbol} size={22} color={colors.accent} />
          <View style={styles.pointBody}>
            <AppText role="headline">{point.title}</AppText>
            <AppText role="secondary" tone="secondary">
              {point.body}
            </AppText>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  point: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  pointBody: {
    flex: 1,
    gap: 3,
  },
})
