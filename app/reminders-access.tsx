import { Button, Host, Image, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityAddTraits,
  accessibilityHidden,
  accessibilityIdentifier,
  background,
  buttonStyle,
  font,
  foregroundStyle,
  frame,
  multilineTextAlignment,
  padding,
  shapes,
} from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'

import { requestNotificationAccess } from '@/data/notifications'
import { ProminentButton } from '@/features/summary/CalendarAccess'
import { colors } from '@/ui/theme/colors'

/**
 * v1's reminders card (SCREENS.md §10e, `NotificationsPermissionsPopin.res` on `main`,
 * capture 07): the bell in its circle, "Set Up Reminders", v1's sentence, `Continue`. Shown
 * once the first goal exists, as v1 did (spec/30-screens.md, "Reminders prompt"), as a sheet
 * sized to its content like the calendar card (INTENT.md D28), with `Not Now`: the
 * permission is optional (D20). "quick recap of your progress goals" corrected.
 */
export default function RemindersAccess() {
  const onContinue = async () => {
    await requestNotificationAccess()
    router.back()
  }
  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <VStack spacing={16} modifiers={[padding({ horizontal: 24, top: 32, bottom: 8 })]}>
        <Image
          systemName="bell.badge.fill"
          size={44}
          color={colors.link}
          modifiers={[
            frame({ width: 88, height: 88 }),
            background(colors.selection, shapes.roundedRectangle({ cornerRadius: 44 })),
            accessibilityHidden(true),
          ]}
        />
        <Text
          modifiers={[
            font({ textStyle: 'title2', weight: 'bold' }),
            multilineTextAlignment('center'),
            accessibilityAddTraits(['isHeader']),
            accessibilityIdentifier('reminders-access'),
          ]}>
          Set Up Reminders
        </Text>
        <Text
          modifiers={[
            multilineTextAlignment('center'),
            foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
          ]}>
          Enabling notifications can help you to stay motivated by giving you a quick recap of your
          progress on your goals when necessary. Notifications are generated on device.
        </Text>
        <VStack spacing={4}>
          <ProminentButton label="Continue" onPress={onContinue} testID="reminders-continue" />
          <Button
            label="Not Now"
            onPress={() => router.back()}
            modifiers={[
              buttonStyle('borderless'),
              padding({ vertical: 8 }),
              accessibilityIdentifier('reminders-not-now'),
            ]}
          />
        </VStack>
      </VStack>
    </Host>
  )
}
