# Slice 0: scaffold

Done 2026-11-10 (docs/spec/60-slices.md, slice 0; INTENT.md D12).

## What changed

- The v2 UI attempt moved out of the way, untouched, to `quarry/v2/` (`app/`, `src/data`,
  `src/features`, `src/ui`, its `package.json` and `app.json`). It is excluded from
  `tsconfig.json` and is reused only where a slice proves a piece (spec/50-architecture.md).
- `package.json` is the Expo SDK 58 set proven by [spike 1](../../spikes/01-sdk58-build.md),
  minus libraries nothing uses yet (`expo-web-browser`, `expo-device`, `expo-image`,
  `expo-font`, `@expo/ui`). Calendar, notifications, SQLite, Skia and localisation come back
  with the slices that need them, each after a prebuild and launch (spec/50-architecture.md,
  "Libraries"). Scripts, Jest config and dev dependencies carried over.
- `app.json`: same identity (`io.moox.LifeTime`, `io.moox.lifetime`, D16); plugins reduced to
  `expo-router` and `expo-splash-screen`; React Compiler on, as in the template the spike built.
- `app/`: a placeholder Stack with the large title `Your LifeTime`, following the conditions
  of [spike 2](../../spikes/02-large-title.md). Slice 1 replaces it.
- `src/domain` and its 125 tests: unchanged, green.
- New check `scripts/check-domain.mjs` in `npm run check`: `src/domain` may not import React
  Native or Expo at runtime. Shown to fail on a planted `import { Platform } from 'react-native'`.
- TestFlight workflow pinned to Xcode 27.2 (was 26.6, kept only because SDK 57 lacked UIScene).
  Fastlane needed no change: it prebuilds and finds the workspace by name.
- Maestro: `.maestro/launch.yaml`.

## Evidence

- [launch-ios27.2.png](./launch-ios27.2.png): Release build, iPhone 17 Pro, iOS 27.2 (24B8117),
  Xcode 27.2, taken by `maestro test .maestro/launch.yaml`, all four steps `COMPLETED`.
- [check.txt](./check.txt): `npm run check`, all green.

## Not verified

- The TestFlight workflow on Xcode 27.2: it runs only on a `[testflight]` commit, which comes
  at the alpha1 milestone. Whether GitHub's `macos-latest` image ships Xcode 27.2 is unchecked.
- Android: not built (iOS first, D7).

## Lessons

- Delete the generated `ios/` (gitignored) when the SDK changes; a stale SDK 57 project made
  CocoaPods fail. `expo prebuild --clean` regenerates it.
- CocoaPods needs `LANG=en_US.UTF-8`.
- `expo run:ios` launches through a deep link that leaves an "Open in LifeTime?" alert, which
  blocks Maestro. Reboot the simulator, or launch with `simctl launch`, before a flow.
- Simulator language set with `defaults write -g AppleLanguages` applies after a reboot only.
