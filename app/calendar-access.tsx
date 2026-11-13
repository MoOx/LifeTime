import { VStack } from '@expo/ui/swift-ui'
import { router, Stack } from 'expo-router'

import { requestCalendarAccess } from '@/data/calendar'
import {
  ACCESS_BODY,
  ACCESS_TITLE,
  PrivacyLink,
  ProminentButton,
} from '@/features/summary/CalendarAccess'
import { Paragraph, ProseScreen } from '@/ui/Prose'

// The permission card as a sheet, opened by `Use my calendar` (spec/30-screens.md). Its
// `Continue` asks iOS for full calendar access; LifeTime only ever reads.
export default function CalendarAccess() {
  const onContinue = async () => {
    await requestCalendarAccess()
    router.back()
  }
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Not Now</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <ProseScreen title={ACCESS_TITLE} testID="calendar-access">
        {ACCESS_BODY.map((paragraph) => (
          <Paragraph key={paragraph}>{paragraph}</Paragraph>
        ))}
        <VStack spacing={12}>
          <PrivacyLink />
          <ProminentButton label="Continue" onPress={onContinue} testID="access-continue" />
        </VStack>
      </ProseScreen>
    </>
  )
}
