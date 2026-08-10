/**
 * Icons, from the platform's own set: SF Symbols on iOS, Material Symbols on Android.
 *
 * `expo-symbols` takes a `{ ios, android }` pair and renders each side natively, so an
 * icon inherits the weight, optical size and colour behaviour the OS gives its own —
 * including SF Symbol animations. v1 shipped three hand-drawn SVGs and used them on both
 * platforms.
 *
 * Names are declared once, in `SYMBOLS`, so a screen refers to a *meaning* ("the chart
 * tab", "a hidden activity") rather than to a glyph name that has to be right twice.
 */

import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols'
import type { ColorValue, StyleProp, ViewStyle } from 'react-native'

export type SymbolPair = { ios: SFSymbol; android: AndroidSymbol }

export const SYMBOLS = {
  summary: { ios: 'chart.bar.xaxis', android: 'bar_chart' },
  goals: { ios: 'target', android: 'target' },
  settings: { ios: 'gearshape', android: 'settings' },

  calendar: { ios: 'calendar', android: 'calendar_month' },
  calendarBadgeExclamation: {
    ios: 'calendar.badge.exclamationmark',
    android: 'event_busy',
  },
  category: { ios: 'tag', android: 'label' },
  rule: { ios: 'text.badge.checkmark', android: 'rule' },
  magicWand: { ios: 'wand.and.sparkles', android: 'auto_fix_high' },
  hidden: { ios: 'eye.slash', android: 'visibility_off' },
  reminder: { ios: 'bell', android: 'notifications' },
  appearance: { ios: 'circle.lefthalf.filled', android: 'contrast' },
  themeLight: { ios: 'sun.max', android: 'light_mode' },
  themeDark: { ios: 'moon', android: 'dark_mode' },
  backup: { ios: 'arrow.up.doc', android: 'backup' },
  help: { ios: 'questionmark.circle', android: 'help' },
  privacy: { ios: 'hand.raised', android: 'privacy_tip' },

  add: { ios: 'plus', android: 'add' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  checkmark: { ios: 'checkmark', android: 'check' },
  today: { ios: 'arrow.uturn.backward', android: 'undo' },
  remove: { ios: 'minus.circle.fill', android: 'do_not_disturb_on' },
  clock: { ios: 'clock', android: 'schedule' },
  demo: { ios: 'sparkles', android: 'auto_awesome' },
} as const satisfies Record<string, SymbolPair>

export type SymbolName = keyof typeof SYMBOLS

export type SymbolProps = {
  name: SymbolName
  size?: number
  color?: ColorValue
  /** Matches the surrounding text's weight. */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

export function Symbol({
  name,
  size = 20,
  color,
  weight = 'regular',
  style,
  accessibilityLabel,
}: SymbolProps) {
  return (
    <RawSymbol
      pair={SYMBOLS[name]}
      size={size}
      color={color}
      weight={weight}
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  )
}

/**
 * For symbols that come from data rather than from the catalogue — a category carries its
 * own `sf` / `material` names so that categories can become user-editable without this
 * file having to know about them.
 */
export function RawSymbol({
  pair,
  size = 20,
  color,
  weight = 'regular',
  style,
  accessibilityLabel,
}: Omit<SymbolProps, 'name'> & { pair: { ios: string; android: string } }) {
  return (
    <SymbolView
      name={{ ios: pair.ios as SFSymbol, android: pair.android as AndroidSymbol }}
      size={size}
      tintColor={color}
      weight={weight}
      style={[{ width: size, height: size }, style]}
      accessibilityLabel={accessibilityLabel}
      accessible={accessibilityLabel !== undefined}
    />
  )
}
