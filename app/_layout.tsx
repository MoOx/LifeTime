import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { settingsStore, useSettingsLoaded } from '@/data/settingsStore'

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash screen may already be hidden; nothing to do.
})

/**
 * Temporary bisection harness for the launch crash, removable in one commit.
 *
 * The app dies in `RCTComponentViewFactory createComponentViewWithComponentHandle:` —
 * a Fabric component with no registered native class — on device, in Release, right
 * after the splash screen. It does *not* die in a simulator with the same Release
 * configuration, so the failing component has to be narrowed by elimination.
 *
 * Each level adds one layer of native components. Build with, say:
 *
 *   EXPO_PUBLIC_DEBUG_LEVEL=0 npm run ios:device:release
 *
 *   0  plain RN views only          — tests the React Native / Fabric baseline
 *   1  + SafeAreaProvider           — react-native-safe-area-context
 *   2  the real app, JS tabs        — expo-router Stack + @expo/ui, no NativeTabs
 *   3  the real app (default)       — + NativeTabs
 *
 * The first level that crashes names the culprit. Level 2 exists because
 * `unstable-native-tabs` is the one component in this tree that ships under an
 * "unstable" name, and it is the last thing HideTheNotch — which runs on the same
 * phone, from the same CI — does not have.
 */
const DEBUG_LEVEL = Number(process.env.EXPO_PUBLIC_DEBUG_LEVEL ?? 3)

function Marker({ level }: { level: number }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24 }}>{`debug level ${level} — it renders`}</Text>
    </View>
  )
}

export default function RootLayout() {
  const loaded = useSettingsLoaded()

  useEffect(() => {
    settingsStore.load().catch(() => settingsStore.load())
  }, [])

  useEffect(() => {
    if (loaded || DEBUG_LEVEL < 3) SplashScreen.hideAsync().catch(() => {})
  }, [loaded])

  // Level 0: nothing but React Native's own views. If this crashes, the problem is
  // below anything this project chose.
  if (DEBUG_LEVEL === 0) return <Marker level={0} />

  // Level 1: adds react-native-safe-area-context.
  if (DEBUG_LEVEL === 1) {
    return (
      <SafeAreaProvider>
        <Marker level={1} />
      </SafeAreaProvider>
    )
  }

  if (!loaded) return null

  return (
    <SafeAreaProvider>
      {/* `style="auto"` follows the system appearance — v1 needed a whole barStyle
          mapping table plus `react-native-bars` to achieve this. */}
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        {/* The native header carries platform typography for free — one of the reasons
            v1's hand-built `StickyHeader` is not ported. */}
        <Stack.Screen name="activity/[title]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen
          name="filters"
          options={{
            headerShown: true,
            title: 'Customize report',
            presentation: 'formSheet',
            sheetGrabberVisible: true,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  )
}
