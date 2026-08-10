/**
 * The calendar permission request — over a working app, not instead of one.
 *
 * v1 asked first and showed the app afterwards: the Summary was dimmed and empty behind
 * a system dialog, so the very first thing a new user was asked to do was hand over their
 * calendar to something they had never seen work. That request was also the reason one
 * App Store submission was rejected (commit `eec1755`), so the wording matters as much as
 * the timing.
 *
 * Here the Summary behind is real — it is rendering `demoEvents`, the same code path,
 * the same chart — and this sheet floats over it on glass. You can read the whole promise
 * and see exactly what you get before deciding.
 *
 * The button uses `label`, not a string child: `@expo/ui`'s `Button` renders children raw
 * into the native SwiftUI button, and a bare string becomes a Fabric `RawText` node with
 * no registered view class — which killed the app at launch (commit `00f4ac5`).
 */

import { Button } from '@expo/ui'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppText } from '@/ui/AppText'
import { NativeBlock } from '@/ui/native'
import { FloatingSurface } from '@/ui/Surface'
import { Symbol } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'

export type PermissionSheetProps = {
  onRequest: () => void
  /** True once the OS has refused for good and only Settings can undo it. */
  blocked: boolean
  onOpenSettings: () => void
}

export function PermissionSheet({
  onRequest,
  blocked,
  onOpenSettings,
}: PermissionSheetProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <FloatingSurface style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.badge}>
          <Symbol name="demo" size={15} color={colors.accent} />
          <AppText role="caption" tone="accent">
            SAMPLE DATA
          </AppText>
        </View>

        <AppText role="cardTitle">This is your week, with your calendars</AppText>
        <AppText role="secondary" tone="secondary">
          LifeTime reads the events already in your calendars and adds them up. It never
          writes to them, and nothing leaves this device — there is no account and no
          server to send anything to.
        </AppText>

        <NativeBlock style={styles.action}>
          <Button
            onPress={blocked ? onOpenSettings : onRequest}
            label={blocked ? 'Open Settings' : 'Use my calendars'}
          />
        </NativeBlock>

        {blocked && (
          <AppText role="footnote" tone="tertiary">
            Calendar access was turned off for LifeTime. You can turn it back on in the
            system settings.
          </AppText>
        )}
      </FloatingSurface>
    </View>
  )
}

const styles = StyleSheet.create({
  anchor: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  sheet: {
    gap: 10,
    padding: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  action: {
    marginTop: 6,
    alignSelf: 'stretch',
  },
})
