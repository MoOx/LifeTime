/**
 * The progress ring.
 *
 * Two details separate a Fitness-looking ring from a pie chart with a hole, and both need
 * a real 2D canvas rather than SVG:
 *
 *   • **A sweep gradient.** The colour has to travel *around* the arc. SVG only offers
 *     linear and radial gradients, so an SVG ring either stays flat or fakes the sweep
 *     with a stack of segments. Skia has `SweepGradient` natively.
 *
 *   • **The overshoot shadow.** Past 100 % the arc laps itself, and Apple's rings drop a
 *     soft shadow at the crossing so you can see that it has. Without it a 140 % ring is
 *     indistinguishable from a 100 % one.
 *
 * Rounded caps and the recessed track are the easy part; they are what make the empty
 * state read as "not yet" rather than "broken", which is the whole point of showing an
 * empty ring on a Monday morning.
 *
 * `GoalRing.web.tsx` draws the same shape with SVG, because Skia in a web bundle needs a
 * CanvasKit WebAssembly module loaded first and throws without it.
 */

import {
  BlurMask,
  Canvas,
  Group,
  Path,
  Skia,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia'
import { useMemo } from 'react'

import type { GoalRingProps } from './GoalRing.types'
import { StyleSheet, View } from 'react-native'

/** Rings start at 12 o'clock and run clockwise, like every other ring the user has seen. */
const START_ANGLE = -90

export function GoalRing({
  fraction,
  size,
  thickness = Math.max(8, size * 0.11),
  colors,
  trackColor,
  children,
}: GoalRingProps) {
  const radius = (size - thickness) / 2
  const center = size / 2

  const { track, arc, lapped } = useMemo(() => {
    const box = {
      x: thickness / 2,
      y: thickness / 2,
      width: size - thickness,
      height: size - thickness,
    }

    const trackPath = Skia.Path.Make()
    trackPath.addArc(box, 0, 360)

    const clamped = Math.max(0, fraction)
    // The visible arc never exceeds a full turn; the lap beyond it is drawn separately so
    // it can carry the shadow that reveals the overlap.
    const firstTurn = Math.min(1, clamped) * 360
    const arcPath = Skia.Path.Make()
    if (firstTurn > 0) arcPath.addArc(box, START_ANGLE, firstTurn)

    const overshoot = Math.min(1, Math.max(0, clamped - 1)) * 360
    const lappedPath = Skia.Path.Make()
    if (overshoot > 0) lappedPath.addArc(box, START_ANGLE, overshoot)

    return {
      track: trackPath,
      arc: arcPath,
      lapped: overshoot > 0 ? lappedPath : undefined,
    }
  }, [fraction, size, thickness])

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Path
          path={track}
          style="stroke"
          strokeWidth={thickness}
          color={trackColor}
          strokeCap="round"
        />
        <Group>
          <Path path={arc} style="stroke" strokeWidth={thickness} strokeCap="round">
            <SweepGradient
              c={vec(center, center)}
              colors={[colors[0], colors[1], colors[0]]}
              start={0}
              end={360}
            />
          </Path>
        </Group>
        {lapped !== undefined && (
          <Group>
            {/* Drawn twice: a blurred copy for the shadow the lap casts on the turn
                below it, then the arc itself. */}
            <Path
              path={lapped}
              style="stroke"
              strokeWidth={thickness}
              strokeCap="round"
              color="rgba(0,0,0,0.35)">
              <BlurMask blur={thickness / 3} style="normal" />
            </Path>
            <Path path={lapped} style="stroke" strokeWidth={thickness} strokeCap="round">
              <SweepGradient
                c={vec(center, center)}
                colors={[colors[1], colors[0], colors[1]]}
                start={0}
                end={360}
              />
            </Path>
          </Group>
        )}
      </Canvas>
      <View style={[StyleSheet.absoluteFill, styles.label]} pointerEvents="none">
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
