/**
 * The root stack holds only what should cover the tabs: the two modal sheets.
 *
 * Everything else lives inside its tab's own stack (`app/(tabs)/(summary)/_layout.tsx`
 * and friends), so pushing an activity or a goal keeps the tab bar in place. Pushing from
 * here would have slid it away, which is the wrong signal — you have not left the section.
 */

import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { settingsStore, useSettings, useSettingsLoaded } from '@/data/settingsStore'
import { detailScreenOptions } from '@/ui/stack'

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash screen may already be hidden; nothing to do.
})

export default function RootLayout() {
  const loaded = useSettingsLoaded()
  const settings = useSettings()

  useEffect(() => {
    settingsStore.load().catch(() => settingsStore.load())
  }, [])

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {})
  }, [loaded])

  if (!loaded) return null

  return (
    <SafeAreaProvider>
      {/* `auto` follows the system appearance — v1 needed a whole barStyle mapping table
          plus `react-native-bars` to achieve this. */}
      <StatusBar
        style={
          settings.theme === 'auto' ? 'auto' : settings.theme === 'dark' ? 'light' : 'dark'
        }
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="filters"
          options={{
            ...detailScreenOptions,
            title: 'Customize report',
            presentation: 'formSheet',
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="categorize"
          options={{ ...detailScreenOptions, title: 'Sort activities' }}
        />
        <Stack.Screen
          name="reminders"
          options={{ ...detailScreenOptions, title: 'Reminders' }}
        />
        <Stack.Screen
          name="backup"
          options={{ ...detailScreenOptions, title: 'Backup & reset' }}
        />
        <Stack.Screen
          name="welcome"
          options={{ headerShown: false, presentation: 'formSheet', sheetGrabberVisible: true }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            ...detailScreenOptions,
            title: 'Privacy',
            presentation: 'formSheet',
            sheetGrabberVisible: true,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  )
}
