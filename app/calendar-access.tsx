import { Button, Host, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityAddTraits,
  accessibilityIdentifier,
  buttonStyle,
  font,
  foregroundStyle,
  multilineTextAlignment,
  padding,
} from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'

import { requestCalendarAccess } from '@/data/calendar'
import {
  ACCESS_BODY,
  ACCESS_TITLE,
  PrivacyLink,
  ProminentButton,
} from '@/features/summary/CalendarAccess'
import { CalendarGlyph } from '@/ui/Card'

/**
 * The permission card as a sheet, opened by `Use my calendar` (spec/30-screens.md): v1's
 * centred card with its calendar glyph (capture 03), as a sheet sized to its content rather
 * than a page under a large title (INTENT.md D28). `Continue` asks iOS for full calendar
 * access; LifeTime only ever reads. `Not Now` sits under it, as in iOS's own permission
 * sheets.
 */
export default function CalendarAccess() {
  const onContinue = async () => {
    await requestCalendarAccess()
    router.back()
  }
  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <VStack
        spacing={16}
        modifiers={[padding({ horizontal: 24, top: 32, bottom: 8 })]}>
        <CalendarGlyph />
        <Text
          modifiers={[
            font({ textStyle: 'title2', weight: 'bold' }),
            multilineTextAlignment('center'),
            accessibilityAddTraits(['isHeader']),
            // On the title, not the stack: SwiftUI hands a stack's identifier down to the buttons.
            accessibilityIdentifier('calendar-access'),
          ]}>
          {ACCESS_TITLE}
        </Text>
        {ACCESS_BODY.map((paragraph) => (
          <Text
            key={paragraph}
            modifiers={[
              multilineTextAlignment('center'),
              foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
            ]}>
            {paragraph}
          </Text>
        ))}
        <PrivacyLink />
        <VStack spacing={4}>
          <ProminentButton label="Continue" onPress={onContinue} testID="access-continue" />
          <Button
            label="Not Now"
            onPress={() => router.back()}
            modifiers={[
              buttonStyle('borderless'),
              padding({ vertical: 8 }),
              accessibilityIdentifier('access-not-now'),
            ]}
          />
        </VStack>
      </VStack>
    </Host>
  )
}
