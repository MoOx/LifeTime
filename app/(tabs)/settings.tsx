/**
 * Settings — native list rows all the way down.
 *
 * `Host` + `List` + `ListItem` render a SwiftUI inset-grouped list on iOS and a Material 3
 * list on Android, so row heights, separator insets, press states, section headers and
 * typography all come from the platform. v1 hand-built the equivalent from `View`s and
 * computed separator offsets like `Spacer.size(S) * 2 + NamedIcon.size`.
 */

import { Host, List, ListItem, Picker, Switch } from '@expo/ui'
import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import type { RingMode } from '@/domain/goals'
import type { ThemePreference } from '@/domain/settings'
import { colors } from '@/ui/theme/colors'

const THEMES: { label: string; value: ThemePreference }[] = [
  { label: 'Automatic', value: 'auto' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

const RING_MODES: { label: string; value: RingMode }[] = [
  { label: 'Whole period', value: 'period' },
  { label: 'Today’s pace', value: 'pace' },
]

export default function SettingsScreen() {
  const settings = useSettings()
  const update = useUpdateSettings()
  const router = useRouter()

  return (
    <View style={styles.screen}>
      <Host style={styles.list} useViewportSizeMeasurement>
        <List>
          <ListItem
            supportingText="Calendars, categories and matching rules"
            onPress={() => router.push('/filters')}>
            Customize report
          </ListItem>

          <ListItem
            supportingText="Everything from the last few weeks, biggest first"
            onPress={() => router.push('/categorize')}>
            Sort my activities
          </ListItem>

          <ListItem
            supportingText="Hidden activities stay out of your reports, but still count towards goals"
            trailing={
              <Switch
                value={settings.hideSkippedActivities}
                onValueChange={(hideSkippedActivities) => update({ hideSkippedActivities })}
              />
            }>
            Hide skipped activities
          </ListItem>

          <ListItem
            supportingText="How a goal ring fills: over the whole period, or against what today asks for"
            trailing={
              <Picker
                selectedValue={settings.ringMode}
                onValueChange={(value) => update({ ringMode: value as RingMode })}>
                {RING_MODES.map((mode) => (
                  <Picker.Item key={mode.value} label={mode.label} value={mode.value} />
                ))}
              </Picker>
            }>
            Goal rings
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

          <ListItem
            trailing={
              <Picker
                selectedValue={settings.theme}
                onValueChange={(value) => update({ theme: value as ThemePreference })}>
                {THEMES.map((theme) => (
                  <Picker.Item key={theme.value} label={theme.label} value={theme.value} />
                ))}
              </Picker>
            }>
            Appearance
          </ListItem>

          <ListItem
            supportingText="Your calendars are read on this device and never leave it"
            onPress={() => router.push('/privacy')}>
            Privacy
          </ListItem>
        </List>
      </Host>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
})
