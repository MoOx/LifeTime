import { Host } from '@expo/ui/swift-ui'
import type { ReactNode } from 'react'
import { ScrollView } from 'react-native'

import { useAccessibilityTextSize } from './textSize'

/**
 * A permission card's sheet (INTENT.md D28): sized to its content, with the grabber. At the
 * accessibility text sizes the card is taller than the screen, so the sheet opens full height
 * and its content scrolls; sized to its content, its buttons were cut off (slice 9).
 */
export const cardSheetOptions = (accessibilitySize: boolean) =>
  ({
    presentation: 'formSheet',
    headerShown: false,
    sheetAllowedDetents: accessibilitySize ? [1] : 'fitToContents',
    sheetGrabberVisible: true,
  }) as const

/** The content of a `cardSheetOptions` sheet: SwiftUI, scrolling when the text is large. */
export function CardSheet({ children }: { children: ReactNode }) {
  const accessibilitySize = useAccessibilityTextSize()
  const host = (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      {children}
    </Host>
  )
  return accessibilitySize ? <ScrollView>{host}</ScrollView> : host
}
