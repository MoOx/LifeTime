/**
 * Shown until calendar access is granted. v1 rendered this as a dimmed overlay on top of
 * the Summary; a dedicated state is simpler and says the same thing.
 *
 * The copy matters: it is the whole privacy promise of the app, and v1's App Store
 * submission was once rejected over the wording of this request (commit `eec1755`).
 */

import { Button } from '@expo/ui'
import { StyleSheet, View } from 'react-native'

import { AppText } from '@/ui/AppText'
import { Section } from '@/ui/Section'
import { colors } from '@/ui/theme/colors'

export type CalendarPermissionGateProps = {
  onRequest: () => void
}

export function CalendarPermissionGate({ onRequest }: CalendarPermissionGateProps) {
  return (
    <View style={styles.container}>
      <Section style={styles.copy}>
        <AppText role="cardTitle">Set up calendar access</AppText>
        <AppText role="body" tone="secondary">
          LifeTime reads the events already in your calendars to show you where your time
          goes. Nothing is uploaded — your data stays on this device.
        </AppText>
      </Section>
      <Section>
        {/* `label`, not a string child. `@expo/ui`'s Button renders its children raw
            into the native SwiftUI button — unlike `ListItem`, which wraps bare strings
            in a Text for you. A string here becomes a Fabric `RawText` node, which has
            no registered view class, and the app dies at launch:

              Text strings must be rendered within a <Text> component.
              ComponentView with componentHandle `…` (`RawText`) not found.

            Its `children` is typed `React.ReactNode`, so the compiler allows it. */}
        <Button onPress={onRequest} label="Continue" />
      </Section>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    padding: 24,
    backgroundColor: colors.background,
  },
  copy: {
    gap: 12,
  },
})
