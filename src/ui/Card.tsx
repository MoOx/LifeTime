/**
 * Cards, as iOS 27's Health app draws them (INTENT.md D28, docs/reference/health-27.md).
 *
 * A card is a `Form` section holding a single row whose insets are removed, so it sits in a
 * screen whose native large title still collapses (docs/spikes/04-expo-ui-lists.md) and keeps
 * the section's rounded shape and background from the OS. Everything inside is SwiftUI
 * through `@expo/ui` (D27).
 */

import {
  Button,
  HStack,
  Image,
  Section as SwiftSection,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui'
import {
  accessibilityAddTraits,
  accessibilityHidden,
  accessibilityIdentifier,
  accessibilityLabel,
  background,
  buttonBorderShape,
  buttonStyle,
  font,
  foregroundStyle,
  frame,
  listRowInsets,
  multilineTextAlignment,
  padding,
  shapes,
  strokeBorder,
  textCase,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import type { SFSymbol } from 'sf-symbols-typescript'

import { colors } from '@/ui/theme/colors'

const INSET = 16

export type CardAction = { label: string; onPress: () => void; testID?: string }

/**
 * A notice: an empty state, a permission request, an invitation. Health's "Noise
 * Notifications" card when it has a `banner`, its "Test your hearing" card when it has not.
 */
export function NoticeCard({
  banner,
  icon,
  title,
  body,
  primary,
  secondary,
  testID,
}: {
  /** The coloured strip on top, with its label and an optional close button. */
  banner?: { label: string; onClose?: () => void; closeTestID?: string }
  icon: SFSymbol
  title: string
  body: string
  primary: CardAction
  secondary?: CardAction
  testID?: string
}) {
  return (
    <SwiftSection>
      <VStack
        alignment="leading"
        spacing={0}
        modifiers={[listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 })]}>
        {banner ? (
          <HStack
            spacing={6}
            modifiers={[padding({ horizontal: INSET, vertical: 10 }), background(colors.accent)]}>
            <Text
              modifiers={[
                font({ textStyle: 'footnote', weight: 'semibold' }),
                textCase('uppercase'),
                foregroundStyle('white'),
                accessibilityAddTraits(['isHeader']),
              ]}>
              {banner.label}
            </Text>
            <Spacer />
            {banner.onClose ? (
              <Button
                onPress={banner.onClose}
                modifiers={[
                  buttonStyle('plain'),
                  accessibilityLabel('About this message'),
                  ...(banner.closeTestID ? [accessibilityIdentifier(banner.closeTestID)] : []),
                ]}>
                <Image
                  systemName="xmark.circle.fill"
                  size={20}
                  modifiers={[foregroundStyle({ type: 'color', color: 'white' })]}
                />
              </Button>
            ) : null}
          </HStack>
        ) : null}
        <VStack
          alignment="leading"
          spacing={14}
          modifiers={[padding({ all: INSET })]}>
          <HStack alignment="top" spacing={12}>
            <Image
              systemName={icon}
              size={28}
              modifiers={[foregroundStyle(colors.accent), frame({ width: 34 })]}
            />
            <VStack alignment="leading" spacing={4}>
              {/*
                The card's identifier sits on its title: on a stack, SwiftUI hands it down to
                every element inside, and the buttons lost their own.
              */}
              <Text
                modifiers={[
                  font({ textStyle: 'headline' }),
                  ...(testID ? [accessibilityIdentifier(testID)] : []),
                ]}>
                {title}
              </Text>
              <Text
                modifiers={[
                  font({ textStyle: 'subheadline' }),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                {body}
              </Text>
            </VStack>
          </HStack>
          <CardButtons primary={primary} secondary={secondary} />
        </VStack>
      </VStack>
    </SwiftSection>
  )
}

/** Capsules, as Health's cards: the main action filled, the other one tinted. */
function CardButtons({ primary, secondary }: { primary: CardAction; secondary?: CardAction }) {
  const capsule = (action: CardAction, prominent: boolean) => (
    <Button
      label={action.label}
      onPress={action.onPress}
      modifiers={[
        buttonStyle(prominent ? 'borderedProminent' : 'bordered'),
        buttonBorderShape('capsule'),
        tint(colors.accent),
        font({ textStyle: 'subheadline', weight: 'semibold' }),
        ...(action.testID ? [accessibilityIdentifier(action.testID)] : []),
      ]}
    />
  )
  return (
    // Aligned with the text, past the icon, as Health's "More Details".
    <VStack alignment="leading" spacing={8} modifiers={[padding({ leading: 34 + 12 })]}>
      {capsule(primary, true)}
      {secondary ? capsule(secondary, false) : null}
    </VStack>
  )
}

/**
 * v1's calendar glyph (`IconCalendar`): today's weekday in red over the date, as the Calendar
 * app's icon. SwiftUI's version of the one Welcome draws in React Native.
 */
export function CalendarGlyph({ now = Date.now(), size = 64 }: { now?: number; size?: number }) {
  const date = new Date(now)
  return (
    <VStack
      spacing={0}
      modifiers={[
        frame({ width: size, height: size }),
        background(
          colors.surface,
          shapes.roundedRectangle({ cornerRadius: size * 0.22, roundedCornerStyle: 'continuous' }),
        ),
        strokeBorder({
          content: colors.separator,
          style: { lineWidth: 0.5 },
          shape: 'roundedRectangle',
          cornerRadius: size * 0.22,
        }),
        // Decoration: the title next to it says what the card is about.
        accessibilityHidden(true),
      ]}>
      <Text
        modifiers={[
          font({ size: size * 0.19, weight: 'semibold' }),
          foregroundStyle(colors.destructive),
        ]}>
        {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
      </Text>
      <Text
        modifiers={[
          font({ size: size * 0.46, weight: 'light' }),
          multilineTextAlignment('center'),
        ]}>
        {String(date.getDate())}
      </Text>
    </VStack>
  )
}
