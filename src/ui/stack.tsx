/**
 * Header behaviour, shared by all three tabs.
 *
 * "Un header seulement si on scroll" is not something to build — it is what a UIKit large
 * title *is*. `headerLargeTitle` renders the title big and inline with the content, then
 * collapses it into the bar as you scroll, materialising a blurred background and a
 * hairline at exactly the right moment. On iOS 26 that background is Liquid Glass without
 * asking. So the screen titles are no longer drawn by this app at all — which also
 * settles "le titre n'est pas assez gros", because the size is now UIKit's.
 *
 * Two more details come with it:
 *
 *   • `headerBackButtonDisplayMode: 'minimal'` gives the chevron alone. Without it, iOS
 *     labels the back button with the *previous screen's* title — which is where the
 *     stray "(tabs)" came from.
 *   • Each tab owns its own stack, so pushing a detail screen keeps the tab bar in place
 *     instead of covering it.
 *
 * A screen using this must let the OS inset its content: `contentInsetAdjustmentBehavior
 * ="automatic"` on the scroll view. Without it the first row hides under the header.
 */

import type { NativeStackNavigationOptions } from 'expo-router'

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerLargeTitle: true,
  headerBackButtonDisplayMode: 'minimal',
  // Transparent + blur is what produces the on-scroll materialisation rather than a
  // permanently painted bar.
  headerTransparent: true,
  headerBlurEffect: 'systemChromeMaterial',
  headerShadowVisible: true,
  headerLargeTitleShadowVisible: false,
}

/** A pushed detail screen: same chrome, no large title. */
export const detailScreenOptions: NativeStackNavigationOptions = {
  ...stackScreenOptions,
  headerLargeTitle: false,
}
