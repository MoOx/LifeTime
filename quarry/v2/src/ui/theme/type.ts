/**
 * Typography by role, never by size — with one correction that only a device could
 * reveal.
 *
 * The first version of this file set `dynamicTypeRamp` and deliberately left `fontSize`
 * unset, on the reasoning that the native side falls back to the ramp's base size. That
 * is true on the **old architecture** (`RCTTextAttributes.mm`), and it is not true on
 * Fabric, which is what this app runs. In
 * `RCTAttributedTextUtils.mm`, the ramp only ever produces a *multiplier*:
 *
 *     CGFloat requestedSize = isnan(fontSize) ? RCTBaseSizeForDynamicTypeRamp(ramp) : fontSize;
 *     fontSizeMultiplier = [fontMetrics scaledValueForValue:requestedSize] / requestedSize;
 *
 * …while the font itself is built separately from `textAttributes.fontSize`. With no
 * `fontSize`, that is React Native's own 14 pt default, scaled by a ratio that is ~1.0 at
 * the default Dynamic Type setting. So every label in the app rendered at 14 pt — a
 * screen title included — which is exactly why it all looked smaller than the rest of iOS.
 *
 * The correct pairing is **both**: `fontSize` gives the base, `dynamicTypeRamp` makes it
 * scale the way that role scales. Those two are not redundant — `UIFontMetrics` grows a
 * caption and a large title by different factors at accessibility sizes, and only the
 * ramp knows which curve to use. The sizes below are Apple's published specification, the
 * same table React Native itself cites; writing them here is implementing HIG, not
 * inventing a house style. The same reasoning applies to the Material 3 values on
 * Android.
 */

/** Values accepted by React Native's `Text.dynamicTypeRamp` (iOS only). */
export type DynamicTypeRamp =
  | 'caption2'
  | 'caption1'
  | 'footnote'
  | 'subheadline'
  | 'callout'
  | 'body'
  | 'headline'
  | 'title3'
  | 'title2'
  | 'title1'
  | 'largeTitle'

/** SwiftUI `Font.TextStyle` values, for the blocks that really are native. */
export type IOSTextStyle =
  | 'largeTitle'
  | 'title'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'subheadline'
  | 'body'
  | 'callout'
  | 'footnote'
  | 'caption'
  | 'caption2'

/** Material 3 type-scale tokens, resolved from `MaterialTheme.typography`. */
export type AndroidTypographyStyle =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'

export type TextRole =
  /** The one large title at the top of a screen. Usually the native header's job. */
  | 'screenTitle'
  /** A large figure meant to be read at a glance: the week total. */
  | 'metric'
  /** The title of a card or a modal. */
  | 'cardTitle'
  /** A heading introducing a block inside a screen. */
  | 'sectionTitle'
  /** The small heading above a group of rows, in the style of a settings list. */
  | 'groupHeader'
  /** An emphasised row title. */
  | 'headline'
  /** Running text and row titles. */
  | 'body'
  /** A row title in a dense list — iOS uses `callout` here, not `body`. */
  | 'rowTitle'
  /** Supporting text next to or under `body`. */
  | 'secondary'
  /** A note under a group. */
  | 'footnote'
  /** Axis labels, badges, the smallest readable text. */
  | 'caption'
  /** Text inside a control, and inline text actions. */
  | 'button'

type FontWeight = '400' | '500' | '600' | '700'

type PlatformType = {
  fontSize: number
  lineHeight?: number
  fontWeight: FontWeight
  letterSpacing?: number
}

type RoleSpec = {
  /**
   * iOS. `fontSize` is Apple's specified size for the ramp at the default Dynamic Type
   * setting; `ramp` is what makes it move with the user's setting.
   */
  ios: PlatformType & { ramp: DynamicTypeRamp }
  /** Android: the Material 3 token, spelled out. */
  android: PlatformType
  /** The equivalent SwiftUI / Compose token, for genuinely native blocks. */
  native: { ios: IOSTextStyle; android: AndroidTypographyStyle }
}

export const TYPE_SCALE: Record<TextRole, RoleSpec> = {
  screenTitle: {
    ios: { ramp: 'largeTitle', fontSize: 34, fontWeight: '700' },
    android: { fontSize: 32, lineHeight: 40, fontWeight: '400' },
    native: { ios: 'largeTitle', android: 'headlineLarge' },
  },
  metric: {
    ios: { ramp: 'title1', fontSize: 28, fontWeight: '700' },
    android: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
    native: { ios: 'title', android: 'headlineMedium' },
  },
  cardTitle: {
    ios: { ramp: 'title2', fontSize: 22, fontWeight: '700' },
    android: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
    native: { ios: 'title2', android: 'titleLarge' },
  },
  sectionTitle: {
    ios: { ramp: 'title3', fontSize: 20, fontWeight: '600' },
    android: { fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: 0.15 },
    native: { ios: 'title3', android: 'titleMedium' },
  },
  // iOS group headers are footnote-sized and uppercased by the caller; Material 3 uses
  // `titleSmall` in the primary colour and does not uppercase.
  groupHeader: {
    ios: { ramp: 'footnote', fontSize: 13, fontWeight: '400' },
    android: { fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.1 },
    native: { ios: 'footnote', android: 'titleSmall' },
  },
  headline: {
    ios: { ramp: 'headline', fontSize: 17, fontWeight: '600' },
    android: { fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: 0.15 },
    native: { ios: 'headline', android: 'titleMedium' },
  },
  body: {
    ios: { ramp: 'body', fontSize: 17, fontWeight: '400' },
    android: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0.5 },
    native: { ios: 'body', android: 'bodyLarge' },
  },
  rowTitle: {
    ios: { ramp: 'callout', fontSize: 16, fontWeight: '400' },
    android: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0.5 },
    native: { ios: 'callout', android: 'bodyLarge' },
  },
  secondary: {
    ios: { ramp: 'subheadline', fontSize: 15, fontWeight: '400' },
    android: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0.25 },
    native: { ios: 'subheadline', android: 'bodyMedium' },
  },
  footnote: {
    ios: { ramp: 'footnote', fontSize: 13, fontWeight: '400' },
    android: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0.4 },
    native: { ios: 'footnote', android: 'bodySmall' },
  },
  caption: {
    ios: { ramp: 'caption1', fontSize: 12, fontWeight: '400' },
    android: { fontSize: 11, lineHeight: 16, fontWeight: '500', letterSpacing: 0.5 },
    native: { ios: 'caption', android: 'labelSmall' },
  },
  button: {
    ios: { ramp: 'body', fontSize: 17, fontWeight: '400' },
    android: { fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.1 },
    native: { ios: 'body', android: 'labelLarge' },
  },
}

/**
 * Web/fallback only. Native platforms never reach these — they exist so the same
 * component tree can render in a browser or a snapshot test.
 */
export const FALLBACK_SIZES: Record<TextRole, PlatformType> = Object.fromEntries(
  Object.entries(TYPE_SCALE).map(([role, spec]) => [role, spec.android]),
) as Record<TextRole, PlatformType>
