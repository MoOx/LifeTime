/**
 * The one place Liquid Glass is used, and the fallback for everywhere it does not exist.
 *
 * Glass is a material for things that *float over* content: a sheet, a button pinned to a
 * corner, the tab bar. Used as a general card background it is both wrong and expensive —
 * it needs something behind it to refract, and a card sitting on a flat page has nothing.
 * So this component exists precisely so that the handful of floating elements can ask for
 * glass, and everything else keeps a plain opaque surface.
 *
 * Off iOS 26, and on Android, it degrades to an opaque system surface rather than to a
 * translucent approximation — a fake frosted panel on Android looks like an iOS app that
 * has been ported badly, which is the exact impression this rewrite exists to avoid.
 */

import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import type { ReactNode } from 'react'
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native'

import { colors } from './theme/colors'

/** Evaluated once: it is a build/OS fact, not state. */
export const HAS_GLASS = isLiquidGlassAvailable()

export type SurfaceProps = {
  children: ReactNode
  /**
   * `clear` for something over a busy background, `regular` for a sheet over the app.
   */
  glass?: 'clear' | 'regular'
  style?: StyleProp<ViewStyle>
  onLayout?: ViewProps['onLayout']
}

export function FloatingSurface({
  children,
  glass = 'regular',
  style,
  onLayout,
}: SurfaceProps) {
  if (HAS_GLASS) {
    return (
      <GlassView glassEffectStyle={glass} style={style} onLayout={onLayout}>
        {children}
      </GlassView>
    )
  }
  return (
    <View style={[styles.opaque, style]} onLayout={onLayout}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  opaque: {
    backgroundColor: colors.surface,
  },
})
