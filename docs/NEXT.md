# Next steps — the runbook

> **How this file is used.** When MoOx says "continue", Claude takes the first unticked
> step below, does it, ticks it (`- [x]`, date, evidence), commits, pushes, and moves on
> to the next. See [CLAUDE.md](../CLAUDE.md) for the protocol and the rules. When a step
> is blocked, write the blocker under it instead of ticking it, then ask MoOx everything
> at once.
>
> **Where this runs.** Steps 0–2, 4 and 5 need macOS: Xcode, the iOS Simulator and the
> Android emulator. They are meant for a Claude Code session on MoOx's Mac. Step 3 is
> writing and can run anywhere.
>
> **Status of the v1 tooling.** `scripts/v1/` and `.maestro/v1/` were written in a cloud
> session without a simulator, then made to work on MoOx's Mac on 2026-11-09 (steps 1 and
> 2). What they needed is in `docs/reference/v1/BUILD.md`.

---

## Step 0: Inventory the Mac and get the tools in place

- [x] **Done:** 2026-11-09. Machine recorded in `docs/reference/v1/BUILD.md`. Xcode 26.6, iOS 26.5 runtime, Node 16 (fnm), CocoaPods 1.17, Maestro 2.12.1, Rosetta and Android Studio were all present; nothing had to be installed. Xcode 27.2 is also present. Watch the disk: 41 GiB free.

**Goal:** know what is installed, and get everything missing in one request to MoOx.

**Do:**

1. Record the output of these commands in the "Machine" section of
   `docs/reference/v1/BUILD.md`:
   ```sh
   sw_vers; uname -m; df -h ~ | tail -1
   ls -d /Applications/Xcode*.app; xcode-select -p; xcodebuild -version
   xcrun simctl list runtimes; xcrun simctl list devicetypes | grep -i iphone | tail -5
   node -v; command -v fnm volta nvm; ruby -v; pod --version
   maestro --version; java -version 2>&1 | head -1; command -v emulator adb
   /usr/bin/pgrep -q oahd && echo "Rosetta: installed" || echo "Rosetta: missing"
   ```
2. Known already: **Xcode 26.6** is at `/Applications/Xcode-26.6.0.app` (installed with `xcodes`). The v1 scripts use it automatically. Check whether Xcode 27 is also present: the new app on Expo SDK 58 can use either.
3. Needed:
   - Xcode 26.6 with an **iOS 26.x simulator runtime**.
   - **Node 16** for v1 (its `.node-version`), via `fnm`, plus the current LTS for the new app.
   - **CocoaPods**, any recent version. Skip v1's Ruby 2.7.4 bundler pin unless forced.
   - **Rosetta 2** if ReScript 9's compiler turns out to be x86_64-only.
   - **Maestro**: `curl -fsSL "https://get.maestro.mobile.dev" | bash`.
   - **Android Studio + an arm64 emulator image (API 35+)**. Needed for the Android header spike in step 4; not needed before.
4. Install the user-space tools yourself (fnm, Node versions, Maestro, Homebrew
   formulae). Put everything that needs MoOx in **one** message: simulator runtimes,
   Rosetta, Android Studio, anything needing his password. Then continue with whatever
   does not depend on the answer.

**Done when:** BUILD.md lists the machine, and every tool needed for steps 1–2 is present.

---

## Step 1: Rebuild v1 on the iOS Simulator

- [x] **Done:** 2026-11-09. v1 launches on the `LifeTime v1` simulator (iOS 26.5, Xcode 26.6) and shows its Welcome screen: `docs/reference/v1/ios/00-launch.png`. Toolchain, symptoms and patches in `docs/reference/v1/BUILD.md`.

**Goal:** v1 from the `main` branch running in a simulator, so its screens can be
captured natively. Do not change v1's behaviour or look; only make it build.

**Do:**

1. `scripts/v1/setup.sh`. It does the following:
   - Creates a worktree of `main` at `../LifeTime-v1`, leaving this checkout untouched.
   - Installs dependencies under Node 16 and runs v1's generation steps (patches, SVG components, Markdown → JSON, ReScript, splash screen).
   - Applies the known fixes to build React Native 0.67 with a recent Xcode.
   - Runs `pod install`.
