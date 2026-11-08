# Next steps — the runbook

> **How this file is used.** When MoOx says "continue", Claude takes the first unticked
> step below, does it, ticks it (`- [x]`, date, evidence), commits, pushes, and moves on
> to the next. See [CLAUDE.md](../CLAUDE.md) for the protocol and the rules. When a step
> is blocked, write the blocker under it instead of ticking it, then ask MoOx everything
> at once.
>
> **Where this runs.** Steps 0–3 and 5–6 need macOS: Xcode, the iOS Simulator and the
> Android emulator. They are meant for a Claude Code session on MoOx's Mac. Step 4 is
> writing and can run anywhere.
>
> **Honesty note.** The scripts and Maestro flows under `scripts/v1/` and `.maestro/v1/`
> were written in a cloud session that **cannot run a simulator**. They follow v1's own
> Detox flow (`git show main:e2e/demo.e2e.js`) and its real `testID`s, but nothing in
> them has been run yet. Expect to fix selectors and build errors; that is part of the
> step, not a failure of it.

---

## Step 0 — Inventory the Mac and get the tools in place

- [ ] **Done:**

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
2. Needed:
   - **Xcode**:
     - Xcode 27 is needed for the new app: Expo SDK 58 adopts the UIScene life cycle iOS 27 requires.
     - v1 cannot adopt UIScene, so it needs an **iOS 26.x simulator runtime**. Either Xcode 27 plus the iOS 26 runtime (`xcodebuild -downloadPlatform iOS -buildVersion 26.x`), or Xcode 26.x installed alongside (`xcodes install 26.6`).
   - **Node 16** for v1 (its `.node-version`), via `fnm`. The current LTS for the new app.
   - **CocoaPods** (any recent version; skip v1's Ruby 2.7.4 bundler pin unless forced).
   - **Rosetta 2** if ReScript 9's compiler turns out to be x86_64-only.
   - **Maestro**: `curl -fsSL "https://get.maestro.mobile.dev" | bash`.
   - **Android Studio + an arm64 emulator image**: only for the v1 Android fallback and for Android parity later. Not blocking.
3. Install the user-space tools yourself (fnm, Node versions, Maestro, Homebrew
   formulae). Put everything that needs MoOx in **one** message: Xcode versions, simulator
   runtimes, Rosetta, Android Studio, anything needing his password. Then continue with
   whatever does not depend on the answer.

**Done when:** BUILD.md lists the machine and every tool needed for steps 1–2 is present.

---

## Step 1 — Rebuild v1 on the iOS Simulator

- [ ] **Done:**

**Goal:** v1 from the `main` branch running in a simulator, so its screens can be
captured natively. Do not change v1's behaviour or look; only make it build.

**Do:**

1. `scripts/v1/setup.sh`. It does the following:
   - Creates a worktree of `main` at `../LifeTime-v1`, leaving this checkout untouched.
   - Installs dependencies under Node 16 and runs v1's generation steps (patches, SVG components, Markdown → JSON, ReScript, splash screen).
   - Applies the known fixes to build React Native 0.67 with today's Xcode.
   - Runs `pod install`.
2. `scripts/v1/build.sh`. It builds a **Release** simulator app (the JS is bundled, so no Metro and no dev overlays) and installs it on a dedicated simulator named `LifeTime v1`. v1's Release bundle id is `io.moox.LifeTime`, the same as the new app's, so they must never share a simulator.
3. When something breaks, check the symptom table in `docs/reference/v1/BUILD.md` first. Then fix with the smallest local patch inside the worktree, and add the symptom and fix to that table. **Nothing is committed to `main`.**

**Done when:**
- v1 launches in the `LifeTime v1` simulator and shows its Welcome screen. A screenshot proves it, committed as `docs/reference/v1/ios/00-launch.png`.
- BUILD.md records the exact toolchain and every patch applied.

**Time-box:** 3 hours of attempts. If v1 still does not launch, try these in order:
1. Build v1 for **Android** on an emulator (JDK 11, `npx react-native run-android`, and the same fixes approach). It gives a less faithful look, but exact layout and strings.
2. Otherwise, ask MoOx for his own v1 screenshots or screen recordings.

In both cases, record the outcome in BUILD.md and go on to step 2 with whatever works.

---

## Step 2 — Capture v1, screen by screen

- [ ] **Done:**

**Goal:** a complete native visual reference of v1. This is the "visuellement très
propre" bar the new UI must meet, and the place the scroll and large-title behaviour
MoOx found broken in v2 is defined.

**Do:**

1. Run `scripts/v1/capture.sh`. For each appearance (light, then dark), it:
   - Erases the `LifeTime v1` simulator and reinstalls the app.
   - Sets a clean status bar (9:41, full bars).
   - Runs the four flows in `.maestro/v1/`:
     - `01-first-launch.yaml`: welcome, privacy, the calendar permission screen, the empty home, empty goals, the new-goal form, and the notification permission prompt.
     - `02-demo-data.yaml`: injects v1's own demo calendar, categorises activities as v1's Detox flow did, then covers the home (top, scrolled, bottom), the previous week with "Show This Week", activity options and Filters.
     - `03-goals.yaml`: three goals created, the goals list, and editing a goal.
     - `04-settings.yaml`: settings, notifications, help and the danger zone.
   - Records short **videos of scrolling** on screens with a large or sticky title (light pass only).
2. Fix the flows wherever a selector or a timing is wrong, and re-run until both passes complete.
3. Open every capture and check it against [SCREENS.md](./SCREENS.md). Fill in the table in `docs/reference/v1/README.md`, and add a row for any state the flows missed (for example, a second empty-state reason).

**Done when:** every row of the README table has a light and a dark capture, or a note
saying why not. The videos exist. Everything is committed under `docs/reference/v1/ios/`.

**Time-box:** 2 hours after v1 first launches.

---

## Step 3 — Capture the v2 attempt the same way

- [ ] **Done:**

**Goal:** turn MoOx's "rendu imprécis, bugs de navigation et de titres au scroll" into a
precise list of differences, screen by screen, so the new UI fixes causes rather than
impressions.

**Do:**

1. Build the current branch for the simulator on its own simulator, `LifeTime v2`. The app is on Expo SDK 57, so use Xcode 26.x, or Xcode 27 with `expo-build-properties` `ios.enableSceneSupport: true` (see DATA-SOURCES.md).
2. Capture the matching screens, light and dark, plus the same scroll videos. Put them in `docs/reference/v2-attempt/`. A copy of the v1 flows with v2's labels is enough.
3. Write `docs/reference/DIFF.md`: for each screen, what differs from v1 (header behaviour, spacing, type sizes, grouping, colours, missing elements, bugs seen), with the two images side by side.

**Done when:** DIFF.md covers every screen both versions have.

**Time-box:** 2 hours. If v2 will not build quickly, skip the step and say so in DIFF.md.

---

## Step 4 — Write the product spec (phase 2)

- [ ] **Done:**

**Goal:** a spec complete enough that the build (step 6) needs no further questions.
**Inputs:**
- [INTENT.md](./INTENT.md)
- [DATA-SOURCES.md](./DATA-SOURCES.md)
- [SPEC.md](./SPEC.md) and [SCREENS.md](./SCREENS.md)
- `docs/reference/v1/` and `DIFF.md`
- [CATEGORISATION.md](./CATEGORISATION.md)

**Write `docs/spec/`.** Adjust the split if it serves the content better.

| File | Covers |
|---|---|
| `00-overview.md` | Scope of the first release, what is deliberately out, the two-step vision |
| `10-model.md` | Sources → raw observations → resolved timeline; how overlaps are merged; activities, categories, rules; goals; unaccounted time |
| `20-sources.md` | Per source: what is read, when, the permission flow, the privacy statement, failure modes, and how to fake it on a simulator |
| `30-screens.md` | Every screen's content (from SCREENS.md and the v1 captures), states (demo, empty, denied, loading), exact strings, and **header and scroll behaviour** |
| `40-design.md` | Type roles, spacing, colour, components, Liquid Glass rules, iOS vs Android differences, v1 captures as the bar |
| `50-architecture.md` | Expo SDK 58, libraries vs custom Expo modules, storage, background work, native verification with Maestro |
| `60-slices.md` | Ordered build slices, each with its definition of done and the native evidence that proves it |

**End with `docs/spec/QUESTIONS.md`:** every decision only MoOx can take, each with a
recommended default. Then **stop and ask MoOx**, in one message.

**Done when:** the spec is committed and MoOx has answered the questions. Record the
answers in INTENT.md §4 and in the spec.

---

## Step 5 — Spikes

- [ ] **Done:**

**Goal:** prove each risky native assumption from `docs/spec/50-architecture.md` before
any screen depends on it. Expected at least:

1. **Expo SDK 58 + Xcode 27:**
   - The app builds and launches on the iOS 27 simulator.
   - The native stack's large title and scroll collapse match the v1 videos.
   - The tab bar behaves correctly.
2. **Grouped lists, headers and footnotes** drawn to match the v1 captures, at Dynamic Type default and at a large size.
3. **HealthKit:** read sleep and workouts seeded into the simulator.
4. **Location visits (custom Expo module):** what the simulator can fake; what needs a real iPhone, which is MoOx's.
5. **On-device categorisation:**
   - `expo-ai` / Foundation Models on a batch of real-looking titles, in French and English.
   - The fallback without a model.

For each spike, write a short note in `docs/spikes/`: the question, what was tried, the
evidence (screenshots, logs), the verdict. A failed spike is a result. Update the spec if
a verdict changes it.

**Done when:** every spike has a verdict and the spec reflects them.

---

## Step 6 — Build, slice by slice

- [ ] **Done:**

Follow `docs/spec/60-slices.md`. Each slice:
- Is built.
- Is checked on the simulator with Maestro screenshots, compared with the v1 references.
- Is committed with that evidence.

Send MoOx a TestFlight build (`[testflight]` in the commit message) only at the
milestones the spec names, not after every slice.
