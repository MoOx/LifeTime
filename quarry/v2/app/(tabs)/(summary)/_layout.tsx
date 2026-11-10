import { Stack } from 'expo-router'

import { detailScreenOptions, stackScreenOptions } from '@/ui/stack'

export default function SummaryStack() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Your LifeTime' }} />
      <Stack.Screen name="activity/[title]" options={detailScreenOptions} />
    </Stack>
  )
}
