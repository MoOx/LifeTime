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

Both can coexist: they build the same `next/` project, and `expo prebuild` is what the
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

Replace the three current workflows with:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version-file: .node-version, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm test
```

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
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version-file: .node-version, cache: npm }
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: '${{ secrets.EXPO_TOKEN }}' }
      - run: npm ci
      - run: eas build --profile preview --platform all --non-interactive --no-wait
```

Note this runs on `ubuntu-latest` even for iOS — the macOS worker is EAS's, not GitHub's.
That alone removes the most expensive and most fragile part of the current CI.

`EXPO_TOKEN` comes from `eas whoami`/expo.dev account settings.

---

## 7. Store assets

Fastlane's `frame_screenshots` + the Detox screenshot run can be kept — but the modern,
lighter path is **Maestro** flows producing screenshots on both platforms
(see [IMPROVEMENTS.md](./IMPROVEMENTS.md) §C.2), with `eas submit`'s metadata support (or
`fastlane deliver`, kept solely for metadata) for upload.

Keep the existing `fastlane/screenshot-background.heic` and the Open Sans frame assets —
they are the app's store identity and are still perfectly usable.

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
| `next/fastlane/Fastfile` | the `ios beta` lane: match → prebuild → sign → build → TestFlight |
| `next/fastlane/Appfile`, `Matchfile` | identity and match storage config |
| `next/Gemfile` | fastlane, cocoapods, xcodeproj |
| `next/.env.example` | the values to fill locally |
| `.github/workflows/ios-testflight.yml` | the CI job |

### Bundle identifiers — read this before the first run

Apple bundle IDs are **case-sensitive**, and the stored profile is
`AppStore_io.moox.LifeTime`. So:

- **iOS**: `io.moox.LifeTime` — set in `next/app.json` (`ios.bundleIdentifier`) and
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

Manually: *Actions → iOS to TestFlight → Run workflow*. Or on a tag:

```sh
git tag v2.0.0 && git push --tags
```

Locally (needs macOS + Xcode):

```sh
cd next
cp .env.example .env      # fill MATCH_PASSWORD and SECRETS_PASSPHRASE
bundle install
bundle exec fastlane ios beta
```

The workflow runs `npm run check` (typecheck + tests) before the build, so a broken commit
fails in one minute instead of twenty.

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
