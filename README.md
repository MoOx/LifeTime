# LifeTime

[![CI](https://github.com/MoOx/LifeTime/actions/workflows/ci.yml/badge.svg)](https://github.com/MoOx/LifeTime/actions/workflows/ci.yml)
[![iOS to TestFlight](https://github.com/MoOx/LifeTime/actions/workflows/ios-testflight.yml/badge.svg)](https://github.com/MoOx/LifeTime/actions/workflows/ios-testflight.yml)

LifeTime turns the calendars already on your phone into a report of where your time goes.
No account, no server, nothing to log by hand — it reads the events you already write, and
tells you what you actually spent your week on.

Built with Expo SDK 57 around one rule:

> **Never hand-write a font size, a system colour, a tab bar, a list row or a sheet.
> Name the role; let SwiftUI and Jetpack Compose render it.**

Which is how the same codebase gets Liquid Glass and Dynamic Type on iOS 26, and Material 3
with Material You dynamic colours on Android — instead of one platform's design language
replayed on the other.

---

## Status

This is **v2, a rewrite in progress**. v1 (ReScript + React Native 0.67, shipped 2022) is
preserved on the [`main`](https://github.com/MoOx/LifeTime/tree/main) branch and documented
in [docs/SPEC.md](docs/SPEC.md).

**Verified:** `tsc --noEmit` clean, 62 unit tests green, bundles for iOS and Android.
**Not yet verified:** nothing has run on a device — that is the next step.

Done: native tabs, calendar access, semantic typography, system colours, the pure domain
layer with v1's goal-progress bug fixed, v1 backup import, and first-pass Summary / Goals /
Settings / Filters / Activity screens.

Missing: the six-week chart carousel, the contextual empty states, the goal editor and its
progress ring, notifications, and the i18n catalogue.

---

## Documentation

| Document | What it covers |
|---|---|
| [docs/SPEC.md](docs/SPEC.md) | Full spec of v1, reverse-engineered from the code — the parity target |
| [docs/IMPROVEMENTS.md](docs/IMPROVEMENTS.md) | Prioritised proposals: correctness fixes, product, engineering |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | The v2 stack, and how each screen maps onto native components |
| [docs/CALENDAR.md](docs/CALENDAR.md) | Why the old calendar library blocked the project, and what replaces it |
| [docs/RELEASE.md](docs/RELEASE.md) | Building, distributing and shipping to TestFlight |

---

## Getting started

Requires Node (see [.node-version](.node-version)). `@expo/ui`, `expo-glass-effect` and
`expo-calendar` all contain native code, so **Expo Go will not run this app** — you need a
real build.

**On a Mac, build and run locally — nothing else to install:**

```sh
npm install
npm run ios           # expo run:ios — prebuild, pod install, Xcode, launch
npm start             # expo start --dev-client, once a build is installed
```

`npm run ios` produces a **Debug** build, which matters more than it sounds: assertions
are compiled in, so a missing native component names itself instead of segfaulting. It is
the fastest loop by a wide margin — no queue, no upload, no TestFlight.

**Shipping to TestFlight** goes through Fastlane and
[`MoOx/certificates`](https://github.com/MoOx/certificates):

```sh
npm run testflight    # bundle exec fastlane ios beta
```

**EAS is optional here** — signing already goes through `match`, so `eas-cli` is
deliberately *not* a dependency: it pulls 337 packages and 141 MB that every `npm ci`
would pay for, including on the macOS runner. The scripts fetch it on demand instead, so
they work with no global install:

```sh
npm run build:preview # npx eas-cli build --profile preview --platform all
npm run eas -- whoami # any other eas command
```

Checks, the same ones CI runs:

```sh
npm run check         # SDK version drift + tsc --noEmit + jest
```

`check:sdk` is not ceremony: hand-pinning `react-native-screens` one minor ahead of what
the SDK expects is what crashed build 2 on launch. See
[docs/RELEASE.md](docs/RELEASE.md) §10, "Post-mortem".

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
  domain/                   pure logic — no React, no native imports, fully testable
  data/                     the only files that touch native modules
  ui/                       AppText (per-platform native text), Section (Host), theme
  features/                 screen-specific components

fastlane/                   TestFlight lane, backed by the private MoOx/certificates repo
```

The important boundary is `src/domain/`: **no React, no native imports.** In v1 the goal
maths lived inside a component's render body, which is why it had no tests and why the
weekend bug shipped. Here it is a pure function with a regression test for exactly that
bug (`src/domain/__tests__/goals.test.ts`).

---

## Shipping

TestFlight builds go through [`MoOx/certificates`](https://github.com/MoOx/certificates),
which holds the signing material. The project itself stores no certificate — see
[docs/RELEASE.md](docs/RELEASE.md) §10 for the three GitHub secrets it needs.

```sh
git tag v2.0.0 && git push --tags   # or Actions → iOS to TestFlight → Run workflow
```

---

## License

[MIT](LICENSE)
