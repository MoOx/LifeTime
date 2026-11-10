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
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppText } from '@/ui/AppText'
import { NativeBlock } from '@/ui/native'
import { FloatingSurface } from '@/ui/Surface'
import { Symbol } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

export type PermissionSheetProps = {
  onRequest: () => void
  /** True once the OS has refused for good and only Settings can undo it. */
  blocked: boolean
  onOpenSettings: () => void
  /**
   * Reports how tall the sheet ended up, so the screen behind can pad its scroll view by
   * exactly that much. Guessing the number left the last activity row trapped underneath.
   */
  onHeight?: (height: number) => void
}

export function PermissionSheet({
  onRequest,
  blocked,
  onOpenSettings,
  onHeight,
}: PermissionSheetProps) {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <FloatingSurface
        onLayout={(event) => onHeight?.(event.nativeEvent.layout.height)}
        style={[styles.sheet, { marginBottom: insets.bottom + space.md }]}>
        <View style={styles.badge}>
          <Symbol name="demo" size={15} color={colors.accent} />
          <AppText role="caption" tone="accent">
            SAMPLE DATA
          </AppText>
        </View>

        <AppText role="cardTitle">This is your week, with your calendars</AppText>
        {/* v1's wording, which is stronger than what stood here and was written for a
            submission that had already been rejected once over this exact request: it says
            what the app is before it says what it wants. */}
        <AppText role="secondary" tone="secondary">
          LifeTime is built as an on-device service. It reads the events already in your
          calendars and adds them up — it never writes to them, and nothing leaves this
          device, because there is no account and no server to send anything to.
        </AppText>

        {/* v1 put a "Learn more about LifeTime & Privacy…" link on this screen. Asking for
            a calendar without offering to explain first is the version of this dialog that
            gets refused. */}
        <Pressable
          onPress={() => router.push('/privacy')}
          hitSlop={8}
          accessibilityRole="link"
          style={({ pressed }) => pressed && styles.pressed}>
          <AppText role="footnote" tone="accent">
            Learn more about LifeTime &amp; privacy…
          </AppText>
        </Pressable>

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
    // Inset on every side so it reads as a floating panel rather than a drawer welded to
    // the screen edge — which is what glass is for.
    gap: space.sm,
    padding: space.xl,
    margin: space.lg,
    borderRadius: layout.sheetRadius,
    overflow: 'hidden',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  action: {
    marginTop: space.sm,
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.5,
  },
})
