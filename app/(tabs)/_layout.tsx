import { router } from 'expo-router'
import { NativeTabs } from 'expo-router/native-tabs'
import { useEffect } from 'react'

import { useSettings } from '@/data/settings'

// Native tab bar (Liquid Glass on iOS). Icons are SF Symbols close to v1's three tabs
// (docs/reference/v1/ios/light/30-settings-top.png); Android names come with the Android pass.
export default function TabsLayout() {
  const { settings } = useSettings()
  // First launch: Welcome, over the Summary on demo data (spec/30-screens.md). Settings are
  // in memory until slice 7, so for now it shows on every cold start.
  useEffect(() => {
    if (!settings.onboarded) router.push('/welcome')
    // Once, at launch: finishing Welcome must not push it again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="summary">
        <NativeTabs.Trigger.Label>Summary</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="goals">
        <NativeTabs.Trigger.Label>Goals</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="star.square" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
