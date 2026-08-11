/**
 * The grouped list, rebuilt.
 *
 * v1's UX was right and its UI aged badly, and those are separate problems. What it had,
 * and what `@expo/ui`'s `List` cannot express, is a **grammar**:
 *
 *     BlockHeading "Calendars"          + a blue action on the right ("Show All")
 *     ListItem  · icon · text · accessory
 *     ListItem  ·      ↑ separator inset to align under the text, not the icon
 *     BlockFootnote "Auto theme will switch between Light & Dark…"
 *
 * Three parts, and every screen in v1 was built from them. `@expo/ui` gives authentic row
 * chrome but no section headers, no header actions, no footnotes, and no way to put a
 * progress bar or a coloured swatch inside a row — so a screen built from it can only be
 * a flat list, which is exactly what the last build looked like.
 *
 * So these are React Native. What makes that acceptable now and not in v1 is that nothing
 * here names a size or a colour: type comes from `AppText` (Dynamic Type / Material 3),
 * colour from `PlatformColor`, and metrics from `theme/space.ts`, which states each
 * platform's published list metrics once instead of at every call site.
 *
 * Genuinely native controls — `Switch`, `Picker`, `TextInput` — still come from
 * `@expo/ui`, hosted inside a row's accessory slot. Those are the pieces worth bridging;
 * a row separator is not.
 */

import type { ReactNode } from 'react'
import { Fragment, Children, isValidElement } from 'react'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { AppText } from './AppText'
import { Symbol, type SymbolName } from './Symbol'
import { colors } from './theme/colors'
import { layout, space } from './theme/space'

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

export type ListHeaderProps = {
  title: string
  /** The blue text action on the right — v1's `BlockHeadingTouchable`. */
  action?: { label: string; onPress: () => void }
  style?: StyleProp<ViewStyle>
}

