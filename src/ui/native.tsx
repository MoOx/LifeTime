/**
 * The two ways this app hosts real platform UI — and the rules that make them behave.
 *
 * `@expo/ui`'s `Host` is a bridge into SwiftUI / Jetpack Compose, not a `View`. Two
 * properties of that bridge caused every layout bug in the first attempt:
 *
 *   1. **A host does not stack its children.** SwiftUI's default for a multi-child view
 *      builder is a `ZStack`, so two labels in a bare `Host` render *on top of each
 *      other*. Every host below therefore has exactly one child, and that child is a
 *      `Column`.
 *
 *   2. **A host with no width proposal cannot wrap text.** `matchContents` sizes the host
 *      to its content in *both* axes, so the content is asked to lay out in unbounded
 *      width and a paragraph becomes one long line. `matchContents={{ vertical: true }}`
 *      keeps React Native's width and measures only the height, which is what a block
 *      inside a scrolling screen wants.
 *
 * Anything that is not list-shaped is plain React Native. That is the hybrid split.
 */

import { Column, Host, List } from '@expo/ui'
import type { ReactNode } from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'

export type NativeBlockProps = {
  children: ReactNode
  /** Vertical gap between children, in points/dp. */
  spacing?: number
  alignment?: 'start' | 'center' | 'end'
  style?: StyleProp<ViewStyle>
}

/**
 * A native block sitting inside a React Native screen: a group of controls, a picker, a
 * row of buttons. Takes its width from React Native and reports its own height back.
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

export type NativeListProps = {
  children: ReactNode
  onRefresh?: () => Promise<void>
  style?: StyleProp<ViewStyle>
}

/**
 * A full-screen native list — `UICollectionView` with the inset-grouped appearance on
 * iOS, `LazyColumn` on Android. Row height, separator insets, press states, section
 * footers and the scroll-edge effects under the tab bar all come from the OS.
 *
 * `useViewportSizeMeasurement` is required: a virtualised list has no intrinsic height,
 * so without it the host proposes zero and nothing appears.
 */
export function NativeList({ children, onRefresh, style }: NativeListProps) {
  return (
    <Host style={[styles.fill, style]} useViewportSizeMeasurement>
      <List onRefresh={onRefresh}>{children}</List>
    </Host>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
