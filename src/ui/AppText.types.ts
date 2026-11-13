import type { ReactNode } from 'react'
import type { StyleProp, TextStyle } from 'react-native'

import type { TextRole } from './theme/type'

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'link'
  | 'inverse'
  | 'destructive'

export type AppTextProps = {
  role?: TextRole
  tone?: TextTone
  numberOfLines?: number
  /** Layout and alignment only: size and weight come from `role`. */
  style?: StyleProp<TextStyle>
  /** Digits that line up in a column: totals, axis labels, durations. */
  tabular?: boolean
  /** Caps Dynamic Type scaling, for text inside fixed geometry such as the chart. */
  maxFontSizeMultiplier?: number
  children: ReactNode
}
