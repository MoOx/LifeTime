import type { TextRole } from './theme/type'

export type TextTone = 'primary' | 'secondary' | 'tertiary'

export type AppTextProps = {
  role?: TextRole
  tone?: TextTone
  numberOfLines?: number
  children: React.ReactNode
}
