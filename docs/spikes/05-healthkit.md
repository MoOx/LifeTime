# Spike 5: HealthKit, sleep and sport (slice 10)

**Question.** v2-alpha2 adds sleep and sport from HealthKit (INTENT.md D21). Before any screen
depends on it:

1. Does an Expo SDK 58 build carry HealthKit (entitlement, purpose strings) and show iOS's
   Health sheet?
2. Can the simulator hold a known week of sleep, workouts and mindful sessions, written by
   the app in E2E builds only, as the calendar's seeding does (slice 4)?
3. Does reading give LifeTime what it needs: intervals, the sleep stages, the workout's
   activity, and who wrote each sample (D23 needs the source to count one thing seen twice
   once)?
4. Does a change in Health reach the app with no action (D13)?
5. What do a refusal, and iOS 27's limits on history, look like to the app?

**What was tried.** iOS 27.2, iPhone 17 Pro simulator, Xcode 27.2, Release E2E build,
2026-11-15.

- `modules/lifetime-health`: LifeTime's own Expo module on HealthKit, built like
  `modules/lifetime-calendar` (slice 4): `isAvailable`, `getRequestStatus`, `requestAccess`,
  `listSamples(start, end)` for sleep, workouts and mindful sessions, and an `onChange` event
  from one `HKObserverQuery` per type. The write functions (`e2eSaveSleep`, `e2eSaveWorkout`
  through `HKWorkoutBuilder`, `e2eSaveMindful`, `e2eDeleteSeeded`) exist only when
  `EXPO_PUBLIC_E2E=1` at `pod install`, and every seeded sample carries a `LifeTimeE2E`
  metadata key so a reset removes those alone. Why not `@kingstinct/react-native-healthkit`
  (DATA-SOURCES.md): three sample types and one signal are about a hundred lines of Swift,
  with no Nitro runtime to carry, and the binary itself stays read-only.
- `modules/lifetime-health/app.plugin.js`: the HealthKit entitlement,
  `NSHealthShareUsageDescription` and (for seeding) `NSHealthUpdateUsageDescription`,
  **in E2E builds only** for now, so the next TestFlight build is not broken by an entitlement
  the App ID and its profile lack (see "For slice 12").
- `app/spike-health.tsx`: a throwaway screen, `lifetime://spike-health`, E2E builds only. It
  seeds a week as an Apple Watch would record it (each night 23:00 to 07:00 in bed, with
  stages that overlap the in-bed sample but not each other; strength training Monday,
  Wednesday and Friday; a run on Saturday; ten minutes of meditation each morning) plus one
  yoga session 45 days ago, then reads 60 days back.
- `.maestro/spike-health.yaml` (allow) and `.maestro/spike-health-denied.yaml` (refuse), each
  on a fresh install, in light and dark.

**Evidence** (`05-healthkit/`, `light-` and `dark-` of each):

| Capture | What it shows |
|---|---|
| `h01-before` | Before any request: available, `shouldRequest`, no samples, no error |
| `h02-health-sheet` | iOS 27's sheet with LifeTime's purpose string, nothing selected |
| `h03-health-sheet-on`, `h03b-health-sheet-end` | "Select All 6 Topics" (3 read, 3 write in E2E), then `Continue` at the end of the list |
| `h03c-health-history` | iOS 27's second step: "Past 30 Days and Future Data" or "All Recorded Data and Future Data" |
| `h04-read-back` | After seeding: 75 samples, 7 nights (3,360 min in bed, 3,150 asleep by stage), 5 workouts with their activity and writer, 7 mindful sessions, 1 sample older than 30 days; 81 change signals |
| `h05a-denied-alert`, `h05-denied` | `Don't Allow`: iOS's "You can turn on health data categories later in the Health app.", then `unnecessary`, no error, no samples |

Both flows pass in light and dark (the captures after their last assertion are there).

**Verdict: passes, with four findings that shape alpha2.**

1. **Build and sheet: yes.** The config plugin puts the entitlement and purpose strings in
   place through `expo prebuild`, and the sheet shows LifeTime's own text.
2. **Seeding: yes.** `HKWorkoutBuilder` and `HKCategorySample` save from an E2E build; a
   reinstall resets the app's authorisation, so each flow starts from a fresh sheet.
3. **Reading: yes.** Each sample comes back with its interval, its sleep value or workout
   activity, and its source (bundle identifier and name), which is what D23's "same thing
   seen twice counts once" needs. The stage samples sum exactly (in bed minus the awake
   stages), so Rest can come from stages when they exist and from in-bed otherwise.
4. **Always up to date: yes, in the foreground,** once a defect found here is fixed:
   observer queries started *before* the sheet was answered never fire. The module now
   starts them again when `requestAccess` resolves. Background delivery needs its own
   entitlement and does not run in the simulator (DATA-SOURCES.md); re-reading on launch,
   on focus and on the signal covers D13 as the calendar does.

Findings:

- **iOS 27 lets the user cap history at 30 days.** The second step of the sheet offers "Past
  30 Days and Future Data" first. The Summary's pager goes back six weeks, so with that
  choice weeks four to six would have calendar data but no sleep or sport. The app cannot
  read which choice was made. In the simulator the cap did not hide the 45-day-old sample
  LifeTime wrote itself; whether it hides other writers' data needs a device (the
  simulator has no other writer). Proposal for slice 12: show sleep and sport for the weeks
  that have them, and say once, in the Sources screen, that Health may share only the last
  30 days, with the way to change it.
- **A refusal is silent, as documented.** After `Don't Allow`, `getRequestStatus` says
  `unnecessary` and reads return nothing, exactly as for someone with no watch. The app can
  only say "no sleep or workouts from Health this week" and point to the Health app, never
  "you refused". Not proven here: whether the refused app would still read samples it wrote
  itself earlier (only E2E builds write, so it does not matter to users).
- **Before the sheet, a read fails** with "Authorization not determined" rather than
  returning nothing. The module now returns no samples in that case.
- **Maestro and iOS 27's sheet:** the accessibility tree lists hidden navigation items named
  `Allow` and `Don't Allow` at the top of the sheet, which Maestro considers visible. The
  flows scroll to the real buttons (`Continue`, or the disabled `Allow` when nothing is
  selected) and tap below them. `simctl privacy` has no Health service, so the sheet is
  always tapped through.

**For slice 12 (needs MoOx then, not now).** A shipped build with the HealthKit entitlement
needs the HealthKit capability on the `io.moox.LifeTime` App ID and an App Store profile
regenerated with it (`fastlane certificates`, run locally, as the Fastfile says), before the
plugin's E2E condition is removed. App Review: the store copy and the UI must make the
health purpose visible (Guideline 2.5.1, DPLA 3.3.3(H); D17 already allows it).

**Not covered.** A real watch's data, other writers (Strava, Garmin), the 30-day cap on
other writers' data, background delivery, and a week of real use: slice 12's "a real week on
MoOx's iPhone".
