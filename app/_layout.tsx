import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { settingsStore, useSettings, useSettingsLoaded } from '@/data/settingsStore'

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
      {/* `style="auto"` follows the system appearance — v1 needed a whole barStyle
          mapping table plus `react-native-bars` to achieve this. */}
      <StatusBar style={settings.theme === 'auto' ? 'auto' : settings.theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        {/* The native header carries platform typography for free — one of the reasons
            v1's hand-built `StickyHeader` is not ported. */}
        <Stack.Screen name="activity/[title]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="goal/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen
          name="privacy"
          options={{ headerShown: true, title: '', presentation: 'formSheet', sheetGrabberVisible: true }}
        />
        <Stack.Screen
          name="filters"
          options={{
            headerShown: true,
            title: 'Customize report',
            presentation: 'formSheet',
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="categorize"
          options={{ headerShown: true, title: 'Sort activities' }}
        />
      </Stack>
    </SafeAreaProvider>
  )
}
