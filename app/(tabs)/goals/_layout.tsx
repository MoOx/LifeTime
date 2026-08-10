import { Stack } from 'expo-router'

import { detailScreenOptions, stackScreenOptions } from '@/ui/stack'

export default function GoalsStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Goals' }} />
      <Stack.Screen name="[id]" options={detailScreenOptions} />
    </Stack>
  )
}
