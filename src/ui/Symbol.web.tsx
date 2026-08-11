/**
 * Symbols on the web.
 *
 * `expo-symbols` is a bridge to SF Symbols and Material Symbols, and on web it renders
 * **nothing at all** — not a fallback, not a box, nothing. That is silently wrong in two
 * places that matter:
 *
 *   • The web build is a real target (`docs/SCREENS.md` §12), and a settings list whose
 *     selected row is marked only by a check mark shows no selection whatsoever.
 *   • The preview harness photographs the web build. Three screens convey their entire
 *     state through a symbol — which category an activity has, which theme is on, which
 *     ring mode is on — so every screenshot taken so far has been blind to all of it, and
 *     I have been reading those screenshots as if they were complete.
 *
 * So this maps the catalogue to text. Where a symbol has an unambiguous typographic
 * equivalent — a check mark, a chevron, a plus, a minus — that character *is* the icon and
 * is as good as the native one. Where it does not (a calendar, a bell, a wand), the glyph
 * would be a guess, so it renders a neutral rounded placeholder at the right size: the
 * layout stays honest, and nothing pretends to be an icon it is not.
 *
 * This is deliberately not a webfont. Bundling Material Symbols to letter a demo would add
 * a megabyte to a page whose job is to load fast, and the CSP on the preview host blocks
 * font CDNs outright.
 */

import { StyleSheet, Text, View } from 'react-native'

import type { SymbolName, SymbolProps } from './Symbol.types'

export { SYMBOLS } from './Symbol.types'
export type { SymbolName, SymbolPair, SymbolProps } from './Symbol.types'

/**
 * Only characters that mean the same thing as the symbol. Anything requiring a leap
 * ("🔔 is a reminder") is left out on purpose — see the placeholder below.
 */
const TEXT: Partial<Record<SymbolName, string>> = {
  checkmark: '✓',
  chevronRight: '›',
  add: '+',
  remove: '−',
  today: '↺',
}

const WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

export function Symbol({
  name,
  size = 20,
  color,
  weight = 'regular',
  style,
  accessibilityLabel,
}: SymbolProps) {
  const text = TEXT[name]

  if (text === undefined) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius: size / 4 },
          style,
        ]}
      />
    )
  }

  return (
    <Text
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          fontSize: size,
          lineHeight: size * 1.2,
          color: color as string,
          fontWeight: WEIGHTS[weight],
        },
        style,
      ]}>
      {text}
    </Text>
  )
}

/**
 * Category icons come from data, so there is no catalogue entry to look up — a coloured
 * tile at the right size is the honest rendering, and the tile is what carries the
 * category's colour anyway.
 */
export function RawSymbol({
  size = 20,
  style,
  accessibilityLabel,
}: Omit<SymbolProps, 'name'> & { pair: { ios: string; android: string } }) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.raw, { width: size, height: size }, style]}
    />
  )
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(127,127,127,0.28)',
  },
  raw: {
    // Nothing: the coloured tile a category icon sits on is already visible, and a grey
    // square inside it would read as a broken image.
    opacity: 0,
  },
})
