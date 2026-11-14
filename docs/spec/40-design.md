# Design

The bar: **v1's cleanliness, with native components** (D3). Open the captures in
`docs/reference/v1/ios/` next to any screen being checked. They set content, hierarchy,
grouping, spacing and polish. They do not set headers, navigation or Android's look.

## Principles

1. Native first. A platform control beats a look-alike, always. On iOS that means SwiftUI
   through `@expo/ui` wherever it has the component (D27): the OS then draws today's look,
   and next year's, instead of the app copying one year's metrics. Grouped lists are for
   settings-like screens; notices and feeds are cards, as in iOS 27's Health app (D28,
   [reference/health-27.md](../reference/health-27.md)).
2. Never a hard-coded font size. This was the defect behind "doesn't feel native on Android".
3. Semantic colours from the system, so light, dark and increased contrast come for free.
4. Android is Material 3, not iOS with another font.
5. If a screen matches a capture only with a magic number, the number gets a name or goes.

## Type roles

Roles name a meaning; each maps to the platform's own style and scales with Dynamic Type or
font scale. This is the table from `src/ui/theme/type.ts`. Body, footnote and group header were validated
by [spike 3](../spikes/03-grouped-lists.md); the other roles are checked by the slice that first uses them.

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
| `groupHeader` | SwiftUI's own section header (D27) | Title Small, sentence case | Above groups |
| `caption` | Caption 1 | Label Medium | Calendar source, chart labels |

Welcome's thin "Welcome to" and heavy "LifeTime" keep v1's weights (100 and 800) and sizes
(58 and 68 pt), shrinking to fit one line; they are lettering, not text that should grow with
Dynamic Type (slice 3, matching capture 01). The rest of Welcome uses the roles.

At the largest accessibility sizes, rows grow and nothing is truncated except the single-line
titles v1 already truncated (the Summary's activity rows). Checked on every screen by slice 9
([slices/9/](../slices/9/README.md)), which settled these rules (`src/ui/textSize.ts`):

- **At the five accessibility sizes, a row's parts stack** instead of sitting side by side,
  where SwiftUI's `isAccessibilitySize` turns true: a section title over its action, an
  activity's duration over its bar, the Sorter's category menu under its title, a reminder's
  next firing under its hour. Side by side, both halves broke mid-word.
- **Fixed rows are capped at the largest standard size** with SwiftUI's `dynamicTypeSize`, as
  Apple advises: the goal editor's four quick durations and its seven day circles.
- **Chart labels scale up to 1.3**, since the chart has fixed geometry; the gutter and the
  letter strip grow with them, and the pager's height follows the caption, on two lines at the
  accessibility sizes.
- **Row symbols grow with the text up to 1.5 times** (`ICON_SCALE_LIMIT`): fixed, they looked
  lost; at twice, "Nutrition" broke as "Nutri-tion".
- **Screens that are one card scroll**: Welcome's pitch scrolls above a pinned `Continue`, and
  the permission sheets open full height and scroll instead of sizing to their content.

## Spacing

The 4 pt grid and values of `src/ui/theme/space.ts`: `xxs 2`, `xs 4`, `sm 8`, `md 12`,
`lg 16`, `xl 20`, `xxl 24`, `section 32`. Screen margin 16. Row minimum 44 pt on iOS and 56 dp
on Android. Separator inset is derived: margin + icon 28 + gap 12, never typed in.
On iOS these apply only to what React Native lays out (the chart, goal cards): `Form` rows,
sections and their margins are SwiftUI's own (D27).

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
| Grouped list | SwiftUI `Form` and `Section` through `@expo/ui`, rounded groups as in Settings.app (D27, [spike 4](../spikes/04-expo-ui-lists.md)); React Native content such as the chart sits in a section through `RNHostView` | M3 list, grouped by headers and dividers |
| Notice card | A `Form` section with one row, insets removed (`src/ui/Card.tsx`): an optional banner in the accent colour with an uppercase label and a close button, then an SF Symbol, a Headline title, the text in Subheadline secondary, capsule buttons (`borderedProminent`, then `bordered`). Empty states, the demo invitation, access refused (D28) | M3 card, same slots |
| Feed card | Health's "This Week" card: a heading in the category's colour with its icon and chevron, a sentence, the chart; under bold section titles. Summary and Goals (D28) | M3 card |
| Row | SwiftUI row: text, trailing value, chevron when it pushes (`src/ui/Form.tsx`) | Ripple, same slots |
| Group heading, action, footnote | `Section` header and footer; the content of SCREENS.md §1, the look of the OS | Same structure, M3 type |
| Tinted check | Filled in the item's own colour (calendar, category) | Same; M3 checkbox only if the Android pass shows the tint is lost |
| Switch, slider, picker, date picker, text field | SwiftUI through `@expo/ui` (D27), each proven on the simulator by the first slice that needs it | Jetpack Compose through `@expo/ui` |
| Menu, confirm | Native menu and alert | M3 menu and dialog |
| Sheet | Form sheet; a permission request is a sheet sized to its content, centred under its glyph, `Continue` then `Not Now` (D28) | M3 bottom sheet, or a full-screen dialog for forms |
| Chart | React Native views, geometry of SCREENS.md §8b, stacked by the week's totals (D25), in a SwiftUI page-style `TabView` (slice 2) | Same views, Compose pager |
| Ring | Skia, behaviours of SCREENS.md §8c: 1500 ms sweep on the same curve, end-cap shadow, start cap hidden past a turn | Same |
| Icons | SF Symbols through expo-symbols | Material Symbols through expo-symbols |

## Liquid Glass

Sparingly ([INTENT.md](../INTENT.md) §2.2): corner buttons, navigation bar, tab bar, popovers.
Never on content, lists or cards. Before iOS 26, the system's standard material applies.

## iOS and Android differences

| Topic | iOS | Android |
|---|---|---|
| Large titles | UIKit, Mail-style | Experimental medium/large bar, or small bar (spike at the Android pass) |
| Group header case | Whatever SwiftUI's `Section` draws on the running iOS | Sentence case |
| Back | Minimal chevron | Arrow, predictive back |
| Primary action on forms | Trailing text button | Trailing text button in the bar |
| Haptics | Selection on toggles, as in the system | Platform default |

## VoiceOver

Settled by slice 9 (`src/ui/Symbols.tsx`):

- A selectable row is a button whose state is the **Selected** trait (`selectionTraits`),
  not its check or circle: category choices, Filters' calendars, the goal's type and days, the
  Sorter's selection, Settings' theme.
- A symbol beside a text that says the same is hidden (`IconTile`, `CheckCircle`, `Chevron`).
- A control whose visible text is not enough says what it changes: "Category for Gym" with
  the category as its value, "Remove 9:00 AM reminder", "60 minutes a day", the duration
  slider read as a duration rather than a percentage.
- The week chart is one element read as its days: "Monday: 6h 30m, mostly Work"
  (`describeWeekChart`).

## Motion

Keep v1's considered entrances: Welcome's two staged springs (SCREENS.md §2), empty-state
scale and fade, the ring sweep. Respect Reduce Motion: Welcome shows at once, the ring is drawn
at its value (slice 9). No other decorative animation. Welcome's `Continue` fades without
sliding: a SwiftUI button mounted mid-slide kept a frame below where it was drawn.
