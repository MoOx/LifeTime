/**
 * Typography by role, never by size.
 *
 * This is the fix for "sur Android ça n'avait pas l'air natif".
 *
 * v1 hardcoded the iOS type ramp — `largeTitle` 34/41/0.37, `body` 17/22/−0.41, … — and
 * shipped it to Android, on top of a hand-maintained table mapping font weights to
 * `sans-serif-*` families per OEM, with a comment reading "it's a fucking total mess
 * depending on brands". Several components then set `allowFontScaling={false}` because
 * fixed sizes break when scaled.
 *
 * Here a role names an *intent*, and each platform resolves it its own way:
 *
 *   • **iOS** — the role maps to a `UIFontTextStyle` through React Native's
 *     `dynamicTypeRamp` prop. The native side then asks `UIFontMetrics` for the size
 *     (`RCTTextAttributes.mm`), so the text follows Dynamic Type including the
 *     accessibility sizes. No point size is written here at all.
 *
 *   • **Android** — the role maps to a Material 3 type-scale token. Those numbers *are*
 *     the M3 specification, not a house style: writing `bodyLarge = 16sp/24/0.5` is
 *     implementing Material, the same way `dynamicTypeRamp: 'body'` is implementing HIG.
 *     They are declared in sp and scale with the device font-size setting.
 *
 * The earlier attempt routed every label through `@expo/ui`'s SwiftUI/Compose `Text`,
 * which is more faithful still — but a native text node only lays out inside a native
 * `Host`, and hosting every label is what broke the layout (multiple children in a host
 * with no stack overlap, and text with no width constraint cannot wrap). Native text
 * stays for the list-shaped screens, where the whole block is native; everywhere React
 * Native does the layout, this table is the bridge.
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
  /** The one large title at the top of a screen. */
  | 'screenTitle'
  /** A large figure meant to be read at a glance: the week total. */
  | 'metric'
  /** The title of a card or a modal. */
  | 'cardTitle'
  /** A heading introducing a block inside a screen. */
  | 'sectionTitle'
  /** An emphasised row title. */
  | 'headline'
  /** Running text. */
  | 'body'
  /** Supporting text next to or under `body`. */
  | 'secondary'
  /** A note under a group, in the style of a settings footer. */
  | 'footnote'
  /** Axis labels, badges, the smallest readable text. */
  | 'caption'
  /** Text inside a control. */
  | 'button'

type AndroidType = {
  fontSize: number
  lineHeight: number
  fontWeight: '400' | '500' | '600' | '700'
  letterSpacing?: number
}

type RoleSpec = {
  /** iOS: the Dynamic Type ramp. Never a size. */
  ramp: DynamicTypeRamp
  /**
   * iOS weight. The ramp carries the size, not the weight — `RCTTextAttributes` reads
   * only `RCTBaseSizeForDynamicTypeRamp` — so emphasis has to be stated.
   */
  iosWeight: '400' | '500' | '600' | '700'
  /** Android: the Material 3 token, spelled out. */
  android: AndroidType
  /** The equivalent SwiftUI / Compose token, for genuinely native blocks. */
  native: { ios: IOSTextStyle; android: AndroidTypographyStyle }
}

export const TYPE_SCALE: Record<TextRole, RoleSpec> = {
  screenTitle: {
    ramp: 'largeTitle',
    iosWeight: '700',
    android: { fontSize: 32, lineHeight: 40, fontWeight: '400' },
    native: { ios: 'largeTitle', android: 'headlineLarge' },
  },
  metric: {
    ramp: 'title1',
    iosWeight: '700',
    android: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
    native: { ios: 'title', android: 'headlineMedium' },
  },
  cardTitle: {
    ramp: 'title2',
    iosWeight: '700',
    android: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
    native: { ios: 'title2', android: 'titleLarge' },
  },
  sectionTitle: {
    ramp: 'title3',
    iosWeight: '600',
    android: { fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: 0.15 },
    native: { ios: 'title3', android: 'titleMedium' },
  },
  headline: {
    ramp: 'headline',
    iosWeight: '600',
    android: { fontSize: 16, lineHeight: 24, fontWeight: '500', letterSpacing: 0.15 },
    native: { ios: 'headline', android: 'titleMedium' },
  },
  body: {
    ramp: 'body',
    iosWeight: '400',
    android: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0.5 },
    native: { ios: 'body', android: 'bodyLarge' },
  },
  secondary: {
    ramp: 'subheadline',
    iosWeight: '400',
    android: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0.25 },
    native: { ios: 'subheadline', android: 'bodyMedium' },
  },
  footnote: {
    ramp: 'footnote',
    iosWeight: '400',
    android: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0.4 },
    native: { ios: 'footnote', android: 'bodySmall' },
  },
  caption: {
    ramp: 'caption1',
    iosWeight: '400',
    android: { fontSize: 11, lineHeight: 16, fontWeight: '500', letterSpacing: 0.5 },
    native: { ios: 'caption', android: 'labelSmall' },
  },
  button: {
    ramp: 'headline',
    iosWeight: '600',
    android: { fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.1 },
    native: { ios: 'headline', android: 'labelLarge' },
  },
}

/**
 * Web/fallback only. Native platforms never reach these — they exist so the same
 * component tree can render in a browser or a snapshot test.
 */
export const FALLBACK_SIZES: Record<TextRole, AndroidType> = Object.fromEntries(
  Object.entries(TYPE_SCALE).map(([role, spec]) => [role, spec.android]),
) as Record<TextRole, AndroidType>
