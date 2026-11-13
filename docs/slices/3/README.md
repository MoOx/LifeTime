# Slice 3: Welcome, Privacy, Help

Done 2026-11-13 (docs/spec/60-slices.md, slice 3; SCREENS.md §2, §9, §10).

## What changed

- **Welcome** (`app/welcome.tsx`): a sheet that cannot be swiped away, shown over the
  Summary at launch while `onboarded` is false. v1's pitch (icon, `Welcome to`, `LifeTime`,
  the baseline), the calendar row, `About LifeTime & Privacy...` and `Continue`, with v1's
  two staged entrances (pitch at 750 ms, bottom block at 1250 ms, 1200 ms fades) and the
  short-window rule. Reduce Motion shows the content without movement. React Native draws
  it (lettering and motion are the brand); `Continue` is SwiftUI's prominent button in the
  system indigo. `Continue` lands on the Summary on demo data (spec/30-screens.md).
- **Privacy** (`app/privacy.tsx`): v1's text, "read-only" without v1's "mostly", and the
  corrected strings of spec/30-screens.md. Title in the content, centred, as in v1.
- **Help** (`app/help.tsx`): v1's `help.md` in SwiftUI, with its headings, its `<details>`
  as a native `DisclosureGroup` (collapsed at first, as in v1), and its links tappable in
  the text. Departures from SCREENS.md §10: no "(Premium)", no "Upcoming features", typos.
- `src/ui/Prose.tsx`: the SwiftUI text screen both use.
- The Maestro flows of slices 0 to 2 now pass Welcome first, and two stale selectors from
  before slice 2 are fixed (`launch.yaml`, `shell.yaml`).

## Evidence

`maestro test .maestro/welcome.yaml`, Release build, iPhone 17 Pro, iOS 27.2, all steps
`COMPLETED` in light and in dark: Welcome after its entrances, a swipe that does not dismiss
it, Privacy from Welcome and back, `Continue` to the Summary, Help from Settings, its
disclosure opened, `Done`. The flows of slices 0, 1 and 2 pass again with Welcome in front.

| v1 capture | Comparison (v1 left) | Dark |
|---|---|---|
| 01 Welcome | [compare-01.png](./compare-01.png) | [dark-01-welcome.png](./dark-01-welcome.png) |
| 02 Privacy | [compare-02.png](./compare-02.png) | [dark-02-privacy.png](./dark-02-privacy.png) |
| 34 Help | [compare-34.png](./compare-34.png) | [dark-34-help.png](./dark-34-help.png) |
| 35 Help, guides open | [compare-35.png](./compare-35.png) | [dark-35-help-learn-more.png](./dark-35-help-learn-more.png) |

[welcome-light.mp4](./welcome-light.mp4): a cold launch, from the splash to Welcome fully in.
[check.txt](./check.txt): `npm run check`, all green.

On this machine, loaded above a load average of 100, the sheet's presentation overlaps the
staged entrances: the delays count from the screen's mount, as in v1.

## Differences from v1

| v1 | Now | Why |
|---|---|---|
| Welcome, then the calendar permission | Welcome, then the Summary on demo data | spec/30-screens.md, INTENT.md §2.2 |
| `Your data stay on your device.` | `Your data stays on your device.` | Corrected strings |
| Privacy: "mostly read-only" | "read-only" | The calendar is only ever read |
| Help: matching by start or end of name "(Premium)" | Free, with "contains" added, and where to choose it | Issue #13; SCREENS.md §10 |
| Help: "Upcoming features" | Removed | Never built, not planned |
| Help headings in a custom style | SwiftUI text styles (Large Title, Title 2, Title 3) | D27 |
| `Done` as a plain text button | The iOS 27 prominent `Done` | Native toolbar button |

## Not done here

- Welcome shows at every cold start: settings persist from slice 7.
- `Continue` does not ask for the calendar: the permission card comes with slice 4.
- Help's "How to get started" entry from the empty states arrives with them (slice 4).

## Lessons

- **A large `maxWidth` frame (10,000 pt) moved a SwiftUI button's accessibility frame off
  screen**: Maestro and VoiceOver lost it while it looked right. Spacers fill the width.
- **A SwiftUI host added while a sheet is still being presented at launch sometimes never
  appears to accessibility.** `Continue` mounts on the sheet's `transitionEnd`.
- SwiftUI `tint('indigo')` is CSS's indigo, much darker than the system's: pass the
  system colour (`colors.accent`).
- React Native merges the texts of a `Pressable` into one accessible element; Maestro
  matches it with a regular expression.
- Under heavy load the 15 s waits expired; the flows now wait 30 s for the first screen.
