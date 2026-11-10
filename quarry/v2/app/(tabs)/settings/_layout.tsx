import { Stack } from 'expo-router'

import { stackScreenOptions } from '@/ui/stack'

export default function SettingsStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
    </Stack>
  )
}
