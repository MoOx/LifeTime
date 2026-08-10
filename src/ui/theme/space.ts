/**
 * Spacing.
 *
 * Unlike type and colour, **neither platform exposes its metrics to React Native**. There
 * is no `PlatformSpacing`, no equivalent of `dynamicTypeRamp` for padding. So this is the
 * one part of the design system the app has to state itself — and the honest thing is to
 * state it once, from each platform's published metrics, rather than sprinkling numbers
 * through components the way v1 did (`Spacer.size(S) *. 2. +. NamedIcon.size` appears
 * verbatim in three of its files).
 *
 * Where the numbers come from:
 *
 *   • **iOS.** UIKit's readable content margin is 16 pt at compact width, and an
 *     inset-grouped table view uses 16 pt horizontal padding, a 44 pt minimum row height,
 *     and separators inset to align with the text — past any leading icon, not past the
 *     screen edge. Vertical rhythm is a 4 pt grid.
 *   • **Android.** Material 3 lists use 16 dp horizontal padding, a 56 dp one-line row,
 *     72 dp with supporting text, and a 4 dp grid.
 *
 * The two agree closely enough on horizontal metrics to share them, and differ on row
 * height — which is why `ROW_MIN_HEIGHT` is the one value that branches.
 */

import { Platform } from 'react-native'

/** The 4 pt/dp grid both platforms are built on. */
export const space = {
  /** Between a label and the thing it labels. */
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  /** The screen margin, and a list's horizontal padding. */
  lg: 16,
  xl: 20,
  xxl: 24,
  /** Between two unrelated groups. */
  section: 32,
} as const

export const layout = {
  /** Horizontal padding for screen content and list rows. */
  screenMargin: space.lg,
  /** Vertical padding inside a list row. */
  rowPaddingVertical: space.md,
  /**
   * Minimum row height. 44 pt is Apple's minimum touch target; 56 dp is Material's
   * one-line list item. Rows grow past this when their content needs it.
   */
  rowMinHeight: Platform.select({ ios: 44, default: 56 }),
  /** Gap between a leading icon and the text that follows it. */
  iconGap: space.md,
  /** Leading icon box. 28 pt matches what v1 used and what Settings.app looks like. */
  iconSize: 28,
  /**
   * How far a separator is inset so it starts under the text rather than under the icon.
   * Derived, not typed in — the mistake v1 made was writing the arithmetic at each site.
   */
  get separatorInset() {
    return this.screenMargin + this.iconSize + this.iconGap
  },
  /** Corner radius for a grouped list or a card. */
  groupRadius: Platform.select({ ios: 12, default: 16 }),
  /** Corner radius for a floating sheet. */
  sheetRadius: Platform.select({ ios: 26, default: 28 }),
} as const
