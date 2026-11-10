/**
 * Hosting real platform UI inside a React Native screen.
 *
 * `@expo/ui`'s `Host` is a bridge into SwiftUI / Jetpack Compose, not a `View`, and two
 * properties of that bridge caused every layout bug in the first build:
 *
 *   1. **A host does not stack its children.** SwiftUI's default for a multi-child view
 *      builder is a `ZStack`, so two labels in a bare `Host` render *on top of each
 *      other*. Every host below has exactly one child, and that child is a `Column`.
 *
 *   2. **A host with no width proposal cannot wrap text.** `matchContents` sizes the host
 *      to its content in *both* axes, so the content lays out in unbounded width and a
 *      paragraph becomes one long line. `matchContents={{ vertical: true }}` keeps React
 *      Native's width and measures only the height.
 *
 * What is hosted, and what is not, has since settled. Native controls — `Switch`,
 * `Picker`, `TextInput`, `Button` — are worth bridging: they carry platform behaviour
 * (menus, haptics, accessibility, the iOS 26 glass treatment) that would be a poor
 * imitation in JavaScript, and each is a single leaf so neither pitfall above applies.
 *
 * Native *lists* are not, and `src/ui/List.tsx` explains why: `@expo/ui`'s `List` has no
 * section headers, no header actions, no footnotes, and no way to put a progress bar in a
 * row — which is the entire grammar these screens are built from.
 */

import { Column, Host } from '@expo/ui'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export type NativeBlockProps = {
  children: ReactNode
  /** Vertical gap between children, in points/dp. */
  spacing?: number
  alignment?: 'start' | 'center' | 'end'
  style?: StyleProp<ViewStyle>
}

/**
 * A native block sitting inside a React Native screen: a group of controls, a row of
 * buttons. Takes its width from React Native and reports its own height back.
 *
 * For a single control in a list row, `<Host matchContents>` around it is enough — no
 * column is needed for one child, and the row already constrains the width.
 */
export function NativeBlock({
  children,
  spacing = 8,
  alignment = 'start',
  style,
}: NativeBlockProps) {
  return (
    <Host matchContents={{ vertical: true }} style={style}>
      <Column spacing={spacing} alignment={alignment}>
        {children}
      </Column>
    </Host>
  )
}
