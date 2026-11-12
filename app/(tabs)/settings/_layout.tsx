import { Stack } from 'expo-router'

import { stackOptions } from '@/ui/stackOptions'

// Headers per docs/spec/30-screens.md: large title on the tab root, small titles with the
// minimal back button on pushed screens.
export default function Layout() {
  return (
    <Stack
      screenOptions={{
        ...stackOptions,
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen name="index" options={{ title: 'Settings', headerLargeTitle: true }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="reset" options={{ title: 'Reset' }} />
    </Stack>
  )
}
