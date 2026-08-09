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
 * That table should not exist. Name the role; SwiftUI resolves it to a Dynamic Type text
 * style, Jetpack Compose to a Material 3 type-scale token, and both are correct on every
 * device, every OEM skin and every accessibility setting.
 */

/** SwiftUI `Font.TextStyle` values, all of which scale with Dynamic Type. */
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
  | 'screenTitle'
  | 'cardTitle'
  | 'sectionTitle'
  | 'body'
  | 'secondary'
  | 'caption'
  | 'button'

export const TYPE_SCALE: Record<
  TextRole,
  { ios: IOSTextStyle; android: AndroidTypographyStyle }
> = {
  screenTitle: { ios: 'largeTitle', android: 'headlineLarge' },
  cardTitle: { ios: 'title2', android: 'titleLarge' },
  sectionTitle: { ios: 'title3', android: 'titleMedium' },
  body: { ios: 'body', android: 'bodyLarge' },
  secondary: { ios: 'subheadline', android: 'bodyMedium' },
  caption: { ios: 'caption', android: 'labelSmall' },
  button: { ios: 'headline', android: 'labelLarge' },
}

/**
 * Web/fallback sizes only. Native platforms never reach these — they exist so the same
 * component tree can render in a browser or a snapshot test.
 */
export const FALLBACK_SIZES: Record<TextRole, { fontSize: number; fontWeight: '400' | '600' | '700' }> = {
  screenTitle: { fontSize: 32, fontWeight: '700' },
  cardTitle: { fontSize: 22, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  secondary: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  button: { fontSize: 16, fontWeight: '600' },
}
