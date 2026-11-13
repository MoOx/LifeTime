import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router'
import { useColorScheme } from 'react-native'

import { SettingsProvider } from '@/data/settings'
import { stackOptions } from '@/ui/stackOptions'

// Root stack: the tabs, and the sheets of docs/spec/30-screens.md ("Navigation map").
// Sheets are UIKit page sheets (`modal`), each with its own small native header.
//
// The theme follows the system: expo-router colours header titles with the navigation
// theme's `text`, so without it titles stay black in dark mode. Kept from the SDK 58
// template that spike 2 built (docs/spikes/04-expo-ui-lists.md, "Dark mode").
export default function RootLayout() {
  const scheme = useColorScheme()
  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SettingsProvider>
        <Stack screenOptions={stackOptions}>
          {/* The redirect to /summary: no header, or "index" flashes at launch. */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="help" options={{ presentation: 'modal', title: 'Help' }} />
          <Stack.Screen name="goal" options={{ presentation: 'modal', title: 'New Goal' }} />
        </Stack>
      </SettingsProvider>
    </ThemeProvider>
  )
}
