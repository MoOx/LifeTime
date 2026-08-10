/**
 * Colors come from the operating system, not from this file.
 *
 * v1 hardcoded `"#fff"`, `"#111"`, `"rgba(255,255,255,0.98)"` and the iOS system palette —
 * and shipped that same iOS palette to Android. Going through `PlatformColor` means:
 *
 *   • light/dark is resolved by the OS, so the two-stylesheet machinery disappears;
 *   • on Android 12+, `?attr/colorPrimary` resolves to the user's wallpaper-derived
 *     Material You color, so the app adopts the phone's personality — something a
 *     hardcoded indigo can never do;
 *   • Liquid Glass surfaces stay legible, because system colors adapt to what is behind
 *     them and a fixed hex does not.
 */

import { Platform, PlatformColor, type ColorValue } from 'react-native'

const platformColor = (ios: string, android: string, web: string): ColorValue => {
  if (Platform.OS === 'ios') return PlatformColor(ios)
  if (Platform.OS === 'android') return PlatformColor(android)
  return web
}

export const colors = {
  /** Primary text. */
  label: platformColor('label', '?attr/colorOnSurface', '#111111'),
  /** Supporting text. */
  secondaryLabel: platformColor(
    'secondaryLabel',
    '?attr/colorOnSurfaceVariant',
    '#6B6B70',
  ),
  /** De-emphasised text: footnotes, axis labels. */
  tertiaryLabel: platformColor('tertiaryLabel', '?android:attr/textColorTertiary', '#8E8E93'),
  /** Screen background. */
  background: platformColor(
    'systemGroupedBackground',
    '?attr/colorSurface',
    '#F2F2F7',
  ),
  /** Card / list-row background sitting on top of `background`. */
  surface: platformColor(
    'secondarySystemGroupedBackground',
    '?attr/colorSurfaceContainer',
    '#FFFFFF',
  ),
  separator: platformColor('separator', '?attr/colorOutlineVariant', '#C6C6C8'),
  /** Accent — Material You dynamic color on Android 12+. */
  accent: platformColor('systemIndigo', '?attr/colorPrimary', '#3023AE'),
  /** Text and symbols drawn *on* `accent`. */
  onAccent: platformColor('systemBackground', '?attr/colorOnPrimary', '#FFFFFF'),
  link: platformColor('link', '?attr/colorPrimary', '#007AFF'),
  destructive: platformColor('systemRed', '?attr/colorError', '#FF3B30'),
  /**
   * Chart grid lines and the empty part of a bar or ring. Deliberately a *fill* rather
   * than a separator: fills are meant to sit behind content and stay legible on glass.
   */
  fill: platformColor('quaternarySystemFill', '?attr/colorSurfaceVariant', '#E5E5EA'),
  /** A pressed / selected row background. */
  selection: platformColor('tertiarySystemFill', '?attr/colorSecondaryContainer', '#E9E9EB'),
} as const

/**
 * Category colors are brand/semantic values, not chrome, so they stay app-defined — but
 * unlike v1 they are declared once with an explicit dark variant instead of being
 * borrowed from the iOS palette constants.
 */
export const CATEGORY_PALETTE = {
  indigo: { light: '#5856D6', dark: '#7D7AFF' },
  green: { light: '#34C759', dark: '#30D158' },
  pink: { light: '#FF2D55', dark: '#FF375F' },
  blue: { light: '#007AFF', dark: '#0A84FF' },
  orange: { light: '#FF9500', dark: '#FF9F0A' },
  teal: { light: '#30B0C7', dark: '#40C8E0' },
  purple: { light: '#AF52DE', dark: '#BF5AF2' },
  yellow: { light: '#FFCC00', dark: '#FFD60A' },
  gray: { light: '#8E8E93', dark: '#98989D' },
} as const

export type PaletteName = keyof typeof CATEGORY_PALETTE

export const categoryColor = (name: PaletteName, scheme: 'light' | 'dark'): string =>
  CATEGORY_PALETTE[name][scheme]

/** Status colors for goal rings, mapped from `GoalStatus`. */
export const STATUS_PALETTE = {
  achieved: { light: '#34C759', dark: '#30D158' },
  onTrack: { light: '#30B0C7', dark: '#40C8E0' },
  behind: { light: '#FF9500', dark: '#FF9F0A' },
  missed: { light: '#FF3B30', dark: '#FF453A' },
} as const
