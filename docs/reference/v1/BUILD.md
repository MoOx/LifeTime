# Rebuilding v1 to capture it

v1 is React Native 0.67.1 + ReScript 9, last built in March 2022 (`main` branch). This
file records how it was made to build again on a 2026 Mac — **only to take native
screenshots of it**. Nothing here is committed to `main`; every patch lives in the
`../LifeTime-v1` worktree that `scripts/v1/setup.sh` creates.

## Machine

*To be filled in by step 0 of [NEXT.md](../../NEXT.md).*

## Toolchain that worked

*To be filled in by step 1: exact versions of macOS, Xcode, the simulator runtime,
Node, CocoaPods, ReScript, and any environment variables.*

## Facts about v1 that shape the build

| Fact | Source | Consequence |
|---|---|---|
| Node 16, Ruby 2.7.4, CocoaPods ~> 1.11 | `.node-version`, `.ruby-version`, `Gemfile` on `main` | Use Node 16 (fnm). A modern CocoaPods is tried first; the Ruby 2.7.4 pin is a last resort, as it is hard to compile on recent macOS |
| `prepare` generates SVG components, `src/md/*.json`, the ReScript output, and the splash screen | `package.json` on `main` | The Xcode project references `BootSplash.storyboard`, which is git-ignored, so the build fails until `npm run bootsplash` has run |
| `prepare` also runs `husky install` | same | It is skipped: husky does not need to run in a worktree |
| ReScript output (`.bs.js`) is not committed | `git ls-tree main` | `rescript build` must succeed |
| Hermes is on, Flipper is on, platform iOS 11.0 | `ios/Podfile` on `main` | Flipper is removed, the deployment target raised, Hermes kept unless it fails |
| Release product `LifeTime` → bundle id `io.moox.LifeTime`; Debug `LifeTime.Dev` | `project.pbxproj` on `main` | Release is used for captures: JS is bundled, there are no dev overlays, and no Metro is needed. Its bundle id is the new app's, hence a dedicated simulator |
| No `UIApplicationSceneManifest`; AppDelegate-only life cycle | `ios/LifeTime/Info.plist`, `AppDelegate.m` on `main` | An app built with the iOS 27 SDK is refused at launch on iOS 27 unless it adopts scenes. So v1 is built with **Xcode 26.6** (`/Applications/Xcode-26.6.0.app` on MoOx's Mac — `scripts/v1/lib.sh` selects it through `DEVELOPER_DIR`) and run on an iOS 26.x runtime |
| Demo data is built in: Settings → Danger Zone → Create Demo Calendar → Inject | `SettingsDangerZone.res`, `e2e/demo.e2e.js` on `main` | The captures use v1's own demo data, as its App Store screenshots did |

## Known symptoms and fixes

Expected from experience with React Native 0.6x on newer Xcode releases; **not yet
verified on this project**. `scripts/v1/setup.sh` applies the ones marked *auto*; add a
row for every new problem met.

| Symptom | Cause | Fix |
|---|---|---|
| `pod install` fails downloading `boost_1_76_0.tar.bz2` | `boostorg.jfrog.io` no longer hosts Boost | *auto*: point `node_modules/react-native/third-party-podspecs/boost.podspec` at `https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2` (same archive and checksum) |
| Flipper / `Flipper-Folly` compile errors | Flipper does not build with Xcode 15+ | *auto*: remove `use_flipper!()` (it is debug-only tooling) |
| `no template named 'unary_function'` / `binary_function` in boost or folly | libc++ removed these in C++17 mode (Xcode 15+) | *auto*: add `_LIBCPP_ENABLE_CXX17_REMOVED_UNARY_BINARY_FUNCTION` to `GCC_PREPROCESSOR_DEFINITIONS` for every pod target |
| "deployment target 11.0 is not supported" or link errors on old targets | Xcode's minimum deployment target has moved up | *auto*: `platform :ios, '15.1'`, forced on every pod target after React Native's own post-install hooks, and in the app target |
| `Bad CPU type in executable` running `rescript` or `bsc` | ReScript 9 shipped x86_64 macOS binaries | Install Rosetta 2 (`softwareupdate --install-rosetta`) — needs MoOx |
| `error:0308010C:digital envelope routines::unsupported` | Node ≥ 17 with old webpack/Metro tooling | Make sure Node 16 is active (`fnm use 16`) |
| Hermes pod or `hermes-engine` link errors on arm64 simulator | Old prebuilt Hermes binary | Set `:hermes_enabled => false` (JSC) — `V1_HERMES=0 scripts/v1/setup.sh` |
| "Upload Debug Symbols to Sentry" build phase fails | No Sentry credentials | `SENTRY_DISABLE_AUTO_UPLOAD=true` (set by `scripts/v1/build.sh`); else delete the phase in the worktree |
| `patch-package` warns about `react-native+0.67.0-rc.6.patch` | Patch made against rc.6, installed 0.67.1 | Harmless if it applies; if a hunk fails, inspect it — it may matter for the calendar or gestures |
| App launches then is killed with a UIScene assertion | Built with the iOS 27 SDK and run on iOS 27 | Build with Xcode 26.6 (the default in `scripts/v1/lib.sh`) and run on an iOS 26.x runtime |

## Patches applied

*To be filled in by step 1: every change made inside the worktree, with the reason.*
