/**
 * A bridge into the platform's own UI toolkit: SwiftUI on iOS, Jetpack Compose on
 * Android, a plain `View` on web.
 *
 * Use **one `Section` per screen block**, not one per text node — each host is a native
 * view, so wrapping every label in its own would be as wasteful as it sounds. Native
 * children (`AppText`, `List`, `Button`, `Slider`…) go inside; React Native layout stays
 * outside.
 */

import { Host } from '@expo/ui'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export type SectionProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  /** Size the host to its content instead of to the space React Native gives it. */
  matchContents?: boolean
}

export function Section({ children, style, matchContents = true }: SectionProps) {
  return (
    <Host matchContents={matchContents} style={style}>
      {children}
    </Host>
  )
}
