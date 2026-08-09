/**
 * iOS: a real SwiftUI `Text`, styled with a Dynamic Type text style.
 *
 * `font({ textStyle })` maps to SwiftUI's `Font.TextStyle`, so the rendered size follows
 * the user's Dynamic Type setting — including the accessibility sizes — without this file
 * ever naming a point size. Tone maps to SwiftUI's hierarchical foreground styles, which
 * are correct in light mode, dark mode, and over Liquid Glass.
 *
 * Must be rendered inside a `<Section>` (an `@expo/ui` `Host`).
 */

import { Text } from '@expo/ui/swift-ui'
import { font, foregroundStyle, lineLimit } from '@expo/ui/swift-ui/modifiers'

import type { AppTextProps } from './AppText.types'
import { TYPE_SCALE } from './theme/type'

const HIERARCHY = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
} as const

export function AppText({
  role = 'body',
  tone = 'primary',
  numberOfLines,
  children,
}: AppTextProps) {
  const modifiers = [
    font({ textStyle: TYPE_SCALE[role].ios }),
    foregroundStyle({ type: 'hierarchical', style: HIERARCHY[tone] }),
    ...(numberOfLines === undefined ? [] : [lineLimit(numberOfLines)]),
  ]
  return <Text modifiers={modifiers}>{children}</Text>
}
