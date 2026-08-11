/**
 * The ring, on web.
 *
 * Skia is a native canvas; in a web bundle it needs its CanvasKit WebAssembly module
 * loaded before anything can be drawn, and without that every `Skia.Path.Make()` throws
 * `Cannot read properties of undefined (reading 'PathBuilder')` — which is precisely what
 * the preview reported the first time a goal card was rendered.
 *
 * Rather than pull a WASM payload into the web build for one shape, this draws the same
 * ring with SVG. What is lost is the sweep gradient (SVG has only linear and radial) and
 * the soft shadow where the arc laps itself past 100 %. What is kept is everything the
 * ring *means*: the proportion, the rounded caps, the recessed track, and the overshoot
 * as a second arc.
 *
 * That trade is deliberate and worth stating: the native app gets the finish, the web
 * build gets the geometry. A preview that showed a fake ring would be worse than one that
 * showed a plainer real one.
 */

import { StyleSheet, View } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'

import type { GoalRingProps } from './GoalRing.types'

/** Rings start at 12 o'clock and run clockwise, like every other ring the user has seen. */
const START_ROTATION = -90

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
  const circumference = 2 * Math.PI * radius

  const clamped = Math.max(0, fraction)
  const firstTurn = Math.min(1, clamped)
  const overshoot = Math.min(1, Math.max(0, clamped - 1))

  const arc = (portion: number) => ({
    strokeDasharray: `${circumference * portion} ${circumference}`,
  })

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>

        <Circle
          cx={centre}
          cy={centre}
          r={radius}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
        />

        {firstTurn > 0 && (
          <Circle
            cx={centre}
            cy={centre}
            r={radius}
            stroke="url(#ring)"
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(${START_ROTATION} ${centre} ${centre})`}
            {...arc(firstTurn)}
          />
        )}

        {overshoot > 0 && (
          <Circle
            cx={centre}
            cy={centre}
            r={radius}
            stroke={colors[1]}
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(${START_ROTATION} ${centre} ${centre})`}
            {...arc(overshoot)}
          />
        )}
      </Svg>

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
