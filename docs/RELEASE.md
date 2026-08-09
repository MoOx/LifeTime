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

## 2. Setup (once)

```bash
npm i -g eas-cli
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

### Xcode version — do not add `setup-xcode`

The workflow deliberately uses the runner image's **default** Xcode. Selecting
`latest-stable` via `maxim-lobanov/setup-xcode` picks Xcode 26.3, whose Swift compiler
fails on Expo's own code:

```
expo-modules-jsi/.../JavaScriptCodable+Date.swift:53:50:
error: type of expression is ambiguous without a type annotation
```

`MoOx/HideTheNotch` hit this and reverted to the image default, which compiles. Pin an
explicit known-good version here rather than reintroducing `latest-stable`.

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

### Post-mortem: build 2 crashed on launch

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
