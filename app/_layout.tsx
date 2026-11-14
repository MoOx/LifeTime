import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import { useColorScheme } from 'react-native'

import { useReminderSchedule } from '@/data/notifications'
import { SettingsProvider, useSettings } from '@/data/settings'
import { cardSheetOptions } from '@/ui/Sheet'
import { stackOptions } from '@/ui/stackOptions'
import { useAccessibilityTextSize } from '@/ui/textSize'

// Root stack: the tabs, and the sheets of docs/spec/30-screens.md ("Navigation map").
// Sheets are UIKit page sheets (`modal`), each with its own small native header.
//
// The theme follows the system: expo-router colours header titles with the navigation
// theme's `text`, so without it titles stay black in dark mode. Kept from the SDK 58
// template that spike 2 built (docs/spikes/04-expo-ui-lists.md, "Dark mode").
export default function RootLayout() {
  const scheme = useColorScheme()
  const accessibilitySize = useAccessibilityTextSize()
  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SettingsProvider>
        <ReminderSchedule />
        <Stack screenOptions={stackOptions}>
          {/* The redirect to /summary: no header, or "index" flashes at launch. */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Welcome cannot be swiped away (spec/30-screens.md, "Navigation map"). */}
          <Stack.Screen
            name="welcome"
            options={{ presentation: 'modal', headerShown: false, gestureEnabled: false }}
          />
          {/* Privacy and Help: the title is in the content, as in v1 (spec/30-screens.md). */}
          <Stack.Screen name="privacy" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="help" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="filters" options={{ presentation: 'modal', title: 'Filters' }} />
          {/* v1's permission card: a sheet sized to its content (INTENT.md D28). */}
          <Stack.Screen name="calendar-access" options={cardSheetOptions(accessibilitySize)} />
          {/* v1's reminders card, after the first goal: the same kind of sheet (D28). */}
          <Stack.Screen name="reminders-access" options={cardSheetOptions(accessibilitySize)} />
          {/* E2E builds only: seeds the simulator's calendar, then shows the Summary. */}
          <Stack.Screen name="e2e" options={{ headerShown: false }} />
          <Stack.Screen name="goal" options={{ presentation: 'modal', title: 'New Goal' }} />
          <Stack.Screen
            name="sorter"
            options={{ presentation: 'modal', title: 'Sort Activities' }}
          />
        </Stack>
      </SettingsProvider>
    </ThemeProvider>
  )
}

/** Keeps the reminders scheduled with iOS in step with the settings (spec/50-architecture.md). */
function ReminderSchedule() {
  useReminderSchedule(useSettings().settings)
  return null
}
