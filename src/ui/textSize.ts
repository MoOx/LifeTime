import { useWindowDimensions } from 'react-native'

/**
 * Text size, for the few layouts that must change shape when the text grows (slice 9).
 *
 * React Native reports the system text size as `fontScale`: 1 at the default size, 1.353 at
 * the largest standard one, then 1.786 to 3.571 across the five accessibility sizes (React
 * Native's `RCTFontSizeMultiplier` table). The threshold sits between the two, where SwiftUI's
 * `DynamicTypeSize.isAccessibilitySize` turns true, and where Apple's own apps stack a row's
 * parts vertically instead of side by side.
 */
const ACCESSIBILITY_SIZE = 1.5

/** True at the five accessibility text sizes. */
export const useAccessibilityTextSize = (): boolean =>
  useWindowDimensions().fontScale >= ACCESSIBILITY_SIZE

/**
 * The text size's multiplier, for a measure laid out by hand that must follow the text (the
 * Summary pager's height, an icon tile). Capped by `limit`: past it the text wraps or the
 * icon would crowd it, as SwiftUI's own list icons stop growing.
 */
export const useTextScale = (limit = Infinity): number =>
  Math.min(useWindowDimensions().fontScale, limit)

/**
 * How far a row's symbol follows the text size (slice 9). At twice their size, tile and check
 * took the width the name needed, and "Nutrition" broke as "Nutri-tion" at the largest size.
 */
export const ICON_SCALE_LIMIT = 1.5
