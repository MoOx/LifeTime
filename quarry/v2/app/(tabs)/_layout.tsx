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
 * Icons come from each platform's own set: `sf` resolves an SF Symbol, `md` a Material
 * Symbol. The names are the ones in `src/ui/Symbol.tsx`, so a tab and the same concept
 * elsewhere in the app never drift apart. The `{ default, selected }` form gives iOS the
 * filled variant when a tab is active, which is what the platform does natively.
 */

import { NativeTabs } from 'expo-router/unstable-native-tabs'

import { SYMBOLS } from '@/ui/Symbol'

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(summary)">
        <NativeTabs.Trigger.Label>Summary</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={SYMBOLS.summary.ios} md={SYMBOLS.summary.android} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="goals">
        <NativeTabs.Trigger.Label>Goals</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={SYMBOLS.goals.ios} md={SYMBOLS.goals.android} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: SYMBOLS.settings.ios, selected: 'gearshape.fill' }}
          md={SYMBOLS.settings.android}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