export function ListHeader({ title, action, style }: ListHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <AppText role="groupHeader" tone="secondary" style={styles.headerTitle}>
        {title}
      </AppText>
      {action !== undefined && (
        <Pressable
          onPress={action.onPress}
          hitSlop={12}
          accessibilityRole="button"
          style={({ pressed }) => pressed && styles.pressedText}>
          <AppText role="footnote" tone="accent">
            {action.label}
          </AppText>
        </Pressable>
      )}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Footnote
// ---------------------------------------------------------------------------

export function ListFootnote({
  children,
  tone = 'tertiary',
}: {
  children: ReactNode
  /** `destructive` turns a footnote into the reason a control above it is disabled. */
  tone?: 'tertiary' | 'destructive'
}) {
  return (
    <View style={styles.footnote}>
      <AppText role="footnote" tone={tone}>
        {children}
      </AppText>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------

export type ListGroupProps = {
  children: ReactNode
  /**
   * Where separators start, so they align under the row text rather than under its icon.
   * `'text'` is the iOS default; `'full'` is for rows with no leading element.
   */
  separatorInset?: 'text' | 'full' | number
  style?: StyleProp<ViewStyle>
}

/**
 * Rounds the corners, paints the surface, and puts a hairline between rows — never above
 * the first or below the last, which is the detail that separates a real grouped list
 * from a stack of cards.
 */
export function ListGroup({ children, separatorInset = 'full', style }: ListGroupProps) {
  const rows = Children.toArray(children).filter(isValidElement)
  const inset =
    separatorInset === 'text'
      ? layout.separatorInset
      : separatorInset === 'full'
        ? 0
        : separatorInset

  return (
    <View style={[styles.group, style]}>
      {rows.map((row, index) => (
        <Fragment key={row.key ?? index}>
          {index > 0 && <View style={[styles.separator, { marginLeft: inset }]} />}
          {row}
        </Fragment>
      ))}
    </View>
  )
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

export type ListRowProps = {
  title: string
  /** Second line under the title. */
  subtitle?: string
  /** A leading symbol, tinted. */
  symbol?: SymbolName
  symbolColor?: string
  /** Anything at the leading edge — a colour swatch, a ring. Overrides `symbol`. */
  leading?: ReactNode
  /** Right-hand value text, before any accessory. */
  value?: string
  /** A control or chevron at the trailing edge. */
  accessory?: ReactNode
  /** Adds the platform disclosure chevron. */
  chevron?: boolean
  onPress?: () => void
  /** Renders the title in the destructive colour, centred — v1's "Hide Activity". */
  destructive?: boolean
  /** Renders the title in the accent colour, centred — v1's "Mask Hidden Activities". */
  centeredAction?: boolean
  /**
   * Greyed out and unpressable. The Contacts.app pattern: the control that commits stays
   * visible but inert until the form is valid, so the user can see what they are aiming
   * at. Pair it with a `ListFootnote tone="destructive"` saying what is missing.
   */
  disabled?: boolean
  /** Extra content under the title, inside the row: a progress bar, a chart. */
  children?: ReactNode
  accessibilityLabel?: string
}

export function ListRow({
  title,
  subtitle,
  symbol,
  symbolColor,
  leading,
  value,
  accessory,
  chevron = false,
  onPress,
  destructive = false,
  centeredAction = false,
  disabled = false,
  children,
  accessibilityLabel,
}: ListRowProps) {
  const centred = destructive || centeredAction

  const body = (
    <View style={[styles.row, centred && styles.rowCentred, disabled && styles.disabled]}>
      {leading ?? (symbol !== undefined && (
        <Symbol name={symbol} size={22} color={symbolColor ?? colors.accent} />
      ))}

      <View style={styles.rowBody}>
        <AppText
          role={centred ? 'body' : 'rowTitle'}
          tone={
            // A disabled control goes grey, the way iOS greys one. Fading the accent
            // colour instead leaves a washed-out blue that reads as a rendering fault.
            disabled
              ? 'tertiary'
              : destructive
                ? 'destructive'
                : centeredAction
                  ? 'accent'
                  : 'primary'
          }
          numberOfLines={centred ? 1 : 2}
          style={centred && styles.centredText}>
          {title}
        </AppText>
        {subtitle !== undefined && (
          <AppText role="footnote" tone="secondary">
            {subtitle}
          </AppText>
        )}
        {children}
      </View>

      {value !== undefined && (
        <AppText role="rowTitle" tone="secondary" tabular numberOfLines={1}>
          {value}
        </AppText>
      )}
      {accessory}
      {chevron && <Symbol name="chevronRight" size={13} color={colors.tertiaryLabel} />}
    </View>
  )

  if (onPress === undefined || disabled) return body

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: colors.selection }}
      style={({ pressed }) => pressed && styles.pressedRow}>
      {body}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.sm,
  },
  headerTitle: {
    flexShrink: 1,
    // iOS group headers are uppercased; Material 3's are not. Uppercasing here rather
    // than in the copy keeps the strings translatable.
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footnote: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: layout.groupRadius,
    overflow: 'hidden',
    // Groups inset themselves from the screen edge, the way an inset-grouped table view
    // does, so a screen never has to pad its own content — and a full-bleed element (the
    // chart) can simply not use a group.
    marginHorizontal: space.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.iconGap,
    minHeight: layout.rowMinHeight,
    paddingHorizontal: space.lg,
    paddingVertical: layout.rowPaddingVertical,
  },
  rowCentred: {
    // The body keeps `flex: 1` and the *text* is centred. Setting `flex: 0` here to let
    // the row centre its child collapsed the body to zero width, so a one-line centred
    // label rendered as nothing at all — which is what made "Create goal" and "Add" look
    // like empty cards.
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: space.xxs,
  },
  centredText: {
    textAlign: 'center',
  },
  pressedRow: {
    backgroundColor: colors.selection,
  },
  disabled: {
    // Only the accessories dim; the label carries its own disabled colour.
    opacity: 0.6,
  },
  pressedText: {
    opacity: 0.5,
  },
})
