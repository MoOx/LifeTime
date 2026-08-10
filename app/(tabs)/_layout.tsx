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

import { Tabs } from 'expo-router/js-tabs'
import { NativeTabs } from 'expo-router/unstable-native-tabs'

// Part of the launch-crash bisection harness described in `app/_layout.tsx`.
// Level 2 swaps the native tab bar for the JavaScript one, which is the single
// component this project has and HideTheNotch — same phone, same CI, no crash —
// does not. Remove along with the rest of the harness.
const DEBUG_LEVEL = Number(process.env.EXPO_PUBLIC_DEBUG_LEVEL ?? 3)

const TABS = [
  { name: 'index', title: 'Summary', sf: 'chart.bar.xaxis', drawable: 'ic_summary' },
  { name: 'goals', title: 'Goals', sf: 'target', drawable: 'ic_goals' },
  { name: 'settings', title: 'Settings', sf: 'gearshape', drawable: 'ic_settings' },
] as const

export default function TabsLayout() {
  if (DEBUG_LEVEL === 2) {
    return (
      <Tabs screenOptions={{ headerShown: false }}>
        {TABS.map((tab) => (
          <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
        ))}
      </Tabs>
    )
  }

  return (
    <NativeTabs>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.title}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.sf} drawable={tab.drawable} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  )
}
