/**
 * Icons, from the platform's own set: SF Symbols on iOS, Material Symbols everywhere else.
 *
 * `expo-symbols` takes a `{ ios, android, web }` map and renders each side natively, so an
 * icon inherits the weight, optical size and colour behaviour the OS gives its own —
 * including SF Symbol animations. v1 shipped three hand-drawn SVGs and used them on both
 * platforms.
 *
 * **The `web` key is not optional.** `SymbolView` picks the name with
 * `props.name[Platform.OS === 'android' ? 'android' : 'web']`, so a pair carrying only
 * `ios` and `android` resolves to `undefined` on web and the component renders its
 * `fallback` — nothing. That is why every preview screenshot showed no icons and no
 * selection ticks, and why a hand-lettered web fallback briefly lived here: the library was
 * never the problem, the missing key was. Web and Android draw from the same Material
 * Symbols font (`expo-symbols/build/android/symbols.json`, 4055 glyphs), so the Android
 * name is exactly the right value for both and is passed through in one place rather than
 * written twice in every catalogue entry.
 *
 * `weight` is deliberately left as a plain string. On Android and web `getFont` only
 * honours the object form (`{ ios, android }`) with a font imported from
 * `expo-symbols/androidWeights/*`; a string falls through to the bundled regular face,
 * which is what we want — one font file rather than nine.
 */

import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols'

import { SYMBOLS, type SymbolProps } from './Symbol.types'

export { SYMBOLS } from './Symbol.types'
export type { SymbolName, SymbolPair, SymbolProps } from './Symbol.types'

export function Symbol({
  name,
  size = 20,
  color,
  weight = 'regular',
  style,
  accessibilityLabel,
}: SymbolProps) {
  return (
    <RawSymbol
      pair={SYMBOLS[name]}
      size={size}
      color={color}
      weight={weight}
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  )
}

/**
 * For symbols that come from data rather than from the catalogue — a category carries its
 * own `sf` / `material` names so that categories can become user-editable without this
 * file having to know about them.
 */
export function RawSymbol({
  pair,
  size = 20,
  color,
  weight = 'regular',
  style,
  accessibilityLabel,
}: Omit<SymbolProps, 'name'> & { pair: { ios: string; android: string } }) {
  return (
    <SymbolView
      name={{
        ios: pair.ios as SFSymbol,
        android: pair.android as AndroidSymbol,
        // Same font, same glyph names — see the note above.
        web: pair.android as AndroidSymbol,
      }}
      size={size}
      tintColor={color}
      weight={weight}
      style={[{ width: size, height: size }, style]}
      accessibilityLabel={accessibilityLabel}
      accessible={accessibilityLabel !== undefined}
    />
  )
}
