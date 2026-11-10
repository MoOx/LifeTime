/**
 * Welcome — the first thing anyone sees, and the screen v1 put real care into.
 *
 * Rebuilt against `docs/SCREENS.md` §2. The copy is v1's, verbatim, and so is the
 * choreography: the pitch arrives at 750 ms with a spring from 0.75, the bottom block at
 * 1250 ms sliding up from 200 pt, each fading in over 1200 ms
 * (`Welcome.res:34-79`). That staging is the difference between a screen that opens and a
 * screen that *greets* you, and it costs nothing.
 *
 * The whole pitch block is tappable, not just the button (`Welcome.res:96`) — someone who
 * has read the sentence and wants to move on should not have to aim.
 *
 * Reachable again from Settings, exactly as in v1, where a "Welcome Screen" row re-opened
 * it on demand (`SettingsView.res:96-102`).
 */

import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { settingsStore } from '@/data/settingsStore'
import { AppText } from '@/ui/AppText'
import { Symbol } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

/** `Welcome.res:81` — drives the icon size and the two vertical gaps. */
const TALL_WINDOW = 650

export default function WelcomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const isTall = height > TALL_WINDOW

  const pitchOpacity = useRef(new Animated.Value(0)).current
  const pitchScale = useRef(new Animated.Value(0.75)).current
  const bottomOpacity = useRef(new Animated.Value(0)).current
  const bottomTranslate = useRef(new Animated.Value(200)).current

  useEffect(() => {
    Animated.parallel(
      [
        Animated.spring(pitchScale, { toValue: 1, delay: 750, useNativeDriver: true }),
        Animated.timing(pitchOpacity, {
          toValue: 1,
          duration: 1200,
          delay: 750,
          useNativeDriver: true,
        }),
        Animated.spring(bottomTranslate, {
          toValue: 0,
          delay: 1250,
          useNativeDriver: true,
        }),
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 1200,
          delay: 1250,
          useNativeDriver: true,
        }),
      ],
      { stopTogether: false },
    ).start()
  }, [pitchScale, pitchOpacity, bottomTranslate, bottomOpacity])

  const done = () => {
    settingsStore.update({ onboarded: true }).catch(() => {})
    router.back()
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
      ]}>
      <Animated.View
        style={[
          styles.pitch,
          { opacity: pitchOpacity, transform: [{ scale: pitchScale }] },
        ]}>
        <Pressable onPress={done} accessibilityRole="button">
          <Image
            source={require('../assets/icon.png')}
            style={[styles.icon, isTall ? styles.iconTall : styles.iconShort]}
          />
          <View style={{ height: isTall ? space.md : space.xxs }} />
          <AppText role="screenTitle" style={styles.welcome}>
            Welcome to
          </AppText>
          <AppText role="screenTitle" tone="accent" style={styles.appName}>
            LifeTime
          </AppText>
          <View style={{ height: isTall ? space.md : space.xxs }} />
          <AppText role="body">
            Your personal coach, helping you to reach your goals and spend your valuable
            time on things you love.
          </AppText>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          styles.bottom,
          { opacity: bottomOpacity, transform: [{ translateY: bottomTranslate }] },
        ]}>
        <Pressable onPress={done} style={styles.permissionRow} accessibilityRole="button">
          <Symbol name="calendar" size={40} color={colors.accent} />
          <AppText role="footnote" tone="secondary" style={styles.permissionText}>
            LifeTime needs access to your calendar to show activity reports & suggestions.
            Your data stay on your device.
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => router.push('/privacy')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.privacy, pressed && styles.pressed]}>
          <AppText role="button" tone="accent" style={styles.centered}>
            About LifeTime &amp; Privacy…
          </AppText>
        </Pressable>

        <Pressable
          onPress={done}
          accessibilityRole="button"
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}>
          <AppText role="button" tone="inverse">
            Continue
          </AppText>
        </Pressable>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    // The pitch block does the centring on its own (it is `flexGrow: 1`), as in v1.
    // Centring here as well pushed the two blocks apart with a hole between them.
    flexGrow: 1,
    paddingHorizontal: space.xxl,
  },
  pitch: {
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },
  icon: {
    alignSelf: 'flex-start',
  },
  iconTall: {
    width: 76,
    height: 76,
    borderRadius: 76 / 5,
  },
  iconShort: {
    width: 52,
    height: 52,
    borderRadius: 52 / 5,
  },
  // v1 set 58/68 pt here by hand. The role carries the size now; what is kept is the
  // *relationship* — the app's name heavier and larger than the greeting above it.
  welcome: {
    fontWeight: '200',
  },
  appName: {
    fontWeight: '800',
  },
  bottom: {
    gap: space.md,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  permissionText: {
    flexShrink: 1,
  },
  privacy: {
    paddingVertical: space.sm,
  },
  centered: {
    textAlign: 'center',
  },
  continue: {
    alignItems: 'center',
    paddingVertical: space.md,
    borderRadius: layout.groupRadius,
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.6,
  },
})
