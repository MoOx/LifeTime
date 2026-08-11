/**
 * Icons, from the platform's own set: SF Symbols on iOS, Material Symbols on Android.
 *
 * `expo-symbols` takes a `{ ios, android }` pair and renders each side natively, so an
 * icon inherits the weight, optical size and colour behaviour the OS gives its own —
 * including SF Symbol animations. v1 shipped three hand-drawn SVGs and used them on both
 * platforms.
 *
 * The catalogue lives in `Symbol.types.ts`, because `Symbol.web.tsx` needs the same names:
 * `expo-symbols` renders nothing at all on web, so the web build letters the catalogue
 * itself.
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
      name={{ ios: pair.ios as SFSymbol, android: pair.android as AndroidSymbol }}
      size={size}
      tintColor={color}
      weight={weight}
      style={[{ width: size, height: size }, style]}
      accessibilityLabel={accessibilityLabel}
      accessible={accessibilityLabel !== undefined}
    />
  )
}
