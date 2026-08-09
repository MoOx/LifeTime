/**
 * The whole tab bar.
 *
 * On iOS 26 this renders a real `UITabBarController` with Liquid Glass, including the
 * scroll-edge transparency and the minimize-on-scroll behaviour; on iOS 18 and earlier,
 * the classic translucent bar; on Android, a Material 3 `NavigationBar` with the
 * long-press destination tooltip. Scroll-to-top and pop-to-root come for free.
 *
 * v1 built this by hand with `@react-navigation/bottom-tabs`, three custom SVG icons and
 * a manually themed `tabBarStyle` — and got none of those behaviours.
 *
 * Icons follow the platform: SF Symbols on iOS, Material Symbols on Android.
 */

import { NativeTabs } from 'expo-router/unstable-native-tabs'

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Summary</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.xaxis" drawable="ic_summary" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="goals">
        <NativeTabs.Trigger.Label>Goals</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="target" drawable="ic_goals" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" drawable="ic_settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
