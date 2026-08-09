/**
 * Settings — built from native list rows.
 *
 * `Host` + `List` + `ListItem` render a SwiftUI inset-grouped list on iOS and a Material 3
 * list on Android, so row heights, separator insets, press states and typography all come
 * from the platform. v1 hand-built the equivalent from `View`s and computed separator
 * offsets like `Spacer.size(S) * 2 + NamedIcon.size`.
 */

import { Host, List, ListItem, Switch } from '@expo/ui'
import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { AppText } from '@/ui/AppText'
import { Section } from '@/ui/Section'
import { colors } from '@/ui/theme/colors'

export default function SettingsScreen() {
  const settings = useSettings()
  const update = useUpdateSettings()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Section style={styles.header}>
        <AppText role="screenTitle">Settings</AppText>
      </Section>

      <Host style={styles.list} useViewportSizeMeasurement>
        <List>
          <ListItem
            supportingText="Choose which calendars are counted"
            onPress={() => router.push('/filters')}>
            Customize report
          </ListItem>
          <ListItem
            supportingText="Mask the activities you chose to ignore"
            trailing={
              <Switch
                value={settings.hideSkippedActivities}
                onValueChange={(hideSkippedActivities) => update({ hideSkippedActivities })}
              />
            }>
            Hide skipped activities
          </ListItem>
          <ListItem
            supportingText="A nudge to check where your time went"
            trailing={
              <Switch
                value={settings.remindersEnabled}
                onValueChange={(remindersEnabled) => update({ remindersEnabled })}
              />
            }>
            Daily reminder
          </ListItem>
        </List>
      </Host>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  list: {
    flex: 1,
  },
})
