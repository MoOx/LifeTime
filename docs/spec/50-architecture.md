# Architecture

Supersedes [ARCHITECTURE.md](../ARCHITECTURE.md), which described the v2 attempt.

## Starting point (D12)

A **clean Expo SDK 58 scaffold** (React Native 0.88, UIScene life cycle, so Xcode 27 is
possible). The current tree is a quarry, now in `quarry/v2/` (slice 0). It is replaced on this branch by moving it out, not
by editing it in place.

| Carried over from the start | Condition |
|---|---|
| `src/domain` and its tests | Re-validated against 10-model.md |
| `scripts/check-*`, `npm run check` | |
| TestFlight workflow, fastlane match, `docs/RELEASE.md` | Xcode updated once SDK 58 builds under it |
| `.maestro/`, `scripts/v1/` | |

| Carried over only after a spike validates it | Spike |
|---|---|
| `AppText`, theme, for what React Native draws | 3, done: [docs/spikes/03-grouped-lists.md](../spikes/03-grouped-lists.md) |
| v2's React Native `List.tsx` | Not carried: lists are SwiftUI's `Form` (D27, [spike 4](../spikes/04-expo-ui-lists.md)) |
| Chart | Done in slice 2 with React Native views, no Skia: [slices/2/](../slices/2/README.md) |
| Goal ring | Proven on the simulator in slice 6, before Goals are built on it |
| Screens from `app/` | Rewritten from 30-screens.md, reusing code where it passes |

Bundle id stays `io.moox.LifeTime`, package `io.moox.lifetime` (D16).

## Layout

```
app/                     expo-router routes, thin
src/domain/              pure TypeScript and tests; no React Native import
src/sources/             one file per source, implementing Source
src/data/                SQLite, settings store, hooks
src/ui/                  design system
src/features/            screen parts
modules/lifetime-native/ local Expo module, only when a library will not do
```

Rule enforced by a check: `src/domain` imports nothing from React Native or Expo, except
types.

## Libraries

| Need | Choice | Status |
|---|---|---|
| Routing, tabs, headers | expo-router `Stack`, native tabs; `react-native-screens/experimental` on Android if its spike passes at the Android pass | iOS proven: [spike 2](../spikes/02-large-title.md) |
| Calendar | Own Expo module, `modules/lifetime-calendar` (read-only; change signal; E2E-only writes) | Slice 4 |
| Health iOS | `@kingstinct/react-native-healthkit` | Spike 4 |
| Health Android | `react-native-health-connect` | Android slice |
| Storage | `expo-sqlite`; settings as one JSON document | |
| Chart | React Native views in a SwiftUI page-style `TabView` | Slice 2 |
| Goal ring | `@shopify/react-native-skia` 2.14 | Done in slice 6: [slices/6/](../slices/6/README.md) |
| Lists, native controls | `@expo/ui` (SwiftUI on iOS) wherever it has the component (D27) | Lists and hosted RN views: [spike 4](../spikes/04-expo-ui-lists.md); each control by its first slice |
| Icons | `expo-symbols`, both platform names | |
| Notifications | `expo-notifications`; actually scheduled, tested | |
| On-device model | Own module for batching, pacing and guardrail bisection; `expo-ai` only if spike 6 shows it suffices | Spike 6 |
| Crash reporting | None: no third-party service, as promised on the Privacy screen | |

**Rule:** no library is added before a prebuild and launch on the target Xcode proves it.

## Data flow

Alpha1: `calendar or demo → events → rules → aggregate / goals → screens`, the current domain.
The current source (demo or real) is a single decision made in one place (`src/data/source.ts`
today). Alpha2 inserts observations and the overlap rules between sources and aggregation
([10-model.md](./10-model.md)).

## Background work

None in the first release. Sources are read on launch and on foreground. A weekly report does
not need it, health stores keep their data, and it removes the background-delivery entitlement
and a class of review risk. `expo-background-task` comes with visits and usage events, which
must be polled.

Notifications are local and rescheduled on launch and on any settings change.

## Internationalisation

Dates and numbers: always `Intl` through `src/domain/time.ts`, with the Hermes guard in
`scripts/check-intl.mjs`. Copy: English first (D15), kept in one place so translation is one
slice.

## Verification

Native first ([INTENT.md](../INTENT.md) §5). `scripts/preview.mjs` is never used to judge UI.

| Layer | Tool | Runs |
|---|---|---|
| Domain | Jest, `npm run check` | Every commit |
| Static | Typecheck, routes, Intl, no PCC entitlement, domain purity | Every commit |
| iOS UI | Maestro on a simulator: flows and screenshots, light and dark, default and large text | Every slice, on the Mac |
| Android UI | Maestro on an emulator | From the Android pass |
| Reality | MoOx's iPhone through TestFlight | Milestones |

**Xcode:** SDK 58 is built with Xcode 27.2; v1 stays on 26.6. Maestro drives simulators with
the default Xcode (`docs/reference/v1/BUILD.md`).

**Lesson from the v1 captures:** a passing flow proves navigation and nothing about the
picture. One passing run had a system banner over two screens, and another had two identical
"different" screens. Every slice's screenshots are opened and compared, by eye, against the
capture of the same screen; a flow never stands as evidence alone.

## CI

`npm run check` on every push. TestFlight only with `[testflight]` in a commit message, at the
milestones in [60-slices.md](./60-slices.md). Native verification stays local (D8).
