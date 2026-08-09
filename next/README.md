# LifeTime v2 — fresh Expo codebase

The rewrite of [LifeTime](../README.md) on Expo SDK 57, built around one rule:

> **Never hand-write a font size, a system colour, a tab bar, a list row or a sheet.
> Name the role; let SwiftUI and Jetpack Compose render it.**

Background reading, in order:

| Document | What it covers |
|---|---|
| [`../docs/SPEC.md`](../docs/SPEC.md) | What v1 does — the parity target |
| [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) | The stack and the native-UI mapping |
| [`../docs/CALENDAR.md`](../docs/CALENDAR.md) | Why the old calendar library had to go |
| [`../docs/IMPROVEMENTS.md`](../docs/IMPROVEMENTS.md) | What to build next |
| [`../docs/RELEASE.md`](../docs/RELEASE.md) | Building and shipping |

---

## Status

**Verified in CI-equivalent checks:** `tsc --noEmit` clean, 62 unit tests green, and the
app bundles for both platforms (`expo export --platform ios` / `--platform android`,
~1365 modules each).

**Not yet verified:** nothing has been run on a device or simulator. Layout, native
component behaviour and permission flows need a real device pass — start with
`eas build --profile development` (see [RELEASE.md](../docs/RELEASE.md) §4.2).

### Done

- Expo SDK 57 / RN 0.86 / React 19, New Architecture, typed routes
- `expo-router` **native tabs** — Liquid Glass on iOS 26, Material 3 on Android
- `expo-calendar` wired end to end, projected into the app's own `TimeEvent` type
- **Semantic typography** — SwiftUI Dynamic Type styles on iOS, Material 3 type scale on
  Android, zero hardcoded sizes outside the web fallback
- **System colours** via `PlatformColor`, including Material You on Android 12+
- Pure, fully tested `src/domain/` layer, with v1's goal-progress bug fixed
- **v1 backup import** — the JSON v1's *Export Backup* copies to the clipboard is accepted
  as input, so existing users keep their setup
- Summary, Goals, Settings, Filters and Activity screens at first-pass fidelity
- `eas.json` with development / preview / production profiles

### Not done

- Six-week paged chart carousel and the four contextual empty states (SPEC §4.2–4.3)
- Goal editor and progress ring (SPEC §4.7–4.8)
- Notifications (`expo-notifications`), Welcome / Help / Privacy screens, export & import UI
- i18n catalogue (the domain layer is already locale-driven; the copy is not)

---

## Running it

`@expo/ui`, `expo-glass-effect` and `expo-calendar` all contain native code, so **Expo Go
will not run this app**. Use a development build:

```bash
npm install
npm run build:dev        # eas build --profile development --platform all
npm start                # expo start --dev-client
```

Checks:

```bash
npm run check            # tsc --noEmit + jest
```

> `npx expo install --check` needs `api.expo.dev`; dependency versions here were pinned to
> the SDK 57 line by hand. Run it once on a machine with network access to confirm.

---

## Layout

```
app/                        expo-router routes
  _layout.tsx               providers, splash, root stack
  (tabs)/_layout.tsx        NativeTabs — the entire tab bar
  (tabs)/index.tsx          Summary
  (tabs)/goals.tsx          Goals
  (tabs)/settings.tsx       Settings (native list rows)
  activity/[title].tsx      One activity: category + events
  filters.tsx               Calendar filters (native sheet)

src/
  domain/                   pure logic — no React, no native imports, 100% testable
    time.ts week.ts         date maths, locale-driven week boundaries
    categories.ts           the 9 categories (data, not source constants)
    activities.ts           title → category matching rules + suggestions
    events.ts               TimeEvent, filtering, empty-state reasons
    aggregate.ts            duration maps, per-day breakdown
    goals.ts                goal model + the corrected progress maths
    settings.ts             persisted document shape + v1 migration
  data/                     the only files that touch native modules
    calendars.ts            expo-calendar wrapper + TimeEvent projection
    settingsStore.ts        expo-sqlite/kv-store + useSyncExternalStore
    locale.ts               weekStartsOn / locale tag from the OS
    useEvents.ts            range cache + foreground refresh
  ui/                       AppText (per-platform native text), Section (Host), theme
  features/                 screen-specific components
```

The important boundary is `src/domain/`: **no React, no native imports.** In v1 the goal
maths lived inside `GoalCard.res`'s render body, which is why it had no tests and why the
weekend bug shipped. Here it is a pure function and there is a regression test for exactly
that bug (`src/domain/__tests__/goals.test.ts`).

---

## Two things worth reading the code for

**`src/ui/theme/type.ts` + `src/ui/AppText.{ios,android}.tsx`** — the fix for "doesn't feel
native on Android". One semantic role table, resolved by SwiftUI on one side and Material 3
on the other. Compare with v1's `src/components/shareable/Theme.res`, which hardcoded the
iOS ramp and carried a per-OEM font-weight mapping table.

**`src/domain/goals.ts`** — progress measured in *scheduled* time rather than calendar
time. v1 judged a "every weekday" goal against a target that kept rising through the
weekend; the fix generalises the model to day / month / year periods for free.
