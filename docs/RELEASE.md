# Building, distributing and testing LifeTime

> Goal: **you can install a build on your phone in one tap, from a link, without a Mac and
> without Xcode.** And once a build is installed, JS-only changes reach it in seconds.
>
> Versions verified 2026-08-09: `eas-cli@21.7.0`, `expo-updates@57.0.12`,
> `expo-dev-client@57.0.10`.

---

## 1. What changes vs today

The current setup is Fastlane + Ruby + Bundler + `match` + local Xcode/Gradle, driven from
a Mac, with three GitHub Actions workflows pinned to `@v2` actions:

- `deps:ios:install` requires Ruby 2.6, CocoaPods and a working Xcode,
- `ios beta` requires `sync_code_signing(type: "appstore")` and a `match` repo,
- Android needs a local keystore + a Play service-account JSON,
- and `npm run prepare` must succeed (6 codegen steps) before any of it runs.

Every one of those is a reason not to touch the project after a few months away. **That is
the actual root cause of "non maintenu par faute de temps"** — not the code.

Two things fix it, independently:

- **EAS** removes the local toolchain entirely: the whole chain becomes `eas build` +
  `eas submit`, credentials are managed for you, and builds run on Expo's workers.
- **[`MoOx/certificates`](https://github.com/MoOx/certificates)** fixes the *other* half —
  the part that made the old Fastlane setup unmaintainable. The signing material is
  encrypted in a repository instead of living on one Mac, the App Store Connect API key
  replaces the Apple ID and its 2FA prompts, and a project needs exactly three GitHub
  secrets to ship. That is a genuinely different proposition from v1's `match` setup, and
  it is worth keeping — see §10.

---

## 1bis. Two paths, and when to use which

There are now **two** ways to ship this app, and they are complementary rather than
competing:

| | **EAS** (§2–§6) | **Fastlane + match** (§10) |
|---|---|---|
| Credentials | managed by Expo | your own, in [`MoOx/certificates`](https://github.com/MoOx/certificates) |
| Runs on | Expo's macOS workers | GitHub Actions `macos-15` |
| Best for | the daily loop: dev builds, internal distribution, `eas update` | the release path: signed App Store builds → TestFlight |
| Cost | free tier queues, ~$19/mo for priority | GitHub Actions minutes |

**Recommended split:** EAS for development and internal distribution (§4.1, §4.2 — the
fast feedback loop), Fastlane + match for TestFlight and the App Store (§10 — where you
want to own the signing material).

Both can coexist: they build the same project, and `expo prebuild` is what the
Fastlane lane uses to produce the Xcode project EAS would otherwise generate for you.

## 1ter. Building locally, which needs neither

On a Mac with Xcode, the shortest loop does not involve EAS *or* Fastlane:

```sh
npm run ios      # expo run:ios — prebuild, pod install, build, launch (simulator)
```

### Running on a physical device

```
CommandError: No code signing certificates are available to use.
```

`MoOx/certificates` is **App Store only** — `grep -i development` finds nothing in it. A
distribution certificate cannot sign a development build, and the App Store profile does
not list your device, so a device build has neither half of what it needs.

Two ways out.

**Once, through match** (the durable one, and it benefits every machine afterwards):

```sh
npm run signing:dev     # bundle exec fastlane ios development
npm run ios:device      # expo run:ios --device
```

The `ios development` lane is this project's addition on top of the template. It creates a
development certificate and profile, registers the plugged-in device
(`force_for_new_devices`), and stores all of it in the certificates repository next to the
App Store material. It needs `MATCH_PASSWORD`, `SECRETS_PASSPHRASE` and write access — so
run it locally, never in CI, which is why the lane refuses when `is_ci`.

**Or, for a one-off**, let Xcode do it: sign in under *Xcode → Settings → Accounts*, open
`ios/LifeTime.xcworkspace`, and in *Signing & Capabilities* tick "Automatically manage
signing" and pick your team. Xcode issues a development certificate itself. Nothing is
written to the certificates repository — and nothing survives the next
`expo prebuild --clean`, which regenerates `ios/`.

### "No profiles for 'io.moox.LifeTime' were found" — after running fastlane locally

```
❌ No profiles for 'io.moox.LifeTime' were found: Xcode couldn't find any iOS App
   Development provisioning profiles matching 'io.moox.LifeTime'. Automatic signing is
   disabled and unable to generate a profile. To enable automatic signing, pass
   -allowProvisioningUpdates to xcodebuild.
```

The suggestion in that message is a red herring: `expo run:ios` **already** passes
`-allowProvisioningUpdates` and `-allowProvisioningDeviceRegistration` whenever it
resolves a development team (`XcodeBuild.js`, and the team is printed a line earlier).

The real cause is the sentence before it — *automatic signing is disabled*. The `ios beta`
lane calls `update_code_signing_settings(use_automatic_signing: false, …)` to sign the
release archive with the match profile, and that setting is written into `ios/`. Since
`expo run:ios` reuses an existing `ios/` rather than regenerating it, the next device build
inherits manual signing and Xcode refuses to create a profile.

A fresh prebuild writes no `CODE_SIGN_STYLE` at all, so Xcode falls back to automatic:

```sh
npm run ios:reset      # expo prebuild --platform ios --clean
npm run ios:device
```

Rule of thumb: **after any local fastlane run, reset `ios/` before building from the CLI.**
The two disagree about signing by design — CI consumes a fixed profile, a developer wants
Xcode to mint one.

### "No script URL provided" on a device

```
No script URL provided. Make sure the packager is running or you have embedded a JS
bundle in your application bundle.
unsanitizedScriptURLString = (null)
```

A Debug build looks for Metro and **never falls back to the embedded bundle**, even though
`react-native-xcode.sh` does embed one for physical devices. The generated AppDelegate is
explicit:

```swift
override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
}
```

So `(null)` means the packager address could not be resolved. On Xcode 26 the usual reason
appears in `expo run:ios`'s first line:

```
Unexpected devicectl JSON version output from devicectl.
Connecting to physical Apple devices may not work as expected.
```

Expo CLI cannot parse `devicectl`'s version, so its device integration — including wiring
up the packager host — is degraded.

**To get JS running in Debug on a device**, reach Metro over the network instead:

```sh
npx expo start --dev-client --host lan     # Mac and iPhone on the same Wi-Fi
```

then launch the app from the home screen. If it still cannot connect, shake the device →
*Configure Bundler* → enter the Mac's LAN IP. That escape hatch does not depend on
`devicectl` at all.

**If the networks cannot be made to match**, build Release straight onto the device:

```sh
npm run ios:device:release
```

Release embeds the bundle, so it needs no Metro. It costs the assertions — `RCTAssert` is
compiled out — but it reproduces a release-configuration bug in about five minutes on the
real device, which is a far tighter loop than a TestFlight round-trip for bisecting.

This is a **Debug** build, and that difference is not cosmetic: `RCTAssert` and friends are
compiled in, so a Fabric component with no registered native class prints its own name
instead of segfaulting in a factory. Reach for this *first* when something crashes at
launch — §10's post-mortem cost two TestFlight round-trips to learn what a Debug build
says out loud.

## 2. Setup (once)

`eas-cli` is deliberately **not** a project dependency: it pulls 337 packages and 141 MB
that every `npm ci` would pay for, including on the macOS runner, for a CLI this project's
release path does not use. The `npm run build:*` scripts fetch it through `npx`, so they
work with no global install. If you would rather have `eas` on your PATH:

```bash
npm i -g eas-cli
```

Then, only if you want the EAS path at all:

```bash
eas login
eas init            # links the project, writes projectId into app.json
eas build:configure # creates eas.json
```

Credentials: let EAS manage them (`eas credentials`). It generates and stores the iOS
distribution certificate, provisioning profiles and the Android keystore. No `match` repo,
no keystore in git, no "where did I put the .p12" two years later.

You still need:
- an **Apple Developer Program** membership ($99/yr) for TestFlight and the App Store,
- a **Google Play Developer** account ($25 one-off).

For Android, internal-distribution APKs need neither.

---

## 3. `eas.json`

```json
{
  "cli": { "version": ">= 21.0.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "ios": { "simulator": false },
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": { "buildType": "apk" },
      "ios": { "simulator": false }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "…", "ascAppId": "…", "appleTeamId": "…" },
      "android": { "serviceAccountKeyPath": "./play-service-account.json", "track": "internal" }
    }
  }
}
```

`appVersionSource: "remote"` means EAS owns the build number — this replaces
`increment_build_number_in_xcodeproj` and `increment_version_code` from the Fastfile, and
removes the "two builds with the same number" class of failure.

---

## 4. The three ways to get the app on a phone

### 4.1 Internal distribution — **the answer to "que je puisse tester facilement"**

```bash
eas build --profile preview --platform all
```

You get a URL and a QR code. Open it on the device, tap install, done.

- **Android**: installs an APK directly. Nothing else needed.
- **iOS**: an ad-hoc build. Each test device's UDID must be registered once:
  ```bash
  eas device:create      # produces a QR/link that registers the device
  ```
  Registered devices are then included in every subsequent build's provisioning profile.

**No review, no waiting, multiple builds live at once.** TestFlight allows one active build
at a time and every build goes through processing (10–15 min) plus review for external
testers. For your own testing loop, internal distribution wins on every axis.

### 4.2 Development builds + `expo-dev-client` — the daily loop

```bash
eas build --profile development --platform ios   # once, or after any native change
npx expo start --dev-client                      # every day after that
```

A development build is a debug shell with the dev menu and Fast Refresh. Install it **once**
and iterate on JS at Metro speed on a real device — no rebuild, no cable, no Xcode. You only
rebuild when native dependencies change (adding `expo-calendar`, `@expo/ui`, a widget
target…).

Note: `@expo/ui`, `expo-glass-effect` and `expo-calendar` contain native code, so **Expo Go
will not run this app.** A development build is the replacement, and it is strictly better.

### 4.3 TestFlight / Play internal testing — for other people

```bash
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

or in one step:

```bash
eas build --profile production --platform ios --auto-submit
```

There is also a shortcut that builds and pushes to TestFlight in a single command:

```bash
npx testflight
```

Android equivalent: `eas submit --platform android` with `track: "internal"` (or `beta`).
The Play internal track has no review delay and accepts up to 100 testers by email.

**Use TestFlight when you want other humans to test.** Use §4.1 when it is just you.

---

## 5. EAS Update — ship JS in seconds

```bash
npx expo install expo-updates
eas update --branch preview --message "fix week boundary on Sundays"
```

Any device running a build on the `preview` channel picks up the new JS bundle on next
launch. This covers UI tweaks, copy fixes, logic changes — everything except native
dependency changes.

Practically: **one native build per month, twenty updates per week.** This is what makes a
side project survivable — the cost of shipping a small fix drops to a single command.

Channel → branch mapping: `development` / `preview` / `production` as declared in
`eas.json`. Point `production` at a `production` branch and you can hotfix a released app
without going through App Review (for JS-only changes, within Apple's rules).

---

## 6. CI

v1's three workflows (`build-ios.yml`, `build-android.yml`, `build-tests.yml`, all pinned
to `@v2` actions and requiring a macOS runner for iOS) are replaced by two:

| Workflow | Runs on | What it does |
|---|---|---|
| `.github/workflows/ci.yml` | `ubuntu-latest` | `tsc --noEmit`, `jest`, and an `expo export` for both platforms |
| `.github/workflows/ios-testflight.yml` | `macos-15` | the signed TestFlight build (§10) |

The `bundle` job in `ci.yml` is worth the extra minute: `expo export` resolves the whole
module graph and runs every config plugin, so a broken `app.json` or a missing native
dependency fails on a Linux runner in ~2 minutes instead of 20 minutes into an Xcode
archive.

If you also want cloud builds on every push to `main`, add:

```yaml
# .github/workflows/build.yml
name: Build
on:
  push: { branches: [main] }
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .node-version, cache: npm }
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: '${{ secrets.EXPO_TOKEN }}' }
      - run: npm ci
      - run: eas build --profile preview --platform all --non-interactive --no-wait
