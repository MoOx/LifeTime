/**
 * Backup and reset — v1's "Danger Zone" (`docs/SCREENS.md` §10c), which v2 did not have at
 * all even though `domain/settings.ts` already knows how to parse a v1 export. The code to
 * read a backup existed; the screen that reaches it did not.
 *
 * Everything destructive is behind a confirm, and the wording is v1's, because it is
 * careful: it says what will be overwritten, what cannot be undone, and — crucially —
 * that the user's *calendars* are never touched. That last sentence is the one that lets
 * someone press the button.
 *
 * Two departures from v1, both deliberate:
 *
 *   • The demo-calendar rows are gone. v1's demo **wrote a real calendar to the device**
 *     and therefore needed a "Remove Demo Calendar" action to clean up after itself. v2
 *     generates the same events in memory (`domain/demo.ts`), so there is nothing to
 *     create and nothing to remove.
 *   • Import validates through `parseSettings`, which accepts a v1 export as well as a v2
 *     one — so a backup taken from the old app restores here.
 */

import * as Clipboard from 'expo-clipboard'
import { useCallback } from 'react'
import { Alert, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { settingsStore, useSettings } from '@/data/settingsStore'
import { invalidateEvents } from '@/data/useEvents'
import { DEFAULT_SETTINGS, parseSettings } from '@/domain/settings'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { colors } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'

export default function BackupScreen() {
  const insets = useSafeAreaInsets()
  const settings = useSettings()

  const exportBackup = useCallback(async () => {
    await Clipboard.setStringAsync(JSON.stringify(settings, null, 2))
    Alert.alert(
      'Export finished',
      'Your data is in the clipboard. Be sure to paste it somewhere safe.',
    )
  }, [settings])

  const runImport = useCallback(async () => {
    const clip = await Clipboard.getStringAsync()
    if (clip.trim().length === 0) {
      Alert.alert('No data in your clipboard')
      return
    }

    let parsed
    try {
      parsed = parseSettings(JSON.parse(clip))
    } catch {
      Alert.alert("That doesn't look like a LifeTime backup")
      return
    }

    // `parseSettings` never throws on a wrong *shape* — it falls back to defaults field by
    // field — so an empty result is the signal that the JSON was something else entirely.
    if (parsed.activities.length === 0 && parsed.goals.length === 0) {
      Alert.alert(
        "That doesn't look like a LifeTime backup",
        'It parsed as JSON, but there were no activities or goals in it.',
      )
      return
    }

    await settingsStore.update(parsed)
    invalidateEvents()
    Alert.alert('Import finished', 'Your categories, rules and goals have been restored.')
  }, [])

  const confirmImport = useCallback(() => {
    Alert.alert(
      'Import from clipboard?',
      'This is destructive: every setting will be overwritten by the contents of your clipboard.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', style: 'destructive', onPress: () => void runImport() },
      ],
    )
  }, [runImport])

  const confirmReset = useCallback(() => {
    Alert.alert(
      'Reset settings and erase all data?',
      'This is destructive and will wipe every setting. It cannot be undone unless you have an export.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void settingsStore.update(DEFAULT_SETTINGS)
            invalidateEvents()
          },
        },
      ],
    )
  }, [])

  const ruleCount = settings.activities.length
  const goalCount = settings.goals.length

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
      contentInsetAdjustmentBehavior="automatic">
      <ListHeader title="Backup" />
      <ListGroup separatorInset="text">
        <ListRow
          symbol="backup"
          title="Export backup"
          subtitle={`${ruleCount} ${ruleCount === 1 ? 'rule' : 'rules'}, ${goalCount} ${goalCount === 1 ? 'goal' : 'goals'}`}
          onPress={() => void exportBackup()}
        />
        <ListRow
          symbol="backup"
          title="Import backup"
          subtitle="From the clipboard"
          onPress={confirmImport}
        />
      </ListGroup>
      <ListFootnote>
        An export contains the things that are *not* in your calendars: your categories,
        your matching rules and your goals. It goes to the clipboard as plain text, so you
        can paste it anywhere you keep things. Import expects that text back.
      </ListFootnote>
      <ListFootnote>
        A backup from the old version of LifeTime works here too.
      </ListFootnote>

      <ListHeader title="Reset" />
      <ListGroup>
        <ListRow
          destructive
          title="Reset settings and erase all data"
          onPress={confirmReset}
        />
      </ListGroup>
      <ListFootnote>
        This deletes everything LifeTime has stored. Your calendars and their events are
        untouched — LifeTime only ever reads them.
      </ListFootnote>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
})
