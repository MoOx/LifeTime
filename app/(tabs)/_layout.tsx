import { NativeTabs } from 'expo-router/native-tabs'

// Native tab bar (Liquid Glass on iOS). Icons are SF Symbols close to v1's three tabs
// (docs/reference/v1/ios/light/30-settings-top.png); Android names come with the Android pass.
export default function TabsLayout() {
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