```

Note this runs on `ubuntu-latest` even for iOS — the macOS worker is EAS's, not GitHub's.

`EXPO_TOKEN` comes from `eas whoami`/expo.dev account settings.

---

## 7. Store assets

Fastlane's `frame_screenshots` + the Detox screenshot run can be kept — but the modern,
lighter path is **Maestro** flows producing screenshots on both platforms
(see [IMPROVEMENTS.md](./IMPROVEMENTS.md) §C.2), with `eas submit`'s metadata support (or
`fastlane deliver`, kept solely for metadata) for upload.

v1's frame assets (`fastlane/screenshot-background.heic` and the bundled Open Sans family,
~2.2 MB) went out with the rest of v1 when the tree was flattened. They are still the
app's store identity and remain perfectly usable — recover them from `main` when you get
to store screenshots:

```sh
git checkout main -- fastlane/screenshot-background.heic fastlane/screenshot-font-open-sans
```

---

## 8. Cost

| | |
|---|---|
| EAS free tier | limited concurrent builds, queue can be long |
| EAS paid | from ~$19/mo for priority builds |
| Local builds | `eas build --local` runs the same recipe on your machine — free, needs Xcode/Android SDK |
| Apple Developer | $99/yr (required for TestFlight + App Store) |
| Google Play | $25 one-off |

For a side project: **free tier + `eas build --local` when you're impatient** is a perfectly
workable combination.

---

## 9. Recommended day-to-day loop

```bash
# once per month, or when native deps change
eas build --profile development --platform all

