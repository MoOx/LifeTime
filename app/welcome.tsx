import { Button, HStack, Host, Spacer, Text as SwiftText } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  buttonStyle,
  controlSize,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { router, useNavigation } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSettings } from '@/data/settings'
import { AppText } from '@/ui/AppText'
import { colors } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'

/**
 * Welcome: SCREENS.md §2, `Welcome.res` on `main`, capture 01. A sheet that cannot be
 * swiped away, shown over the Summary on first launch; `Continue` lands on the Summary on
 * demo data rather than on a permission prompt (spec/30-screens.md, "Different from v1").
 *
 * Drawn by React Native: its lettering and its two staged entrances are the brand, not a
 * control the OS has. `Continue` is SwiftUI's own prominent button (D27).
 */

type TransitionEvents = {
  addListener: (event: 'transitionEnd', listener: () => void) => () => void
}

/** `Welcome.res:34-79`: the pitch at 750 ms, the bottom block at 1250 ms, 1200 ms fades. */
const PITCH_DELAY = 750
const BOTTOM_DELAY = 1250
const FADE = 1200

export default function Welcome() {
  const { update } = useSettings()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  // `Welcome.res:81`: the icon and the gaps shrink on short windows.
  const tall = height > 650
  const iconSize = tall ? 76 : 52

  // The SwiftUI button mounts once the sheet has finished appearing. Added during the
  // presentation at launch, its hosting controller sometimes never appeared, and the button
  // was missing from the accessibility tree (docs/slices/3/README.md, "Lessons").
  const navigation = useNavigation()
  const [presented, setPresented] = useState(false)
  useEffect(
    // `transitionEnd` is a native-stack event whose type expo-router does not export.
    () =>
      (navigation as unknown as TransitionEvents).addListener('transitionEnd', () =>
        setPresented(true),
      ),
    [navigation],
  )

  const pitchScale = useRef(new Animated.Value(0.75)).current
  const pitchOpacity = useRef(new Animated.Value(0)).current
  const bottomY = useRef(new Animated.Value(200)).current
  const bottomOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    let cancelled = false
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return
      if (reduce) {
        // Reduce Motion: no movement, the content is simply there (40-design.md, "Motion").
        for (const value of [pitchScale, pitchOpacity, bottomOpacity]) value.setValue(1)
        bottomY.setValue(0)
        return
      }
      Animated.parallel([
        Animated.sequence([
          Animated.delay(PITCH_DELAY),
          Animated.parallel([
            Animated.spring(pitchScale, { toValue: 1, tension: 1, useNativeDriver: true }),
            Animated.timing(pitchOpacity, { toValue: 1, duration: FADE, useNativeDriver: true }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(BOTTOM_DELAY),
          Animated.parallel([
            Animated.spring(bottomY, { toValue: 0, useNativeDriver: true }),
            Animated.timing(bottomOpacity, { toValue: 1, duration: FADE, useNativeDriver: true }),
          ]),
        ]),
      ]).start()
    })
    return () => {
      cancelled = true
    }
  }, [pitchScale, pitchOpacity, bottomY, bottomOpacity])

  const onContinue = () => {
    update((settings) => ({ ...settings, onboarded: true }))
    router.back()
  }

  return (
    <View
      testID="welcome"
      style={[
        styles.screen,
        {
          paddingHorizontal: tall ? space.xl + space.xs : space.lg,
          paddingTop: insets.top + space.xl,
          paddingBottom: insets.bottom + space.lg,
        },
      ]}>
      <Animated.View
        style={[styles.pitch, { opacity: pitchOpacity, transform: [{ scale: pitchScale }] }]}>
        <Pressable onPress={onContinue} accessibilityRole="button">
          <Image
            source={require('../assets/icon.png')}
            accessibilityIgnoresInvertColors
            style={{
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 5,
              borderCurve: 'continuous',
            }}
          />
          <View style={{ height: tall ? space.md : space.xxs }} />
          {/* `Welcome.res:113-124`: v1's sizes and weights, shrunk to fit one line. */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            allowFontScaling={false}
            style={[styles.welcomeTo, { color: colors.label }]}>
            Welcome to
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            allowFontScaling={false}
            style={[styles.appName, { color: colors.accent }]}>
            LifeTime
          </Text>
          <View style={{ height: tall ? space.md : space.xxs }} />
          <AppText role="sectionTitle" style={styles.baseline}>
            Your personal coach, helping you to reach your goals and spend your valuable time on
            things you love.
          </AppText>
        </Pressable>
      </Animated.View>

      <Animated.View style={{ opacity: bottomOpacity, transform: [{ translateY: bottomY }] }}>
        <Pressable onPress={onContinue} style={styles.permissionRow}>
          <CalendarIcon />
          <AppText role="caption" tone="secondary" style={styles.permissionText}>
            LifeTime needs access to your calendar to show activity reports & suggestions. Your data
            stays on your device.
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => router.push('/privacy')}
          accessibilityRole="link"
          testID="welcome-privacy"
          style={styles.privacyLink}>
          <AppText role="footnote" tone="accent" style={styles.privacyText}>
            About LifeTime & Privacy...
          </AppText>
        </Pressable>
        {presented ? (
          <Host matchContents={{ vertical: true }}>
            <Button
              onPress={onContinue}
              modifiers={[
                buttonStyle('borderedProminent'),
                controlSize('large'),
                // The system's indigo, as the accent; the string 'indigo' is read as CSS's darker one.
                tint(colors.accent),
                accessibilityIdentifier('welcome-continue'),
              ]}>
              {/* Spacers fill the width; a large maxWidth frame put the button's accessibility
                frame off screen, and Maestro and VoiceOver lost it. */}
              <HStack>
                <Spacer />
                <SwiftText>Continue</SwiftText>
                <Spacer />
              </HStack>
            </Button>
          </Host>
        ) : (
          <View style={styles.buttonPlaceholder} />
        )}
      </Animated.View>
    </View>
  )
}

/** v1's calendar glyph (`IconCalendar`): today's weekday and date, as the Calendar icon. */
function CalendarIcon() {
  const now = new Date()
  return (
    <View style={styles.calendar} accessibilityElementsHidden importantForAccessibility="no">
      <Text allowFontScaling={false} style={styles.calendarDay}>
        {now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
      </Text>
      <Text allowFontScaling={false} style={[styles.calendarDate, { color: colors.label }]}>
        {now.getDate()}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'space-between', backgroundColor: colors.surface },
  pitch: { flex: 1, justifyContent: 'center' },
  welcomeTo: { fontSize: 58, lineHeight: 60, fontWeight: '100' },
  appName: { fontSize: 68, lineHeight: 70, fontWeight: '800' },
  baseline: { fontWeight: '400' },
  permissionRow: { flexDirection: 'row', alignItems: 'flex-start', columnGap: space.sm },
  permissionText: { flex: 1 },
  privacyLink: { paddingVertical: space.sm, alignItems: 'center' },
  privacyText: { fontWeight: '600', textAlign: 'center' },
  /** A large prominent button's height, so nothing moves when it mounts. */
  buttonPlaceholder: { height: 50 },
  calendar: {
    width: 48,
    height: 48,
    marginTop: 2,
    borderRadius: 10,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDay: { fontSize: 9, fontWeight: '600', color: '#FF3B30' },
  calendarDate: { fontSize: 22, fontWeight: '300', marginTop: -2 },
})
