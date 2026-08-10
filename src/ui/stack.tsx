/**
 * Header behaviour, shared by all three tabs.
 *
 * "Un header seulement si on scroll" is not something to build — it is what a UIKit large
 * title *is*. `headerLargeTitle` renders the title big and inline with the content, then
 * collapses it into the bar as you scroll, materialising a background and a hairline at
 * exactly the right moment. On iOS 26 that background is Liquid Glass without asking.
 *
 * **`headerTransparent` must not be combined with it.** That was the bug: a transparent
 * bar takes the header out of the layout so content can pass *behind* it — which is right
 * for a hero image and wrong for a large title, because the large title lives inside the
 * bar. The result was the title hidden under an opaque band, with only the small inline
 * label appearing once scrolled. A standard large-title bar already blurs on scroll; it
 * needs no help.
 *
 * Two more details:
 *
 *   • `headerBackButtonDisplayMode: 'minimal'` gives the chevron alone. Without it, iOS
 *     labels the back button with the *previous screen's* title — the stray "(tabs)".
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
  // No hairline under the *expanded* large title; the collapsed bar keeps its own.
  headerLargeTitleShadowVisible: false,
}

/** A pushed detail screen: same chrome, no large title. */
export const detailScreenOptions: NativeStackNavigationOptions = {
  ...stackScreenOptions,
  headerLargeTitle: false,
}