# every day
npx expo start --dev-client

# when you want to test a real build, or hand it to someone
eas build --profile preview --platform all      # → QR code → install

# when it's good
eas update --branch preview -m "…"              # JS-only, seconds
eas build --profile production --platform all --auto-submit
```

---

## 10. TestFlight through `MoOx/certificates`

The private [`MoOx/certificates`](https://github.com/MoOx/certificates) repository holds the
iOS signing material and is already wired up for this project. It is **Expo-aware**: its
Fastfile runs `expo prebuild --clean` and then re-applies manual signing, which is exactly
what a managed project needs.

### What is already in place

- **A distribution certificate** and an **App Store provisioning profile for
  `io.moox.LifeTime`** — `make status` in that repo reports `ready`.
- An **App Store Connect API key**, encrypted (`secrets/ios/app-store-connect-api-key.json.enc`),
  so no Apple ID password or 2FA dance in CI.
- Templates, copied into this project:

| File | Role |
|---|---|
| `fastlane/Fastfile` | the `ios beta` lane: match → prebuild → sign → build → TestFlight |
| `fastlane/Appfile`, `Matchfile` | identity and match storage config |
| `Gemfile` | fastlane, cocoapods, xcodeproj |
| `.env.example` | the values to fill locally |
| `.github/workflows/ios-testflight.yml` | the CI job |

### Bundle identifiers — read this before the first run

Apple bundle IDs are **case-sensitive**, and the stored profile is
`AppStore_io.moox.LifeTime`. So:

- **iOS**: `io.moox.LifeTime` — set in `app.json` (`ios.bundleIdentifier`) and
  verified against the generated Xcode project.
- **Android**: `io.moox.lifetime`, lowercase, matching the package already on Play. The
  Appfile keeps them separate via `ANDROID_PACKAGE_NAME`.

Getting this wrong produces `No profile for team 'XXX' matching '...' found`, which is the
first entry in that repo's troubleshooting list for good reason.

### The three GitHub secrets

On `MoOx/LifeTime` → *Settings → Secrets and variables → Actions*:

| Secret | Value |
|---|---|
| `CERTIFICATES_DEPLOY_KEY` | ed25519 **private** key of a read-only deploy key registered on `MoOx/certificates`, including the trailing newline |
| `MATCH_PASSWORD` | the match passphrase |
| `SECRETS_PASSPHRASE` | the `secrets/` passphrase |

Generating the deploy key (from `docs/03-sharing-access.md` in that repo):

```sh
ssh-keygen -t ed25519 -N "" \
  -C "deploy key: LifeTime -> MoOx/certificates" \
  -f ~/.ssh/certificates_lifetime
