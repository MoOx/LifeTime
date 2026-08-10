/**
 * Settings.
 *
 * v1's structure, which was good: groups, each introduced by a heading, each row carrying
 * a tinted icon on the left and a chevron or a control on the right, and a footnote under
 * any group whose behaviour needs a sentence — "Auto theme will switch between Light &
 * Dark automatically to match your system settings."
 *
 * That footnote is the part worth defending. Half the rows in a settings screen do
 * something the label cannot fully explain, and a screen without anywhere to say so
 * either grows unwieldy labels or leaves the user guessing. `@expo/ui`'s `List` has no
 * slot for it, which is the main reason these lists are React Native.
 */

import { Host, Switch } from '@expo/ui'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Linking, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { openCalendarApp } from '@/data/calendars'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import type { RingMode } from '@/domain/goals'
import type { ThemePreference } from '@/domain/settings'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { Symbol, type SymbolName } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'

const THEMES: { label: string; value: ThemePreference; symbol: SymbolName }[] = [
  { label: 'Light', value: 'light', symbol: 'themeLight' },
  { label: 'Dark', value: 'dark', symbol: 'themeDark' },
  { label: 'Automatic', value: 'auto', symbol: 'appearance' },
]

const RING_MODES: { label: string; value: RingMode; description: string }[] = [
  {
    label: 'Fill over the period',
    value: 'period',
    description: 'Empty at the start of the week, full when you reach the target.',
  },
  {
    label: 'Match today’s pace',
    value: 'pace',
    description: 'Full whenever you are where you meant to be by tonight.',
  },
]

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const update = useUpdateSettings()
  const router = useRouter()

  const openSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() => {})
  }, [])

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
      contentInsetAdjustmentBehavior="automatic">
      <ListHeader title="Your report" />
      <ListGroup separatorInset="text">
        <ListRow
          symbol="calendar"
          title="Customize report"
          subtitle="Calendars, categories and matching rules"
          chevron
          onPress={() => router.push('/filters')}
        />
        <ListRow
          symbol="magicWand"
          title="Sort my activities"
          subtitle={`Everything from the last ${settings.categorisationWeeks} weeks, biggest first`}
          chevron
          onPress={() => router.push('/categorize')}
        />
        <ListRow
          symbol="hidden"
          title="Hide skipped activities"
          accessory={
            <Host matchContents>
              <Switch
                value={settings.hideSkippedActivities}
                onValueChange={(hideSkippedActivities) => update({ hideSkippedActivities })}
              />
            </Host>
          }
        />
      </ListGroup>
      <ListFootnote>
        Hidden activities stay out of your charts and activity list. They still count
        towards your goals, as long as they have a category.
      </ListFootnote>

      <ListHeader title="Goal rings" />
      <ListGroup>
        {RING_MODES.map((mode) => (
          <ListRow
            key={mode.value}
            title={mode.label}
            subtitle={mode.description}
            accessory={settings.ringMode === mode.value ? <Checkmark /> : undefined}
            onPress={() => update({ ringMode: mode.value })}
          />
        ))}
      </ListGroup>

      <ListHeader title="Appearance" />
      <ListGroup separatorInset="text">
        {THEMES.map((theme) => (
          <ListRow
            key={theme.value}
            symbol={theme.symbol}
            title={theme.label}
            accessory={settings.theme === theme.value ? <Checkmark /> : undefined}
            onPress={() => update({ theme: theme.value })}
          />
        ))}
      </ListGroup>
      <ListFootnote>
        Automatic follows your system setting. On Android 12 and later, LifeTime also takes
        its accent colour from your wallpaper.
      </ListFootnote>

      <ListHeader title="Reminders" />
      <ListGroup separatorInset="text">
        <ListRow
          symbol="reminder"
          title="Daily reminder"
          accessory={
            <Host matchContents>
              <Switch
                value={settings.remindersEnabled}
                onValueChange={(remindersEnabled) => update({ remindersEnabled })}
              />
            </Host>
          }
        />
      </ListGroup>
      <ListFootnote>
        A nudge to fill in what you did, so a week is written down while you still
        remember it.
      </ListFootnote>

      <ListHeader title="More" />
      <ListGroup separatorInset="text">
        <ListRow
          symbol="privacy"
          title="Privacy"
          subtitle="What LifeTime reads, and what it never does"
          chevron
          onPress={() => router.push('/privacy')}
        />
        <ListRow
          symbol="calendar"
          title="Open Calendar"
          chevron
          onPress={() => openCalendarApp()}
        />
        <ListRow
          symbol="settings"
          title="System settings for LifeTime"
          chevron
          onPress={openSystemSettings}
        />
      </ListGroup>
    </ScrollView>
  )
}

function Checkmark() {
  return <Symbol name="checkmark" size={17} color={colors.accent} />
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
})
