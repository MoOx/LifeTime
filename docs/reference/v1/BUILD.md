# Rebuilding v1 to capture it

v1 is React Native 0.67.1 + ReScript 9, last built in March 2022 (`main` branch). This
file records how it was made to build again on a 2026 Mac — **only to take native
screenshots of it**. Nothing here is committed to `main`; every patch lives in the
`../LifeTime-v1` worktree that `scripts/v1/setup.sh` creates.

## Machine

Inventory taken on 2026-11-09 (step 0 of [NEXT.md](../../NEXT.md)).

| Item | Value |
|---|---|
| macOS | 27.3 (26C5035r), arm64 |
| Disk | 926 GiB, **41 GiB free (96% used)**; Xcode DerivedData alone holds 43 GiB |
| Xcode | `/Applications/Xcode.app` 27.2 (27B52, the `xcode-select` default) and `/Applications/Xcode-26.6.0.app` 26.6 (17F113) |
| iOS simulator runtimes | 18.4, 26.5 (23F77), 27.0, 27.1 |
| iPhone device types | iPhone 17 Pro available (the `LifeTime v1` simulator uses it) |
| Node | 26.3.1 by default, through `fnm`; 16.13.2 and 16.14.2 and several 22/24 also installed |
| Ruby | 2.6.10 (system) |
| CocoaPods | 1.17.0. It wants `LANG=en_US.UTF-8` and warns about unbuilt gem extensions, harmlessly |
| Maestro | 2.12.1 |
| Java | OpenJDK 21.0.13 |
| Rosetta 2 | installed |
| Android | Android Studio, `emulator` and `adb` present; arm64 images for API 35, 36 and 37.2 beta 3; AVDs `Lyv_E2E_1` and `htn-pixel` (other projects') |

Everything steps 1 and 2 need is present; nothing had to be installed.

## Toolchain that worked

Verified on 2026-11-09: `docs/reference/v1/ios/00-launch.png` is the real Welcome screen,
and the app holds a 4.5 MB Hermes bytecode `main.jsbundle`.

| Item | Value |
|---|---|
| macOS | 27.3, arm64 |
| Xcode | 26.6 (17F113), selected through `DEVELOPER_DIR` by `scripts/v1/lib.sh` |
| SDK / runtime | iPhoneSimulator 26.5 SDK; iOS 26.5 runtime on an iPhone 17 Pro named `LifeTime v1` |
| Node | 16.x through `fnm`, passed to the bundle phase as `V1_NODE_BINARY` |
| Ruby / CocoaPods | newest rbenv Ruby (4.0.6) with CocoaPods 1.17.0, `LANG=en_US.UTF-8` |
| ReScript | 9, as locked by v1; its compiler ran without trouble under Rosetta or natively |
| JS engine | Hermes (the default); JSC was not needed |
| Environment | `CI=true` (v1's own switch to skip `sentry-cli`), `ONLY_ACTIVE_ARCH=YES`, `CODE_SIGNING_ALLOWED=NO` |

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

The first rows were expected from experience with React Native 0.6x; the rows from
"`rbenv: version 2.7.4`" down were met on this project on 2026-11-09.
`scripts/v1/setup.sh` and `build.sh` apply the ones marked *auto*; add a row for every
new problem met.

| Symptom | Cause | Fix |
|---|---|---|
| `pod install` fails downloading `boost_1_76_0.tar.bz2` | `boostorg.jfrog.io` no longer hosts Boost | *auto*: point `node_modules/react-native/third-party-podspecs/boost.podspec` at `https://archives.boost.io/release/1.76.0/source/boost_1_76_0.tar.bz2` (same archive and checksum) |
| Flipper / `Flipper-Folly` compile errors | Flipper does not build with Xcode 15+ | *auto*: remove `use_flipper!()` (it is debug-only tooling) |
| `no template named 'unary_function'` / `binary_function` in boost or folly | libc++ removed these in C++17 mode (Xcode 15+) | *auto*: add `_LIBCPP_ENABLE_CXX17_REMOVED_UNARY_BINARY_FUNCTION` to `GCC_PREPROCESSOR_DEFINITIONS` for every pod target |
| "deployment target 11.0 is not supported" or link errors on old targets | Xcode's minimum deployment target has moved up | *auto*: `platform :ios, '15.1'`, forced on every pod target after React Native's own post-install hooks, and in the app target |
| `Bad CPU type in executable` running `rescript` or `bsc` | ReScript 9 shipped x86_64 macOS binaries | Install Rosetta 2 (`softwareupdate --install-rosetta`) — needs MoOx |
| `error:0308010C:digital envelope routines::unsupported` | Node ≥ 17 with old webpack/Metro tooling | Make sure Node 16 is active (`fnm use 16`) |
| Hermes pod or `hermes-engine` link errors on arm64 simulator | Old prebuilt Hermes binary | Set `:hermes_enabled => false` (JSC) — `V1_HERMES=0 scripts/v1/setup.sh` |
| `error: A project slug is required` in the bundle and "Upload Debug Symbols" phases, and no bundle | `sentry-cli` wraps both phases and has no credentials; it ignores `SENTRY_DISABLE_AUTO_UPLOAD` at this version | *auto*: `CI=true`, v1's own switch to skip it (`build.sh`) |
| `patch-package` warns about `react-native+0.67.0-rc.6.patch` | Patch made against rc.6, installed 0.67.1 | Harmless if it applies; if a hunk fails, inspect it — it may matter for the calendar or gestures |
| App launches then is killed with a UIScene assertion | Built with the iOS 27 SDK and run on iOS 27 | Build with Xcode 26.6 (the default in `scripts/v1/lib.sh`) and run on an iOS 26.x runtime |
| `rbenv: version '2.7.4' is not installed` at `pod install` | v1's `.ruby-version`, picked up in the worktree | *auto*: `RBENV_VERSION` set to the newest installed Ruby |
| `library 'DoubleConversion' not found`, "Target dependency graph (1 target)" | Xcode 26.6 does not find the implicit dependency on `libPods-LifeTime.a` | *auto*: build the `Pods-LifeTime` scheme first (`build.sh`) |
| `-Wdeprecated-literal-operator` and `-Wbitwise-instead-of-logical` errors in Yoga | Yoga's podspec has `-Werror` and recent clang adds warnings | *auto*: drop `-Werror` from `Yoga.podspec`, before `pod install` |
| `no member named 'set_terminate' in namespace 'std'` in Sentry | Sentry 7.1.4 relied on a transitive `<exception>` | *auto*: prepend the include, after `pod install` |
| `missing '#include <sys/_types/_ucontext64.h>'` in Sentry | Same, with the iOS 26 SDK | *auto*: prepend the include, after `pod install` |
| App stays on the splash screen; `BUILD SUCCEEDED` but no `main.jsbundle`; `ERR_OSSL_EVP_UNSUPPORTED` in the log | The bundle phase evaluates `fnm env` and lands on the default Node (26), then swallows Metro's failure | *auto*: `NODE_BINARY` patched to read `V1_NODE_BINARY`; `build.sh` now fails if the bundle is missing |

## Capturing: what the flows had to learn

Met on 2026-11-09 while making `.maestro/v1/` work, with Maestro 2.12.1.

| Symptom | Cause | Fix |
|---|---|---|
| "iOS driver not ready in time", whatever the timeout; `DTServiceHubClient failed to bless service hub` | Under Xcode 26.6, Maestro's XCTest runner never comes up: the CoreSimulator in service is Xcode 27's | `capture.sh` drives the simulator with the default Xcode; 26.6 only builds |
| `Invalid path … for takeScreenshot` | Maestro 2 refuses paths outside its output folder | Flows write to a temporary folder, `capture.sh` copies the PNGs |
| System alert never tapped | An erased simulator inherits the Mac's language (French) | `capture.sh` sets `en_US` and reboots after each erase |
| `GoalEdit_category_bullet_*` not found | iOS merges a nested touchable into its row | Row id; with demo data the row opens the category, so the tap is offset onto the bullet |
| Element swipes do nothing on the week pager and the slider | Maestro's `swipe: from:` does not drive them | Slow swipes by coordinates; the week swipe asserts "Show This Week" and retries, because it sometimes does not page |
| Tap lands on the tab bar | A row under the translucent tab bar counts as visible | `centerElement: true` before tapping |
| App ends up in iOS Settings | A stray gesture on Goals reaches the reminders popin's Continue, which opens Settings when permission is not undetermined | Flow 01 closes the popin after capturing it |
| Calendar alert missed intermittently | It can take seconds to appear | Flow 01 waits for it |
| Banner "Ready for Apple Intelligence" over a capture | Shown shortly after a simulator's first boot | `_no-banner.yaml` before each shot of flow 02 |

Runs are not fully deterministic: flow 02 failed intermittently before these fixes. Check
every pass by eye; a green run can still hold a covered or duplicated screen.

## Patches applied

All inside the `../LifeTime-v1` worktree; none reaches `main`, and v1's behaviour and look are unchanged.

| File | Change | Reason |
|---|---|---|
| `ios/Podfile` | replaced by `scripts/v1/Podfile` | no Flipper, iOS 15.1, libc++ define |
| `ios/LifeTime.xcodeproj/project.pbxproj` | deployment target 15.1; `NODE_BINARY` reads `V1_NODE_BINARY` | Xcode minimum; Node 16 for Metro |
| `node_modules/react-native/third-party-podspecs/boost.podspec` | download URL | old host is gone |
| `node_modules/react-native/ReactCommon/yoga/Yoga.podspec` | `-Werror` removed | new clang warnings |
| `node_modules/react-native/ReactCommon/yoga/yoga/YGValue.h` | space removed in `operator""_pt` | applied before `-Werror` was dropped, harmless; `setup.sh` no longer does it |
| `ios/Pods/Sentry/.../SentryCrashMonitor_CPPException.cpp`, `SentryCrashMachineContext.c` | one `#include` each | headers no longer transitive |

These were found one at a time, so the final `setup.sh` has not been replayed from an empty worktree; each fix in it was applied by the same commands to the worktree that built.
