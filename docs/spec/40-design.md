# Design

The bar: **v1's cleanliness, with native components** (D3). Open the captures in
`docs/reference/v1/ios/` next to any screen being checked. They set content, hierarchy,
grouping, spacing and polish. They do not set headers, navigation or Android's look.

## Principles

1. Native first. A platform control beats a look-alike, always.
2. Never a hard-coded font size. This was the defect behind "doesn't feel native on Android".
3. Semantic colours from the system, so light, dark and increased contrast come for free.
4. Android is Material 3, not iOS with another font.
5. If a screen matches a capture only with a magic number, the number gets a name or goes.

## Type roles

Roles name a meaning; each maps to the platform's own style and scales with Dynamic Type or
font scale. This is the table from `src/ui/theme/type.ts`, carried over once validated by
spike 3.

| Role | iOS text style | Material 3 role | Used for |
|---|---|---|---|
| `screenTitle` | Large Title | Headline Large | Native headers provide this; content titles in Help, Privacy |
| `metric` | Title 1 | Headline Medium | Goal card title |
| `cardTitle` | Title 2 | Title Large | Goal card value, sheet headings |
| `sectionTitle` | Title 3 | Title Medium | Help sub-headings, empty-state title |
| `headline` | Headline | Title Medium | Emphasised rows |
| `body` | Body | Body Large | Row titles, prose |
| `callout` | Callout | Body Medium | Activity row title |
| `subhead` | Subheadline | Body Medium | Goals introduction, chips |
| `footnote` | Footnote | Body Small | Under groups |
| `groupHeader` | Footnote, uppercase on iOS | Title Small, sentence case | Above groups |
| `caption` | Caption 1 | Label Medium | Calendar source, chart labels |

Welcome's thin "Welcome to" and heavy "LifeTime" keep v1's weights (100 and 800) at the role
sizes, and fit on one line at any size.

At the largest accessibility sizes, rows grow and nothing is truncated except the single-line
titles v1 already truncated. Chart labels scale up to a limit of 1.3, since the chart has
fixed geometry; this is the only clamp.

## Spacing

The 4 pt grid and values of `src/ui/theme/space.ts`: `xxs 2`, `xs 4`, `sm 8`, `md 12`,
`lg 16`, `xl 20`, `xxl 24`, `section 32`. Screen margin 16. Row minimum 44 pt on iOS and 56 dp
on Android. Separator inset is derived: margin + icon 28 + gap 12, never typed in.

## Colour

| Need | iOS | Android |
|---|---|---|
| Label hierarchy | `label`, `secondaryLabel`, `tertiaryLabel` | `onSurface`, `onSurfaceVariant` |
| Screen, group | `systemGroupedBackground`, `secondarySystemGroupedBackground` | `surface`, `surfaceContainer` |
| Separator | `separator` | `outlineVariant` |
| Accent | v1's indigo on brand moments; system blue for actions, as in the captures | Dynamic colour, with the indigo as fallback seed |
| Destructive | `systemRed` | `error` |

Category colours stay v1's nine (`docs/SPEC.md` §2.3), resolved to the system palette on iOS
and to the tonal equivalents on Android. Goal cards keep the on-dark text role in both
appearances, `textOnDarkLight` in SCREENS.md §13.

## Components

| Component | iOS | Android |
|---|---|---|
| Tab bar | Native tabs (Liquid Glass) | Material navigation bar |
| Grouped list | Inset grouped, as in Settings.app; v1's edge-to-edge groups, as captured, if spike 3 finds them cleaner | M3 list, grouped by headers and dividers |
| Row | Left slot, text, right slot, chevron | Ripple, same slots |
| Group heading, action, footnote | As SCREENS.md §1 | Same structure, M3 type |
| Tinted check | Filled in the item's own colour (calendar, category) | Same; M3 checkbox only if spike 3 shows the tint is lost |
| Switch, slider | Native, `@expo/ui` where spike 3 validates it | Same |
| Menu, confirm | Native menu and alert | M3 menu and dialog |
| Sheet | Form sheet | M3 bottom sheet, or a full-screen dialog for forms |
| Chart | Skia, geometry of SCREENS.md §8b | Same |
| Ring | Skia, behaviours of SCREENS.md §8c: 1500 ms sweep on the same curve, end-cap shadow, start cap hidden past a turn | Same |
| Icons | SF Symbols through expo-symbols | Material Symbols through expo-symbols |

## Liquid Glass

Sparingly ([INTENT.md](../INTENT.md) §2.2): corner buttons, navigation bar, tab bar, popovers.
Never on content, lists or cards. Before iOS 26, the system's standard material applies.

## iOS and Android differences

| Topic | iOS | Android |
|---|---|---|
| Large titles | UIKit, Mail-style | Experimental medium/large bar, or small bar (spike 1) |
| Group header case | Uppercase | Sentence case |
| Back | Minimal chevron | Arrow, predictive back |
| Primary action on forms | Trailing text button | Trailing text button in the bar |
| Haptics | Selection on toggles, as in the system | Platform default |

## Motion

Keep v1's considered entrances: Welcome's two staged springs (SCREENS.md §2), empty-state
scale and fade, the ring sweep. Respect Reduce Motion. No other decorative animation.
