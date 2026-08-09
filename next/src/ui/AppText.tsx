/**
 * Web / fallback implementation. iOS and Android resolve to `AppText.ios.tsx` and
 * `AppText.android.tsx`, which render real SwiftUI and Jetpack Compose text; this file is
 * the only place in the app that names a font size, and it never runs on a device.
 */

import { Text } from 'react-native'

import type { AppTextProps } from './AppText.types'
import { colors } from './theme/colors'
import { FALLBACK_SIZES } from './theme/type'

const TONE_COLOR = {
  primary: colors.label,
  secondary: colors.secondaryLabel,
  tertiary: colors.tertiaryLabel,
} as const

export function AppText({
  role = 'body',
  tone = 'primary',
  numberOfLines,
  children,
}: AppTextProps) {
  return (
    <Text numberOfLines={numberOfLines} style={[FALLBACK_SIZES[role], { color: TONE_COLOR[tone] }]}>
      {children}
    </Text>
  )
}
