/**
 * The progress ring.
 *
 * v1's `shareable/components/ActivityRings.js` is the reference, and it is a better piece
 * of work than the first rebuild here. It has no canvas at all — it builds the ring from
 * two half-circles, a `MaskedView` with a PNG mask to fake an angular gradient, and
 * Reanimated rotations on the UI thread. Three behaviours in it are what make it read as
 * an Apple ring rather than a donut chart, and all three were missing:
 *
 *   • **It animates in.** 1500 ms on a bezier of `(0.32, 0.12, -0.1, 1)` — the negative
 *     third control point gives a slight overshoot at the end (`ActivityRings.js:394`).
 *     A ring that simply appears at 76 % reads as a static graphic; one that sweeps to
 *     76 % reads as a measurement.
 *
 *   • **The end cap casts a shadow, and it strengthens as the arc closes.** Opacity
 *     interpolates 0.5 → 1 between 80 % and 100 % of a turn (`ActivityRings.js:283-289`),
 *     so the depth cue only arrives when the stroke is about to overlap its own start —
 *     which is exactly when you need to see which end is on top.
 *
 *   • **The start cap disappears past a full turn** (`ActivityRings.js:265`), because
 *     once the arc has lapped itself the start is underneath and drawing it is wrong.
 *
 * Skia gets there more directly than the half-circle trick did: a trimmed arc with round
 * caps, a real sweep gradient instead of a mask image, and a blurred circle for the cap
 * shadow. What is kept is v1's *behaviour*, which is the part that was thought about.
 *
 * `GoalRing.web.tsx` draws the same shape with SVG, because Skia in a web bundle needs a
 * CanvasKit WebAssembly module loaded first and throws without it.
 */

import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia'
import { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import type { GoalRingProps } from './GoalRing.types'

/** Rings start at 12 o'clock and run clockwise, like every other ring the user has seen. */
const START_ANGLE = -90

/**
 * v1 used `EasingNode.bezier(0.32, 0.12, -0.1, 1)` (`ActivityRings.js:394`), whose third
 * control point is negative. Reanimated 4 rejects that outright —
 * `Bezier.js:82` throws `[Reanimated] Bezier x values must be in [0, 1] range.` while the
 * module is being evaluated, so importing this file at all would kill the app.
 *
 * The web preview could not have caught it either: on web the SVG implementation is
 * loaded instead, and a platform file is never evaluated on the platform it is not for.
 *
 * A negative x makes the curve non-monotonic, which is not really an easing at all; what
 * v1 was reaching for is an ease-out that overshoots slightly. `back` says that legally
 * and says it on purpose.
 */
const EASING = Easing.out(Easing.back(1.1))
const DURATION = 1500

export function GoalRing({
  fraction,
  size,
  thickness = Math.max(8, size * 0.11),
  colors,
  trackColor,
  children,
}: GoalRingProps) {
  const radius = (size - thickness) / 2
  const centre = size / 2

  const circle = useMemo(() => {
    const box = {
      x: thickness / 2,
      y: thickness / 2,
      width: size - thickness,
      height: size - thickness,
    }
    const path = Skia.Path.Make()
    path.addArc(box, START_ANGLE, 360)
    return path
  }, [size, thickness])

  /** 0 → `fraction`, swept once on mount and re-swept whenever the value changes. */
  const swept = useSharedValue(0)

  useEffect(() => {
    swept.value = withTiming(Math.max(0, fraction), {
      duration: DURATION,
      easing: EASING,
    })
  }, [fraction, swept])

  const firstTurn = useDerivedValue(() => Math.min(1, swept.value))
  const overshoot = useDerivedValue(() => Math.min(1, Math.max(0, swept.value - 1)))

  /**
   * Where the leading cap currently is, so its shadow can follow it. Two scalars rather
   * than a point: building an object inside a worklet is one more thing that can go wrong
   * on a platform this cannot be tested on from here.
   */
  const capAngle = useDerivedValue(
    () => ((START_ANGLE + Math.min(1, swept.value) * 360) * Math.PI) / 180,
  )
  const capX = useDerivedValue(() => centre + radius * Math.cos(capAngle.value))
  const capY = useDerivedValue(() => centre + radius * Math.sin(capAngle.value))

  /**
   * v1's rule: half-strength until the arc is nearly closed, full strength as it laps.
   * Before that there is nothing underneath for the cap to cast onto.
   */
  const capShadowOpacity = useDerivedValue(() => {
    const turn = Math.min(1, swept.value)
    if (turn <= 0) return 0
    if (turn < 0.8) return 0.5
    return 0.5 + ((turn - 0.8) / 0.2) * 0.5
  })

  const startCapOpacity = useDerivedValue(() => (swept.value < 1 ? 1 : 0))

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Path
          path={circle}
          style="stroke"
          strokeWidth={thickness}
          color={trackColor}
          strokeCap="round"
        />

        {/* The cap shadow sits under the arc, so the arc laps over it cleanly. */}
        <Group opacity={capShadowOpacity}>
          <Circle cx={capX} cy={capY} r={thickness / 2} color="rgba(0,0,0,0.45)">
            <BlurMask blur={thickness / 3} style="normal" />
          </Circle>
        </Group>

        {/* The start cap, hidden once the arc has lapped it. */}
        <Group opacity={startCapOpacity}>
          <Circle
            cx={centre}
            cy={centre - radius}
            r={thickness / 2}
            color={colors[0]}
          />
        </Group>

        <Path
          path={circle}
          style="stroke"
          strokeWidth={thickness}
          strokeCap="round"
          start={0}
          end={firstTurn}>
          <SweepGradient
            c={vec(centre, centre)}
            colors={[colors[0], colors[1], colors[0]]}
            start={0}
            end={360}
          />
        </Path>

        {/* Past a full turn, the lap is drawn over the top of everything. */}
        <Path
          path={circle}
          style="stroke"
          strokeWidth={thickness}
          strokeCap="round"
          start={0}
          end={overshoot}>
          <SweepGradient
            c={vec(centre, centre)}
            colors={[colors[1], colors[0], colors[1]]}
            start={0}
            end={360}
          />
        </Path>
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