2. `scripts/v1/build.sh`. It builds with **Xcode 26.6** (iOS 26 SDK, so the iOS 27 UIScene rule does not apply to v1). It produces a **Release** simulator app (the JS is bundled, so no Metro and no dev overlays) and installs it on a dedicated simulator named `LifeTime v1`. v1's Release bundle id is `io.moox.LifeTime`, the same as the new app's, so they must never share a simulator.
3. When something breaks, check the symptom table in `docs/reference/v1/BUILD.md` first. Then fix with the smallest local patch inside the worktree, and add the symptom and fix to that table. **Nothing is committed to `main`.**

**Done when:**
- v1 launches in the `LifeTime v1` simulator and shows its Welcome screen. A screenshot proves it, committed as `docs/reference/v1/ios/00-launch.png`.
- BUILD.md records the exact toolchain and every patch applied.

**Time-box:** 3 hours of attempts. If v1 still does not launch, try these in order:
1. Build v1 for **Android** on an emulator (JDK 11, `npx react-native run-android`, and the same fixes approach). It gives a less faithful look, but exact layout and strings.
2. Otherwise, ask MoOx for his own v1 screenshots.

In both cases, record the outcome in BUILD.md and go on with whatever works.

---

## Step 2: Capture v1, screen by screen

- [x] **Done:** 2026-11-09. 22 screens in light and 22 in dark under `docs/reference/v1/ios/`, each checked by eye; table in `docs/reference/v1/README.md`, where three further empty-state reasons are noted as not captured.

**Goal:** a complete native visual reference of v1's *content*: what each screen shows,
its hierarchy, spacing, grouping, type and colour. This is the "visuellement très propre"
bar. Headers and navigation are **not** taken from v1; they follow INTENT.md D10.

**Do:**

1. Run `scripts/v1/capture.sh`. For each appearance (light, then dark), it:
   - Erases the `LifeTime v1` simulator and reinstalls the app.
   - Sets a clean status bar (9:41, full bars).
   - Runs the four flows in `.maestro/v1/`:
     - `01-first-launch.yaml`: welcome, privacy, the calendar permission screen, the empty home, empty goals, the new-goal form, and the notification permission prompt.
     - `02-demo-data.yaml`: injects v1's own demo calendar, categorises activities as v1's Detox flow did, then covers the home (top, middle, bottom), the previous week with "Show This Week", activity options and Filters.
     - `03-goals.yaml`: three goals created, the goals list, and editing a goal.
     - `04-settings.yaml`: settings, notifications, help and the danger zone.
2. Fix the flows wherever a selector or a timing is wrong, and re-run until both passes complete.
3. Open every capture and check it against [SCREENS.md](./SCREENS.md). Fill in the table in `docs/reference/v1/README.md`, and add a row for any state the flows missed (for example, a second empty-state reason).

**Done when:** every row of the README table has a light and a dark capture, or a note
saying why not, all committed under `docs/reference/v1/ios/`.

**Time-box:** 2 hours after v1 first launches.

---

## Step 3: Write the product spec (phase 2)

- [x] **Done:** 2026-11-09. `docs/spec/` committed and revised after MoOx's answers, recorded in INTENT.md §4 (D7, D13 to D26). `docs/spec/QUESTIONS.md` closed.

**Goal:** a spec complete enough that the build (step 5) needs no further questions.
**Inputs:**
- [INTENT.md](./INTENT.md), especially the decisions in §4.
- [DATA-SOURCES.md](./DATA-SOURCES.md)
- [SPEC.md](./SPEC.md) and [SCREENS.md](./SCREENS.md)
- `docs/reference/v1/`
- [CATEGORISATION.md](./CATEGORISATION.md). Update it on the two points INTENT.md §7 lists.

**Write `docs/spec/`.** Adjust the split if it serves the content better.

