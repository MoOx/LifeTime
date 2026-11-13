/**
 * Grouped lists drawn by the OS: SwiftUI's own `Form` and `Section` through `@expo/ui`
 * (MoOx, 2026-11-12, INTENT.md D27). Row heights, separators, insets, the pressed state,
 * section header and footer type, Dynamic Type and the current iOS look all come from
 * SwiftUI, so they follow the OS as it changes instead of copying one year's metrics.
 *
 * The rules that make it sit under the native large title are in
 * docs/spikes/04-expo-ui-lists.md.
 *
 * iOS only for now: Android comes with its own pass (D7) and `@expo/ui/jetpack-compose`.
 */

import {
  Button,
  Form,
  HStack,
  Host,
  Image,
  Section as SwiftSection,
  Spacer,
  Text,
} from '@expo/ui/swift-ui'
import {
  accessibilityHidden,
  accessibilityIdentifier,
  buttonStyle,
  disabled,
  font,
  hidden,
  foregroundStyle,
  monospacedDigit,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { router, type Href } from 'expo-router'
import type { ReactNode } from 'react'

/** A whole screen that is a grouped list. Its own scroll view drives the large title. */
export function FormScreen({ children, testID }: { children: ReactNode; testID?: string }) {
  return (
    <Host style={{ flex: 1 }}>
      <Form modifiers={testID ? [accessibilityIdentifier(testID)] : undefined}>{children}</Form>
    </Host>
  )
}

/**
 * A section. `title` is SwiftUI's own header; `action` adds a trailing button to it, as v1's
 * group headings had ("Show This Week", "Customize report": SCREENS.md §1), and as
 * Settings.app does. `header` replaces the header entirely.
 */
export function Section({
  title,
  action,
  header,
  footer,
  children,
}: {
  title?: string
  /**
   * `hidden` keeps the button in the tree but invisible: switching between a plain title and
   * a header with an action changes the section's structure, and SwiftUI then rebuilds what
   * it holds (the Summary's pager lost its position: docs/slices/2/README.md).
   */
  action?: { label: string; onPress?: () => void; testID?: string; hidden?: boolean }
  header?: ReactNode
  footer?: string
  children?: ReactNode
}) {
  const heading =
    header ??
    (action && title ? (
      <HStack>
        <Text>{title}</Text>
        <Spacer />
        <Button
          label={action.label}
          onPress={action.onPress}
          modifiers={[
            buttonStyle('borderless'),
            // Always the same modifiers, only their values change: a stable structure.
            hidden(action.hidden === true),
            accessibilityHidden(action.hidden === true),
            disabled(action.hidden === true || action.onPress === undefined),
            ...(action.testID ? [accessibilityIdentifier(action.testID)] : []),
          ]}
        />
      </HStack>
    ) : undefined)
  return (
    <SwiftSection
      title={heading ? undefined : title}
      header={heading}
      footer={footer ? <Text>{footer}</Text> : undefined}>
      {children}
    </SwiftSection>
  )
}

/**
 * A row: a title, an optional trailing value, and a chevron when it pushes a screen.
 * Navigation stays expo-router's (`router.push`), so the header is the native stack's.
 */
export function Row({
  title,
  value,
  href,
  onPress,
  testID,
}: {
  title: string
  value?: string
  href?: Href
  onPress?: () => void
  testID?: string
}) {
  const press = onPress ?? (href ? () => router.push(href) : undefined)
  const content = (
    <HStack>
      <Text>{title}</Text>
      <Spacer />
      {value ? (
        <Text
          modifiers={[
            foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
            // Durations line up in a column.
            monospacedDigit(),
          ]}>
          {value}
        </Text>
      ) : null}
      {href ? (
        <Image
          systemName="chevron.right"
          modifiers={[
            font({ textStyle: 'footnote', weight: 'semibold' }),
            foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
          ]}
        />
      ) : null}
    </HStack>
  )
  if (!press) return content
  return (
    // A Button tints its label with the accent colour; `.tint(.primary)` keeps a navigation
    // row in the label colours, as Settings.app draws them.
    <Button
      onPress={press}
      modifiers={[tint('primary'), ...(testID ? [accessibilityIdentifier(testID)] : [])]}>
      {content}
    </Button>
  )
}
