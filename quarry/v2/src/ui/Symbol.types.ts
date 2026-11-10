/**
 * The symbol catalogue and its types.
 *
 * Names are declared once so a screen refers to a *meaning* ("the chart tab", "a hidden
 * activity") rather than to a glyph name that has to be right twice. `SymbolPair` types
 * both sides against the real catalogues — `SFSymbol` and `AndroidSymbol` are literal
 * unions — so a misspelling is a compile error rather than an icon that silently renders
 * as empty space.
 *
 * Kept separate from `Symbol.tsx` so a module can import the names without pulling in the
 * native view.
 */

import type { AndroidSymbol, SFSymbol } from 'expo-symbols'
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
