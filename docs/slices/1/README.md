# Slice 1: the shell

Done 2026-11-12 (docs/spec/60-slices.md, slice 1).

## What changed

- **Tabs.** `app/(tabs)/_layout.tsx`: `NativeTabs` with Summary (`list.bullet`), Goals
  (`star.square`) and Settings (`gearshape`), the Liquid Glass tab bar.
- **One native stack per tab**, each tab root with a large title ("Your LifeTime", "Goals",
  "Settings"), pushed screens with a small title and the minimal back button
  (spec/30-screens.md, "Headers"). Summary pushes the activity screen; Settings pushes
  Notifications and Reset.
- **Sheets** in the root stack, UIKit page sheets: Help (`Done` trailing) and New Goal
  (`Cancel` leading, `Add` trailing and disabled), with `Stack.Toolbar` buttons.
- **Lists are SwiftUI's own** (INTENT.md D27): `src/ui/Form.tsx` wraps `@expo/ui`'s `Form`
  and `Section`, proven by [spike 4](../../spikes/04-expo-ui-lists.md). The React Native list
  of spike 3 (`src/ui/List.tsx`) is gone. Summary holds a React Native view in a section
  through `RNHostView`, where the chart goes in slice 2.
- **Theme.** `app/_layout.tsx` wraps the app in `ThemeProvider` with `DarkTheme` or
  `DefaultTheme`, as the SDK 58 template does; without it the header titles stay black in
  dark mode (spike 4, "Dark mode").
- Placeholder sections (`src/features/shell/Placeholder.tsx`) make every tab long enough to
  scroll; each later slice replaces them with the screen's content.
- `@expo/ui` added (`~58.0.27`, 58.0.28 installed).
- The redirect route `index` has no header: the recording showed a native header titled
  "index" flashing at launch. The screenshots predate this fix, which touches nothing they
  show; the recording was made after it.

## Evidence

`maestro test .maestro/shell.yaml` on the Release build, iPhone 17 Pro, iOS 27.2, Xcode 27.2:
39 steps, all `COMPLETED`, once in light and once in dark. The flow asserts every push, pop,
sheet and dismissal; the screenshots were then opened and checked by eye.

| | Light | Dark |
|---|---|---|
| Summary, large title at rest | [light-summary-rest.png](./light-summary-rest.png) | [dark-summary-rest.png](./dark-summary-rest.png) |
| Summary, title collapsed into the bar | [light-summary-collapsed.png](./light-summary-collapsed.png) | [dark-summary-collapsed.png](./dark-summary-collapsed.png) |
| Activity pushed, small title, back button | [light-summary-pushed.png](./light-summary-pushed.png) | [dark-summary-pushed.png](./dark-summary-pushed.png) |
| Goals at rest, `+` trailing | [light-goals-rest.png](./light-goals-rest.png) | [dark-goals-rest.png](./dark-goals-rest.png) |
| Goals collapsed | [light-goals-collapsed.png](./light-goals-collapsed.png) | [dark-goals-collapsed.png](./dark-goals-collapsed.png) |
| New Goal sheet | [light-goal-sheet.png](./light-goal-sheet.png) | [dark-goal-sheet.png](./dark-goal-sheet.png) |
| Settings at rest | [light-settings-rest.png](./light-settings-rest.png) | [dark-settings-rest.png](./dark-settings-rest.png) |
| Notifications pushed | [light-settings-pushed.png](./light-settings-pushed.png) | [dark-settings-pushed.png](./dark-settings-pushed.png) |
| Help sheet | [light-help-sheet.png](./light-help-sheet.png) | [dark-help-sheet.png](./dark-help-sheet.png) |
| Settings collapsed | [light-settings-collapsed.png](./light-settings-collapsed.png) | [dark-settings-collapsed.png](./dark-settings-collapsed.png) |

[tabs-light.mp4](./tabs-light.mp4): recording of the three tabs, each scrolled until the large
title collapses into the bar and back to rest, driven by `.maestro/shell-recording.yaml` under
`simctl io recordVideo` (re-encoded to 402 px wide, 30 fps). Light only; dark is covered by
the screenshots.

Re-tapping the Summary tab while Activity is shown pops to the root: asserted by the flow,
no screenshot. [check.txt](./check.txt): `npm run check`, all green.

## Not verified

- Android: not built (iOS first, D7).
- A push took about two seconds to appear while the machine's load average was above 100;
  not measured on an idle machine. Watch it in slice 2.
- Swipe-back gesture and sheet swipe-down: native behaviour, not exercised by the flow.

## Lessons

- The iOS 27.2 simulator, after a first boot or a reboot, keeps the machine loaded for a long
  time; Maestro's driver times out until it settles. Rebuilding with `xcodebuild` and
  installing with `simctl install` avoids `expo run:ios`'s deep-link alert and the reboot it
  used to need.
- In zsh, `path` is tied to `PATH`: never use it as a loop variable.
