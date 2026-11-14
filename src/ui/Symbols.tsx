import { Image } from '@expo/ui/swift-ui'
import {
  accessibilityAddTraits,
  accessibilityHidden,
  background,
  font,
  foregroundStyle,
  frame,
  shapes,
} from '@expo/ui/swift-ui/modifiers'
import type { ColorValue } from 'react-native'
import type { SFSymbol } from 'sf-symbols-typescript'

import { layout } from './theme/space'
import { ICON_SCALE_LIMIT, useTextScale } from './textSize'

/**
 * The symbols rows draw beside their text, in one place for slice 9's two rules:
 *
 *   - **Hidden from VoiceOver.** Each is decoration next to a text that says the same, and
 *     SwiftUI would otherwise read the symbol's name ("figure run", "circle").
 *   - **Growing with the text**, up to `ICON_SCALE_LIMIT`: a fixed 28 pt tile looked lost
 *     beside text three times larger.
 */

/** A category's symbol, white on its coloured rounded square (v1's rows, Settings' icons). */
export function IconTile({ icon, color }: { icon: SFSymbol; color: string }) {
  const scale = useTextScale(ICON_SCALE_LIMIT)
  return (
    <Image
      systemName={icon}
      color="white"
      size={15 * scale}
      modifiers={[
        frame({ width: layout.iconSize * scale, height: layout.iconSize * scale }),
        background(
          color,
          shapes.roundedRectangle({ cornerRadius: 7 * scale, roundedCornerStyle: 'continuous' }),
        ),
        accessibilityHidden(true),
      ]}
    />
  )
}

/**
 * The circle a selectable row ticks. VoiceOver hears the row's `selectionTraits` instead.
 */
export function CheckCircle({
  selected,
  color,
  size = 24,
  grows = true,
}: {
  selected: boolean
  color: ColorValue
  size?: number
  /** False in a row capped with `dynamicTypeSize`, whose text stops growing too. */
  grows?: boolean
}) {
  const scale = useTextScale(grows ? ICON_SCALE_LIMIT : 1)
  return (
    <Image
      systemName={selected ? 'checkmark.circle.fill' : 'circle'}
      color={color}
      size={size * scale}
      modifiers={[accessibilityHidden(true)]}
    />
  )
}

/**
 * A selectable row's traits: VoiceOver says "Selected" for the chosen one. Always one
 * modifier, whose value changes, so the row's structure stays the same (`isButton` is
 * already a Button's).
 */
export const selectionTraits = (selected: boolean) =>
  accessibilityAddTraits(selected ? ['isSelected'] : ['isButton'])

/** A row's disclosure chevron. It follows the footnote style, so it grows by itself. */
export function Chevron() {
  return (
    <Image
      systemName="chevron.right"
      modifiers={[
        font({ textStyle: 'footnote', weight: 'semibold' }),
        foregroundStyle({ type: 'hierarchical', style: 'tertiary' }),
        accessibilityHidden(true),
      ]}
    />
  )
}