| File | Covers |
|---|---|
| `00-overview.md` | Scope of the first release, what is deliberately out, the two-step vision |
| `10-model.md` | Sources → raw observations → resolved timeline; how overlaps are merged; "located but unlabelled" time; activities, categories, rules; goals |
| `20-sources.md` | Per source: what is read, when, the permission flow, the privacy statement, failure modes, and how to fake it on a simulator |
| `30-screens.md` | Every screen's content (from SCREENS.md and the v1 captures), states (demo, empty, denied, loading) and exact strings. Plus the navigation map and each screen's header per D10: which screens get the large or collapsing title on each platform, and which get a small one |
| `40-design.md` | Type roles, spacing, colour, components, Liquid Glass rules, iOS vs Android differences, v1 captures as the content bar |
| `50-architecture.md` | Fresh Expo SDK 58 scaffold (D12) and what is ported from the current tree; libraries vs custom Expo modules; storage; background work; native verification with Maestro |
| `60-slices.md` | Ordered build slices, each with its definition of done and the native evidence that proves it |

**End with `docs/spec/QUESTIONS.md`:** every decision only MoOx can take, each with a
recommended default. Then **stop and ask MoOx**, in one message.

**Done when:** the spec is committed and MoOx has answered the questions. Record the
answers in INTENT.md §4 and in the spec.

---

## Step 4: Spikes

- [x] **Done:** 2026-11-10. All three alpha1 spikes pass, on iOS 27.0 with Xcode 27.2:
  [01-sdk58-build.md](./spikes/01-sdk58-build.md),
  [02-large-title.md](./spikes/02-large-title.md) (recordings and screenshots, light and dark),
  [03-grouped-lists.md](./spikes/03-grouped-lists.md) (default and accessibility sizes, two
  defects fixed). Spec updated: header conditions in `spec/30-screens.md`, spike references in
  `spec/40-design.md` and `spec/50-architecture.md`. Open, not blocking: inset or
  edge-to-edge groups (default inset); the iOS 27.2 runtime was downloading, slice 0 re-runs
  the build on it.

**Goal:** prove each risky native assumption before any screen depends on it. Each spike
is a throwaway screen in a scratch app, not production code.

**For v2-alpha1 (iOS, calendar only, D21):**

1. **Expo SDK 58 build:** with Xcode 27. The app must launch on the newest simulator runtime.
2. **Native headers (D10), iOS.** A screen with a long grouped list under an expo-router `Stack` with `headerLargeTitle`. The large title must collapse into the navigation bar on scroll exactly as in Mail, under a native tab bar, in light and dark. Also check a pushed screen with a small title and the minimal back button. Find and write down the conditions that make it work: the scroll view as the screen's first scrollable descendant, `contentInsetAdjustmentBehavior="automatic"`, no `headerTransparent`. Those are the mistakes that broke v2. **Evidence:** screen recording (`xcrun simctl io booted recordVideo`) plus screenshots at rest and collapsed, committed in `docs/spikes/`.
3. **Grouped lists, section headers and footnotes** drawn to match the v1 captures' content and polish, at the default Dynamic Type size and at a large one.

**Deferred with their releases:** HealthKit (alpha2, slice 10); Android headers with react-native-screens' experimental stack (Android pass, D7); location visits; on-device categorisation.

For each spike, write a short note in `docs/spikes/`: the question, what was tried, the
evidence, the verdict. A failed spike is a result. Update the spec if a verdict changes it.

**Done when:** every spike has a verdict and the spec reflects them.

---

## Step 5: Build, slice by slice

- [ ] **Done:**
- Progress: slice 0 done 2026-11-10, evidence in [slices/0/](./slices/0/README.md).
  Slice 1 done 2026-11-12, evidence in [slices/1/](./slices/1/README.md); lists moved to
  SwiftUI's `Form` through `@expo/ui` (INTENT.md D27, [spike 4](./spikes/04-expo-ui-lists.md)).

Follow `docs/spec/60-slices.md`, v2-alpha1 first. **Slice 0** is the fresh Expo SDK 58 scaffold (D12), with:
- `src/domain` and its tests ported.
- The offline checks (`scripts/check-*`) and `npm run check`.
- The TestFlight workflow and fastlane config carried over, plus the Maestro setup.

Each slice:
- Is built.
- Is checked on the simulator with Maestro screenshots, compared with the v1 references for content and with the platform for headers and navigation.
- Is committed with that evidence.

Send MoOx a TestFlight build (`[testflight]` in the commit message) only at the
milestones the spec names, not after every slice.
