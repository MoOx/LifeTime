# LifeTime — architecture for the rewrite

> Target: a fresh Expo codebase that looks **genuinely native on both platforms** — Liquid
> Glass / HIG on iOS 26, Material 3 (Expressive) on Android — by delegating as much as
> possible to the OS instead of re-implementing it.
>
> All versions below verified against the npm registry on **2026-08-09**.

---

## 1. The core principle

The old app failed the "feels native on Android" test for one structural reason:

> **It reimplemented iOS in JavaScript and shipped that reimplementation to Android.**

Concretely, `src/components/shareable/Theme.res` hardcodes the iOS type ramp
(`largeTitle: 34/41/0.37`, `body: 17/22/−0.41`, …), the iOS system color palette on both
platforms, and a hand-maintained table mapping font weights to `sans-serif-*` families
across Android OEMs — with a comment that says, verbatim, *"it's a fucking total mess
depending on brands"*. Several components then set `allowFontScaling={false}`, opting out
of accessibility scaling entirely.

That comment is the whole problem: **the mapping table should not exist.** When you name a
semantic role instead of a pixel size, the OS resolves it, and it is correct on every
device, every OEM skin, every accessibility setting, forever.

The rewrite's rule is therefore:

> **Never write a font size, a font weight, a system color, a blur, a tab bar, a context
> menu, or a sheet by hand. Name the role; let SwiftUI and Jetpack Compose render it.**

---

## 2. Stack

| Concern | Choice | Version (2026-08-09) |
|---|---|---|
| Platform | **Expo SDK 57** (React Native 0.86, New Architecture) | `expo@57.0.11` |
| Language | **TypeScript** (see §7) | — |
| Routing | `expo-router` + **native tabs** | `expo-router@57.0.11` |
| Native UI primitives | **`@expo/ui`** — SwiftUI on iOS, Jetpack Compose on Android | `@expo/ui@57.0.9` |
| Liquid Glass | **`expo-glass-effect`** | `expo-glass-effect@57.0.1` |
| Calendars | **`expo-calendar`** (see [CALENDAR.md](./CALENDAR.md)) | `expo-calendar@57.0.1` |
| Notifications | `expo-notifications` | `57.0.9` |
| Background refresh | `expo-background-task` | `57.0.8` |
| SF Symbols | `expo-symbols` | `57.0.2` |
| Storage | `expo-sqlite` (`useSQLiteContext` / kv store) or `expo-secure-store`-free MMKV | — |
| Dates | `date-fns` v4 (TZ-aware) | — |
| Animation (where needed) | `react-native-reanimated` 4 | `4.5.3` |
| Build / release | EAS Build + EAS Submit + EAS Update (see [RELEASE.md](./RELEASE.md)) | — |

**Dropped from the old stack, with reasons:**

| Dropped | Why |
|---|---|
| `react-native-calendar-events` + 17 KB patch | dead; see CALENDAR.md |
| `react-native-push-notification` | superseded by `expo-notifications` (config plugin, Android 13+ POST_NOTIFICATIONS, no manifest hand-editing) |
| `@react-native-community/blur` | superseded by `expo-blur` / `expo-glass-effect` |
| `react-native-bars`, `react-native-transparent-status-and-navigation-bar` | edge-to-edge is the default in RN 0.8x + `expo-system-ui` |
| `react-native-bootsplash` | `expo-splash-screen` |
| `react-native-permissions` | each Expo module owns its own permission hook |
| `react-navigation` (JS tabs) | replaced by native tabs |
| `react-multiversal` (pinned git SHA) | replaced by `@expo/ui` primitives |
| `react-from-svg` custom icon pipeline | SF Symbols + Material Symbols, no custom assets to maintain |
| `fbemitter` | notification → route handled by `expo-router` deep links |
| `patch-package`, `jetifier`, `flow-bin` | no longer needed |
| `react-scripts@3.2` web target | if web is wanted, Expo's own web output |

That removes **six** of the seven codegen steps in the current `npm run prepare`.

---

## 3. Native UI, screen by screen

### 3.1 Tab bar → `expo-router` native tabs

