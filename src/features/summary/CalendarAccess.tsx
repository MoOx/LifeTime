/**
 * v1's calendar permission card (SCREENS.md §10d, `CalendarsPermissions.res`): the copy,
 * with "informations" corrected. Shown as a sheet from `Use my calendar`, and inline on the
 * Summary when access was refused, where `Open Settings` replaces `Continue`
 * (spec/20-sources.md, "Failures").
 */

import { Button, HStack, Spacer, Text } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  buttonStyle,
  controlSize,
  font,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'

import { colors } from '@/ui/theme/colors'

export const ACCESS_TITLE = 'Set Up Calendars Access'

export const ACCESS_BODY = [
  'LifeTime has been designed to protect your personal data and respect your privacy. It has been built as an on-device service that you can trust.',
  'Calendars are used as the primary source of information to follow your activities. LifeTime must have read access to them to be able to show reports and suggestions.',
]

export function PrivacyLink() {
  return (
    <Button
      label="Learn more about LifeTime & Privacy..."
      onPress={() => router.push('/privacy')}
      modifiers={[buttonStyle('borderless'), accessibilityIdentifier('access-privacy')]}
    />
  )
}

/** A full-width prominent button, as v1's blue `Continue`. */
export function ProminentButton({
  label,
  onPress,
  testID,
}: {
  label: string
  onPress: () => void
  testID: string
}) {
  return (
    <Button
      onPress={onPress}
      modifiers={[
        buttonStyle('borderedProminent'),
        controlSize('large'),
        tint(colors.accent),
        accessibilityIdentifier(testID),
      ]}>
      <HStack>
        <Spacer />
        <Text modifiers={[font({ textStyle: 'headline' })]}>{label}</Text>
        <Spacer />
      </HStack>
    </Button>
  )
}
