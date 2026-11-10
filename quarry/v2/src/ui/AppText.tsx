/**
 * Every piece of text in a React Native-laid-out screen.
 *
 * One component, two platform branches, and no size chosen by this app in either:
 *
 *   • **iOS** — Apple's specified size for the role, *plus* `dynamicTypeRamp` so
 *     `UIFontMetrics` scales it along that role's own curve. Both are needed on Fabric:
 *     the ramp alone only yields a multiplier and leaves the font at React Native's 14 pt
 *     default. See the note at the top of `theme/type.ts`.
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
  destructive: colors.destructive,
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
  const { ramp, ...ios } = spec.ios
  const typeStyle = Platform.select<TextStyle>({ ios, default: spec.android })

  return (
    <Text
      dynamicTypeRamp={ramp}
      numberOfLines={numberOfLines}
      style={[typeStyle, { color: TONE_COLOR[tone] }, tabular && styles.tabular, style]}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  tabular: { fontVariant: ['tabular-nums'] },
})
