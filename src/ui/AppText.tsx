/**
 * Every piece of text in a React Native-laid-out screen.
 *
 * One component, two platform branches, and not a single point size in either:
 *
 *   • **iOS** — `dynamicTypeRamp` hands the role to `UIFontMetrics`, which returns the
 *     user's current Dynamic Type size for that text style. `fontSize` is deliberately
 *     left unset: `RCTTextAttributes.mm` only falls back to the ramp's base size when
 *     `fontSize` is `NaN`, so setting it would silently take the platform back out of
 *     the loop.
 *
 *   • **Android** — the Material 3 token's sp values, which scale with the device
 *     font-size setting because `allowFontScaling` stays on. `fontFamily` is never set,
 *     so the OEM's system font is used — the thing v1's per-brand `sans-serif-*` table
 *     was trying and failing to do.
 *
 * Colours go through `PlatformColor`, so light/dark is the OS's problem and Android 12+
 * picks up the wallpaper-derived Material You palette.
 */

import { Platform, StyleSheet, Text, type TextStyle } from 'react-native'

import type { AppTextProps, TextTone } from './AppText.types'
import { colors } from './theme/colors'
import { TYPE_SCALE } from './theme/type'

const TONE_COLOR: Record<TextTone, TextStyle['color']> = {
  primary: colors.label,
  secondary: colors.secondaryLabel,
  tertiary: colors.tertiaryLabel,
  accent: colors.accent,
  inverse: colors.onAccent,
}

export function AppText({
  role = 'body',
  tone = 'primary',
  numberOfLines,
  style,
  tabular = false,
  children,
}: AppTextProps) {
  const spec = TYPE_SCALE[role]

  const typeStyle = Platform.select<TextStyle>({
    // Size comes from the ramp; only the weight has to be stated.
    ios: { fontWeight: spec.iosWeight },
    default: spec.android,
  })

  return (
    <Text
      dynamicTypeRamp={spec.ramp}
      numberOfLines={numberOfLines}
      style={[typeStyle, { color: TONE_COLOR[tone] }, tabular && styles.tabular, style]}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  tabular: { fontVariant: ['tabular-nums'] },
})