```tsx
// app/(tabs)/_layout.tsx
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs'

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Summary</Label>
        <Icon sf="chart.bar.xaxis" drawable="ic_timeline" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="goals">
        <Label>Goals</Label>
        <Icon sf="target" drawable="ic_flag" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon sf="gearshape" drawable="ic_settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
```

What you get for free, that the old app hand-built:

- **iOS 26**: a real `UITabBarController` rendered with **Liquid Glass**, including the
  scroll-edge transparency and the tab-bar minimize behaviour.
- **iOS ≤ 18**: the classic translucent tab bar.
- **Android**: a Material 3 `NavigationBar`, including the long-press tooltip showing the
  destination name, and the ripple/indicator.
- **Both**: scroll-to-top and pop-to-root on re-tap — currently absent from LifeTime.

`NativeTabs` also exposes a `NativeTabs.Trigger.Badge`, which is the natural home for a
"goals at risk" count.

**Icon rule** (Expo's own guidance): SF Symbols on iOS, Material Symbols on Android. The
40 hand-drawn SVGs in `src/SVGs/` can mostly be dropped — every one of them has a system
equivalent (`moon`, `carrot`→`fork.knife`, `figure.run`, `pencil`, `person.2`, `leaf`,
`theatermasks`, `sparkles`, `bookmark`).

### 3.2 Modals & sheets

The old app used `presentation: #formSheet` plus a `StatusBarFormSheet` shim and a
`Theme.isFormSheetSupported` check for iOS < 13. All of that is gone: `expo-router`'s
`Stack.Screen options={{ presentation: 'formSheet' }}` maps to native sheet presentation,
with `sheetAllowedDetents`, `sheetGrabberVisible` and `sheetCornerRadius` handled by
`react-native-screens`.

For in-content sheets (the goal editor), `@expo/ui`'s `BottomSheet` gives a SwiftUI sheet
on iOS and a Material 3 `ModalBottomSheet` on Android.

### 3.3 Settings & filter lists → native list rows

`SettingsView.res`, `Filters.res` and the category pickers are ~600 lines of hand-built
`ListItem` / `ListSeparator` / `ListHeader` / `ListItemChevron`. They become:

```tsx
import { Host, List, ListItem, Switch, FieldGroup } from '@expo/ui'
```

which renders a SwiftUI `List` with `.insetGrouped` styling on iOS and a Material 3
list on Android — including the correct separator insets, row heights, press states and
disclosure indicators, which the current code approximates by hand
(`spaceStart={Spacer.size(S) *. 2. +. NamedIcon.size}`).

For iOS specifically, `@expo/ui/swift-ui` exposes `Form`, `Section`, `LabeledContent`,
`DisclosureGroup` and `Picker` — a settings screen becomes a declarative SwiftUI form.

### 3.4 Contextual actions → native menus

The `SwipeableRow` component (built on a **patched** `react-native-gesture-handler`) and
the `SVGMore` "…" button on goal cards are replaced by:

- `@expo/ui/swift-ui`'s `ContextMenu` / `Menu` / `SwipeActions` on iOS,
- `@expo/ui/jetpack-compose`'s `DropdownMenu` on Android.

This deletes `patches/react-native-gesture-handler+2.1.1.patch`.

### 3.5 Liquid Glass surfaces

```tsx
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

<GlassView glassEffectStyle="regular" isInteractive style={styles.card}>
  …
</GlassView>
```

`GlassView` degrades to a plain `View` when Liquid Glass is unavailable, and
`isLiquidGlassAvailable()` lets you branch. Use `GlassContainer` to merge several glass
elements so they blend as one shape rather than stacking blurs.

**Where it earns its place in LifeTime** — glass is for floating chrome over content, not
for everything:

- the sticky Summary header (today: a hand-rolled `StickyHeaderBackground` with
  `@react-native-community/blur`),
- a floating "this week" pill over the weekly chart,
- the goal-card overflow button.

**Where it does not:** the goal cards themselves. They are opaque colored surfaces; on
Android they should be Material 3 `Card`s with elevation and dynamic-color tonal
surfaces, not fake glass. Glass is an iOS-26 idiom; the Android counterpart is Material 3
Expressive's tonal surfaces and background blur — different language, same intent.

### 3.6 Charts

`WeeklyGraph.res` is a hand-built stacked bar chart made of nested `View`s with percentage
heights. Two options:

- **Keep it, cleaned up.** For 7 stacked bars this is honestly fine, it works identically
  on both platforms, and once colors and labels come from the platform (§4) it reads as
  native. Zero dependency.
- **`@expo/ui/swift-ui`'s `Chart`** (`type="bar"`, with `ChartDataPoint[]`) renders real
  **Swift Charts** on iOS — correct axis typography, correct animations, VoiceOver audio
  graphs for free. There is no Jetpack Compose counterpart in `@expo/ui`, so Android would
  need the View-based fallback or `victory-native` (Skia).

**Recommendation:** ship the View-based chart first (it is already written and understood),
and treat Swift Charts as a nice-to-have iOS enhancement behind a `Platform.OS` branch.
Do not take a Skia dependency for one bar chart.

The `ActivityRings` component (masked SVG + PNG mask) can be replaced on iOS by
`@expo/ui/swift-ui`'s `Gauge`, and on Android by a Material 3 circular `Progress`. That
deletes a binary asset and a `masked-view` dependency.

### 3.7 Controls

| Old | New |
|---|---|
| `@react-native-community/slider` | `Slider` from `@expo/ui` (universal) |
| `@react-native-community/datetimepicker` | `DateTimePicker` from `@expo/ui` |
| custom `TouchableButton` | `Button` from `@expo/ui` |
| custom checkbox circles (`SVGCircle`/`SVGCheckmarkcircle`) | `Checkbox` / `Switch` from `@expo/ui` |
| `Alert.alert` | keep — it is already native; or `@expo/ui`'s `Alert` / `ConfirmationDialog` for styled confirmations |

---

## 4. Typography and color — the actual fix

This is the answer to *"sur Android ça n'avait pas l'air natif"*.

### 4.1 Never write a font size again

**iOS** — use SwiftUI text styles, which scale with Dynamic Type automatically:

```tsx
import { Host, Text } from '@expo/ui/swift-ui'
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers'

<Text modifiers={[font({ textStyle: 'largeTitle', weight: 'bold' })]}>Your LifeTime</Text>
```

Available `textStyle` values map 1:1 onto the ramp the old app hardcoded:
`largeTitle`, `title`, `title2`, `title3`, `headline`, `subheadline`, `body`, `callout`,
`footnote`, `caption`, `caption2`.

**Android** — use the Material 3 type scale:

```tsx
import { Text } from '@expo/ui/jetpack-compose'

<Text typographyStyle="headlineLarge">Your LifeTime</Text>
```

`TypographyStyle` values: `displayLarge/Medium/Small`, `headlineLarge/Medium/Small`,
`titleLarge/Medium/Small`, `bodyLarge/Medium/Small`, `labelLarge/Medium/Small` — resolved
from `MaterialTheme.typography`, so they follow the device's font, font scale and OEM
theming.

**The mapping table.** Define it **once**, semantically, and let each platform resolve it:

```ts
// theme/type.ts
export const ROLE = {
  screenTitle: { ios: 'largeTitle', android: 'headlineLarge' },
  sectionTitle: { ios: 'title3',    android: 'titleMedium'   },
  cardTitle:    { ios: 'title2',    android: 'titleLarge'    },
  body:         { ios: 'body',      android: 'bodyLarge'     },
  secondary:    { ios: 'subheadline', android: 'bodyMedium'  },
  caption:      { ios: 'caption',   android: 'labelSmall'    },
} as const
```

Then a single `<AppText role="cardTitle">` component picks the right primitive per
platform. **No numbers anywhere.** Compare with `Theme.res`'s 11 hardcoded ramps plus 9
per-OEM weight rows.

And delete every `allowFontScaling={false}`. It exists in the current code because
hardcoded sizes break layouts when scaled; semantic styles + flexible layouts do not.

### 4.2 System colors, not hex

The old theme hardcodes `"#fff"`, `"#111"`, `"rgba(255,255,255,0.98)"` and the iOS palette
constants on both platforms. Replace with:

```ts
import { PlatformColor, DynamicColorIOS } from 'react-native'

export const colors = {
  label:      Platform.select({ ios: PlatformColor('label'),
                                android: PlatformColor('?attr/colorOnSurface') }),
  secondary:  Platform.select({ ios: PlatformColor('secondaryLabel'),
                                android: PlatformColor('?attr/colorOnSurfaceVariant') }),
  background: Platform.select({ ios: PlatformColor('systemGroupedBackground'),
                                android: PlatformColor('?attr/colorSurface') }),
  separator:  Platform.select({ ios: PlatformColor('separator'),
                                android: PlatformColor('?attr/colorOutlineVariant') }),
  accent:     Platform.select({ ios: PlatformColor('systemIndigo'),
                                android: PlatformColor('?attr/colorPrimary') }),
}
```

Two direct wins:

1. **Light/dark handled by the OS.** The `Theme.res` two-stylesheet machinery and the
   `useTheme(acceptedMode)` hook mostly disappear. (Keep the explicit Light/Dark/Auto
   setting — but implement it with `expo-system-ui` / `Appearance.setColorScheme`, and let
   `PlatformColor` follow.)
2. **Material You on Android.** `?attr/colorPrimary` resolves to the user's wallpaper-derived
   dynamic color on Android 12+. The app adopts the phone's personality for free — which is
   *the* signature of a native Android app, and something a hardcoded iOS indigo can never do.

Liquid Glass specifically requires this: glass surfaces tint from dynamic system colors, so
`PlatformColor('label')` stays legible over glass while `"#111"` does not.

### 4.3 The 9 category colors

These are **brand/semantic** colors (Rest = indigo, Work = blue…), not chrome, so they stay
app-defined — but they should be defined as a palette with light/dark variants and checked
for contrast, rather than borrowed from `Predefined.Colors.Ios`. See
[IMPROVEMENTS.md](./IMPROVEMENTS.md) §2.1 for making them user-editable.

---

## 5. Project layout

```
app/                              # expo-router file-based routes
  _layout.tsx                     # providers, splash, theme
  (tabs)/
    _layout.tsx                   # NativeTabs
    index.tsx                     # Summary
    goals.tsx
    settings/
      index.tsx
      notifications.tsx
      data.tsx                    # ex "Danger Zone"
  activity/[title].tsx            # activity detail
  goal/new.tsx                    # formSheet
  goal/[id].tsx                   # formSheet
  filters.tsx                     # formSheet
  welcome.tsx
  help.tsx
  privacy.tsx

src/
  data/
    calendars.ts                  # expo-calendar wrapper
    events.ts                     # TimeEvent projection (CALENDAR.md §5)
    settings.ts                   # persisted store + zod schema + migrations
  domain/                         # pure, no React, no native — 100% unit-testable
    categories.ts
    activities.ts
    goals.ts                      # progress maths (fixed, see IMPROVEMENTS §1.1)
    aggregate.ts                  # title/category duration maps
    week.ts                       # locale week rules
  ui/
    AppText.tsx                   # semantic role → native primitive
    Section.tsx  Row.tsx  Card.tsx
    theme/{colors,type,spacing}.ts
  features/
    summary/{WeeklyChart,TopActivities,EmptyState}.tsx
    goals/{GoalCard,GoalEditor,ProgressRing}.tsx
```

The key structural change from the old codebase: **`domain/` contains no React and no
native imports.** Today the goal maths lives inside `GoalCard.res`'s render body
(120 lines of computation before the first JSX tag), which is why it is untested and why
the partial-week bug went unnoticed. Extracted, it becomes a pure function over
`(goal, events, now)` and can be exhaustively unit-tested with no simulator.

---

## 6. Data & state

- **Settings**: one JSON document, as today, but validated with a schema (`zod`/`valibot`)
  and **versioned with explicit migrations**. The current `decodeJsonSettings` is 90 lines
  of hand-written decoders with `try/catch` per field for backward compatibility — a schema
  + migration list expresses the same intent in a fraction of the code, and fails loudly
  instead of silently resetting to defaults.
  Keep the calendar-id reconciliation logic (match by `id`, fall back to `title` + `color`);
  it exists because calendar ids differ across devices, and that is genuinely correct.
- **Events**: never persisted. Fetched per range, projected to `TimeEvent`, memoized.
- **Derived aggregates**: cached per `(rangeStart, rangeEnd, settingsHash)` — the current
  cache keys on range only and is nuked wholesale on any settings change.
- **State library**: none needed beyond React context + `useSyncExternalStore` for the
  settings store. If you want one, prefer a small store (`zustand`) over Redux. Notably,
  the `InteractionManager` + `setTimeout(0)` double-hop in `App.res:118-140` — a workaround
  for settings writes janking the UI — should disappear once writes are off the render path
  and the New Architecture is in play. Verify with the profiler rather than assuming.

---

## 7. Language: TypeScript or ReScript?

Being straight about this, because the old app is 100% ReScript and the ecosystem is not
dead:

| | Status on 2026-08-09 |
|---|---|
| `rescript` | **12.3.0**, 2026-05-19 — alive and well |
| `rescript-react-native` | **0.83.0**, 2026-04-23 — tracks RN closely |
| `@rescript/react` | **0.15.0**, 2026-04-16 |
| `rescript-react-navigation` | 7.0.5, **2025-04-11** — a year behind |
| `@expo/ui`, `expo-router` native tabs, `expo-calendar` (new API), `expo-glass-effect` | **no ReScript bindings exist** |

The entire value of this rewrite is in that last row. Those APIs are also the least
binding-friendly code in the ecosystem: `@expo/ui` is built on heterogeneous arrays of
`ModifierConfig` objects and per-platform component trees, and `expo-calendar`'s new API is
class-based shared objects with lazy getters. Hand-writing and then *maintaining* bindings
for all of it is a second project, and it is exactly the kind of maintenance load that
stalled LifeTime the first time.

**Recommendation: TypeScript**, and spend the saved effort on the product.

**If you want to keep ReScript**, the sane compromise is a hybrid: `src/domain/` in
ReScript (pure logic, where the type system pays for itself and no bindings are needed —
it compiles to plain JS modules that TypeScript imports), and the UI layer in TypeScript.
That keeps the part of ReScript that was actually earning its keep. What is not worth doing
is writing `@expo/ui` bindings.

---

## 8. Migration phases

| Phase | Content | Outcome |
|---|---|---|
| **0** | New Expo app, `expo-calendar` wired, calendars listed on screen | Proves the blocker is gone |
| **1** | Native tabs, 3 empty screens, semantic typography + `PlatformColor` | Proves "native on both" |
| **2** | Port `domain/` (categories, activities, aggregation, week rules) + **unit tests** | Logic locked down, bugs from SPEC §11 fixed |
| **3** | Summary: chart, top activities, empty states, filters | Feature parity on tab 1 |
| **4** | Goals: cards, editor, corrected progress maths | Feature parity on tab 2 |
| **5** | Settings, notifications, export/import (**with a settings importer for v1 backups**) | Feature parity, existing users keep their data |
| **6** | EAS internal distribution → TestFlight / Play internal | Testable on device |

Phase 5's importer matters: the old app's *Export Backup* dumps the settings JSON to the
clipboard. Accepting that exact format in the new app is the whole upgrade path for
existing users, and it costs one adapter function.

---

## 9. Sources

- [Expo SDK 57 changelog](https://expo.dev/changelog/sdk-57)
- [Expo UI documentation](https://docs.expo.dev/versions/latest/sdk/ui/)
- [Expo UI is now stable (SDK 56)](https://expo.dev/blog/expo-ui-stable-sdk-56)
- [Native tabs — Expo Router](https://docs.expo.dev/router/advanced/native-tabs/)
- [GlassEffect — Expo](https://docs.expo.dev/versions/latest/sdk/glass-effect/)
- [Integrating iOS 26 Liquid Glass with Expo UI and SwiftUI](https://expo.dev/blog/liquid-glass-app-with-expo-ui-and-swiftui)
- [Calendar — Expo](https://docs.expo.dev/versions/latest/sdk/calendar/)
- [Material 3 Expressive overview](https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/)
- [@callstack/liquid-glass](https://github.com/callstack/liquid-glass) — non-Expo alternative
