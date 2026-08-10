import type { ReactNode } from 'react'
import type { StyleProp, TextStyle } from 'react-native'

import type { TextRole } from './theme/type'

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'inverse'
  | 'destructive'

export type AppTextProps = {
  role?: TextRole
  tone?: TextTone
  numberOfLines?: number
  /** Layout and alignment only — size and weight come from `role`. */
  style?: StyleProp<TextStyle>
  /** Digits that line up in a column: totals, axis labels, durations. */
  tabular?: boolean
  children: ReactNode
}