```

Public half → `MoOx/certificates` → *Settings → Deploy keys*, **without** write access.
Private half → the `CERTIFICATES_DEPLOY_KEY` secret above.

### Running it

Three ways, and the first one only works once this is on `main`:

```sh
# 1. Actions → iOS to TestFlight → Run workflow   (needs the workflow on main)
# 2. a release tag
git tag v2.0.0 && git push --tags
# 3. from any branch, before the merge:
git commit --allow-empty -m "Ship a build [testflight]" && git push
```

**Why the marker.** GitHub only registers a `workflow_dispatch` workflow that exists on
the **default branch**; dispatching from a feature branch returns `404 Not Found`. So the
workflow also listens to `push` on `branches: ["**"]` and gates itself on an `if:` that
requires either a `v*` tag or `[testflight]` in the commit message — otherwise every push
would trigger a 20-minute signed build. Drop the marker once this is merged. This is the
same arrangement as `MoOx/HideTheNotch`.

### Xcode is pinned to 26.6 — and must not drift up

The workflow pins `xcode-version: "26.6"`. It can fail in both directions:

**Too old / wrong.** `latest-stable` once selected Xcode 26.3, whose Swift compiler fails
on Expo's own code:

```
expo-modules-jsi/.../JavaScriptCodable+Date.swift:53:50:
error: type of expression is ambiguous without a type annotation
```

**Too new.** Xcode 27's SDK makes the **UIScene life cycle mandatory**, and Expo SDK 57 /
React Native 0.86 do not adopt it — nothing in the dependency tree declares
`UIApplicationSceneManifest`. UIKit then refuses to start the app at all:

```
_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption
Application failed to launch: UIScene life cycle is required for apps built with this SDK.
```

This is not theoretical: it is what a local `npm run ios:device:release` built with
Xcode 27 does on an iOS 27 device. And it is dated — **when GitHub's `macos-latest` image
defaults to Xcode 27, an unpinned build starts producing binaries that cannot launch**,
for this project and for `MoOx/HideTheNotch` alike. The pin is the protection; raise it
only once Expo ships UIScene adoption.

Note the two axes are independent: the **device's** iOS version does not matter here, only
the **SDK the binary was built against**. An SDK-26 build runs on iOS 27; an SDK-27 build
of this app runs nowhere.

### `APPLE_TEAM_ID` is a repository *variable*, not a secret

Team IDs are not secret — they appear in every provisioning profile. Following the
HideTheNotch convention, the workflow reads `${{ vars.APPLE_TEAM_ID }}` from
*Settings → Secrets and variables → Actions → Variables*. The preflight step reports it as
missing within 30 seconds rather than letting fastlane fail obscurely ten minutes in.

(For reference, v1 built against team `DHLLCP4Q6E`, per its `project.pbxproj`.)

Locally (needs macOS + Xcode):

```sh
cd next
cp .env.example .env      # fill MATCH_PASSWORD and SECRETS_PASSPHRASE
bundle install
bundle exec fastlane ios beta
```

The workflow runs `npm run check` (typecheck + tests) before the build, so a broken commit
fails in one minute instead of twenty.

### First run, for reference

Run [31320473641](https://github.com/MoOx/LifeTime/actions/runs/31320473641) on `ab1a659`,
`macos-latest`, **11 min 24 s** end to end, concluding with *"Successfully uploaded the new
binary to App Store Connect"*. Where the time goes, per fastlane's own summary:

| Step | Time |
|---|---|
| `match` (certificate + profile) | 4 s |
| `expo prebuild --platform ios --clean` | 51 s |
| `build_app` (archive + export) | 464 s |
| `upload_to_testflight` | 83 s |

So the archive is ~70 % of the wall clock, and the `npm run check` gate ahead of it costs
about a minute — a good trade against discovering a type error after eight minutes of
Xcode.

Two follow-ups worth doing at some point:

- **Pin the Xcode version.** The run recorded which one the image defaulted to (step
  *"Xcode version in use"*). Pinning it explicitly stops the build from drifting the day
  GitHub updates the image — without going back to `latest-stable`, which is broken.
- `webfactory/ssh-agent@v0.9.1` still targets Node 20 and is being force-run on Node 24.
  Harmless today, worth watching.

### Post-mortem: the launch crash was one string in the wrong place

A Debug build on the device, run from Xcode, printed in one line what four TestFlight
builds and five CI diagnoses could not:

```
Text strings must be rendered within a <Text> component.
*** Assertion failure in -[RCTComponentViewFactory createComponentViewWithComponentHandle:]
reason: 'ComponentView with componentHandle `4514895564` (`RawText`) not found.'
```

**`RawText`** is the Fabric component for a bare string rendered outside a `<Text>`. It has
no native view class on iOS, so the factory finds nothing — and in Release, where the
assertion above is compiled out, it dereferences a missing map entry instead and segfaults
at `0x18`.

The offending line was in the very first screen the app shows:

```tsx
<Button onPress={onRequest}>Continue</Button>   // ✗
<Button onPress={onRequest} label="Continue" /> // ✓
```

`@expo/ui`'s `Button` renders its children **raw** into the native SwiftUI button:

```tsx
label={!children ? label : undefined}
…
{children as React.ReactElement | undefined}
```

`ListItem` is the opposite — it has a `wrapStrings` helper that puts bare strings into a
`Text` for you — which is why passing strings there was fine and made the pattern look
safe. And `Button`'s `children` is typed `React.ReactNode`, so the compiler accepts a
string without complaint. Text goes in `label`; `children` is for elements.

**What made this expensive**, worth recording:

- The Release crash names nothing. Every layer of evidence pointed at "a Fabric component
  is not registered", which is true and useless — `RawText` is *supposed* to be
  unregistered.
- Three hypotheses were tested and wrong: dependency drift, `@expo/ui` not linking,
  `react-native-screens`. Each cost a build.
- Three diagnostic harnesses were themselves buggy: `timeout` does not exist on macOS,
  `cancel-in-progress` killed a live run from a skipped one, and a Debug simulator build
  with no Metro ran none of the app's code while reporting success.
- The simulator run that reported "still running after 45s" should not be trusted either:
  the same code path would have hit the same crash there.

The lesson is cheap to state and was available from the start: **a Debug build on the
device says the answer out loud.** Reach for `npm run ios:device` before building
anything else.

### Post-mortem: build 2 crashed on launch (a real bug, but not this one)

Build 2 uploaded cleanly and then segfaulted the moment it opened, on an iPhone 17 Pro
running iOS 27 beta:

```
Exception Type:  EXC_BAD_ACCESS (SIGSEGV)
Exception Subtype: KERN_INVALID_ADDRESS at 0x0000000000000018

