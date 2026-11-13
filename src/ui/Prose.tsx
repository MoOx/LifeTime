/**
 * A screen of running text, drawn by SwiftUI (INTENT.md D27): Privacy and Help. The title
 * sits in the content, as in v1, under a small native header (spec/30-screens.md).
 * `Paragraph` takes Markdown, so links inside the text are tappable, as v1's were.
 */

import { HStack, Host, ScrollView, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  accessibilityAddTraits,
  font,
  multilineTextAlignment,
  padding,
} from '@expo/ui/swift-ui/modifiers'
import type { ReactNode } from 'react'

export function ProseScreen({
  title,
  centered = false,
  testID,
  children,
}: {
  title: string
  centered?: boolean
  testID?: string
  children: ReactNode
}) {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView modifiers={testID ? [accessibilityIdentifier(testID)] : undefined}>
        <VStack
          alignment="leading"
          spacing={16}
          modifiers={[padding({ horizontal: 20, top: 8, bottom: 32 })]}>
          {centered ? (
            <HStack>
              <Spacer />
              <Title centered>{title}</Title>
              <Spacer />
            </HStack>
          ) : (
            <Title>{title}</Title>
          )}
          {children}
        </VStack>
      </ScrollView>
    </Host>
  )
}

function Title({ children, centered = false }: { children: string; centered?: boolean }) {
  return (
    <Text
      modifiers={[
        font({ textStyle: 'largeTitle', weight: 'bold' }),
        multilineTextAlignment(centered ? 'center' : 'leading'),
        accessibilityAddTraits(['isHeader']),
      ]}>
      {children}
    </Text>
  )
}

export function Heading({ children }: { children: string }) {
  return (
    <Text
      modifiers={[
        font({ textStyle: 'title2', weight: 'bold' }),
        accessibilityAddTraits(['isHeader']),
        padding({ top: 8 }),
      ]}>
      {children}
    </Text>
  )
}

export function Subheading({ children }: { children: string }) {
  return (
    <Text
      modifiers={[
        font({ textStyle: 'title3', weight: 'semibold' }),
        accessibilityAddTraits(['isHeader']),
      ]}>
      {children}
    </Text>
  )
}

export function Paragraph({ children }: { children: string }) {
  return <Text markdownEnabled>{children}</Text>
}