Thread 0 Crashed:
0  React  -[RCTComponentViewFactory createComponentViewWithComponentHandle:] + 172
1  React  -[RCTComponentViewRegistry _dequeueComponentViewWithComponentHandle:]
3  React  RCTPerformMountInstructions(...)
```

**Cause: dependency drift.** Three packages were pinned by hand rather than by
`npx expo install`, because `api.expo.dev` was unreachable from the machine that scaffolded
the project:

| Package | Shipped | Expo SDK 57 expects |
|---|---|---|
| `react-native-screens` | 4.27.0 | 4.26.0 |
| `react-native-safe-area-context` | 5.8.1 | 5.7.0 |
| `react` | 19.2.8 | 19.2.3 |

Two of those own the components on the very first mount: `safe-area-context` provides
`RNCSafeAreaProvider`, `screens` provides the stack and the native tabs. React Native 0.86
ships React as a **prebuilt** framework, so a third-party Fabric component compiled against
different codegen output never registers with the component view factory — and the factory
dereferences a missing map entry rather than failing gracefully. Hence a null-pointer read
at offset `0x18`, during the first mounting transaction, before a single pixel.

Note what *did not* catch it: the build succeeded, the archive signed, the upload passed,
`tsc` was clean and 62 tests were green. Nothing short of launching the binary would have
surfaced it.

**Guard added.** `npm run check:sdk` (`scripts/check-sdk-versions.mjs`) diffs the project
against `expo/bundledNativeModules.json`, the reference list `expo` already ships. It is
part of `npm run check`, so it runs in CI *and* in the TestFlight job before the archive.
Unlike `npx expo install --check` it needs no network, which is precisely the condition
under which this bug was introduced.

It checks **two** things, and the second one only exists because the first version of this
script was not enough:

- declared ranges in `package.json` against the SDK's,
- **installed** versions in `node_modules` against the SDK's range — including packages
  nothing declares.

That second check immediately turned up a drift nobody had noticed:
`react-native-gesture-handler` **3.1.0** installed against an SDK expecting **~2.32.0** —
a major version ahead, on yet another module that registers Fabric components, pulled in
purely transitively. Along with `react-native-reanimated` (4.5.3 vs 4.5.1) and
`react-native-worklets` (0.11.3 vs 0.10.1), which additionally made `npm ci` refuse the
lockfile since `expo-modules-core` peer-requires worklets `<= 0.10.x`.

Final state, all six aligned:

| Package | Installed | SDK expects |
|---|---|---|
| `react` / `react-dom` | 19.2.3 | 19.2.3 |
| `react-native-screens` | 4.26.2 | ~4.26.0 |
| `react-native-safe-area-context` | 5.7.0 | ~5.7.0 |
| `react-native-gesture-handler` | 2.32.0 | ~2.32.0 |
| `react-native-reanimated` | 4.5.1 | 4.5.1 |
| `react-native-worklets` | 0.10.1 | 0.10.1 |

Transitive native modules are pinned as direct dependencies deliberately: it is the only
way to hold them, and being explicit is the point.

**Rule of thumb:** never hand-pin anything listed in `bundledNativeModules.json`. If a peer
conflict forces your hand — here `@expo/ui` pulled `react-dom@19.2.8` against
`react@19.2.3` — pin the *offending transitive* package (adding `react-dom@19.2.3` as a
direct dependency), never the SDK-managed one.

### Prerequisite outside of git

**The app must exist on App Store Connect before the first upload**, with the bundle ID
`io.moox.LifeTime`. v1 shipped under that identifier, so the record should already be
there — worth confirming on
[appstoreconnect.apple.com](https://appstoreconnect.apple.com/apps) before the first run.

Note also that `latest_testflight_build_number + 1` means the new build number continues
from v1's series (v1 shipped build 13), which is what you want — App Store Connect rejects
a build number it has already seen.

## 11. Sources

- [Internal distribution — Expo](https://docs.expo.dev/build/internal-distribution/)
- [Create and share internal distribution build](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/)
- [Configure EAS Build with eas.json](https://docs.expo.dev/build/eas-json/)
- [`npx testflight`](https://docs.expo.dev/build-reference/npx-testflight/)
- [Overview of distributing apps for review](https://docs.expo.dev/review/overview/)
- [Submit to app stores](https://docs.expo.dev/submit/introduction/)
