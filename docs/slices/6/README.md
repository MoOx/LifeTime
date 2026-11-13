# Slice 6: Goals

Done 2026-11-13 (docs/spec/60-slices.md, slice 6; SCREENS.md §7, §8, §8c; INTENT.md D28).

## What changed

- **Goals list** (`app/(tabs)/goals/index.tsx`). With no goal, v1's introduction ("help your
  to" corrected) and its two entry points kept apart: `Minimum to Achieve` / `Add a Goal`
  (green scope) and `Maximum to Respect` / `Add a Limit` (orange hourglass). With goals,
  `Rings Show` (v2's switch, spec/30-screens.md: `Entire Week` by default, or `Current
  Progress`, with a footnote saying what each means), then one card per goal.
- **Goal card** (`src/features/goals/GoalCard.tsx`), in the Health style (D28): `GOAL` /
  `LIMIT` in the category's colour with its icon and a chevron, the title, v1's duration and
  cadence ("1h, every day"), a sentence saying where it stands (`statusSentence`), the daily
  average (numbers large, units small; v1's "-" when nothing is logged), and the ring with the
  scope or hourglass at its centre. The whole card opens the editor.
- **Ring** (`src/features/goals/GoalRing.tsx`): Skia, carried from v2's attempt, which had
  rebuilt v1's three behaviours (the 1500 ms sweep ending in a slight overshoot, the end cap's
  shadow from 80 % of a turn, the start cap hidden past a turn). Its colours are v1's table
  (`ringColors`, read on the pace as v1 did); its track is the start colour faded, as Health's
  rings on a light card. `@shopify/react-native-skia` 2.14.0, the SDK's version; Skia 2 builds
  paths through `PathBuilder`, where v2 used `Path.Make().addArc`.
- **Editor** (`app/goal.tsx`), a settings-like screen, so a grouped list (D28): `Title
  (Optional)`, `Type`, seven day circles, v1's four quick durations and its slider (0 to 24 h
  by quarter hours), `Average Time per Day` and `Weekly Goal` (or `Weekly Limit`), categories
  with the activities filed under each, indented. `Add` (`Save` when editing) stays disabled
  until the goal is valid, with a red footnote naming what is missing (`missingParts`).
  `Delete This Goal` asks first, as v1 did.
- Domain (`src/domain/goals.ts`, tested): `ringColors`, `statusSentence`, `missingParts`.

## Evidence

`maestro test .maestro/goals.yaml` on an E2E Release build, iPhone 17 Pro, iOS 27.2: 60 steps
`COMPLETED`, in light and in dark. The flow starts with no goal, adds a goal and a limit,
checks the footnote, switches the rings' reading, opens a goal and deletes it.
[check.txt](./check.txt): `npm run check`, 140 tests.

| | Comparison (v1 left) | Light | Dark |
|---|---|---|---|
| 05 No goals | [compare-05.png](./compare-05.png) | [light-05-goals-empty.png](./light-05-goals-empty.png) | [dark-05-goals-empty.png](./dark-05-goals-empty.png) |
| 06 New goal | [compare-06.png](./compare-06.png) | [light-06-goal-new.png](./light-06-goal-new.png) | [dark-06-goal-new.png](./dark-06-goal-new.png) |
| What is missing, in red | | [light-06b-goal-missing.png](./light-06b-goal-missing.png) | [dark-06b-goal-missing.png](./dark-06b-goal-missing.png) |
| 20 Filled | [compare-20.png](./compare-20.png) | [light-20-goal-new-filled.png](./light-20-goal-new-filled.png) | [dark-20-goal-new-filled.png](./dark-20-goal-new-filled.png) |
| One goal, after the sweep | | [light-21a-one-goal.png](./light-21a-one-goal.png) | [dark-21a-one-goal.png](./dark-21a-one-goal.png) |
| 21 A goal and a limit | [compare-21.png](./compare-21.png) | [light-21-goals-list.png](./light-21-goals-list.png) | [dark-21-goals-list.png](./dark-21-goals-list.png) |
| Current progress | | [light-21b-current-progress.png](./light-21b-current-progress.png) | [dark-21b-current-progress.png](./dark-21b-current-progress.png) |
| 22 Edit | [compare-22.png](./compare-22.png) | [light-22-goal-edit.png](./light-22-goal-edit.png) | [dark-22-goal-edit.png](./dark-22-goal-edit.png) |
| Delete asks first | | [light-22b-delete-confirm.png](./light-22b-delete-confirm.png) | [dark-22b-delete-confirm.png](./dark-22b-delete-confirm.png) |

Recording of the ring sweep: [ring-sweep-light.mp4](./ring-sweep-light.mp4), from Maestro's
`startRecording` as the first card appears.

## Differences from v1

| v1 | Now | Why |
|---|---|---|
| A card filled with the category colour, on-dark text | A light card, the colour in the heading and the icon | D28, Health's cards |
| The ring only, coloured by status | A sentence says the status as well (new text) | Health's cards; colour alone excludes some readers |
| `...` button to edit | The whole card opens the editor, with a chevron | Health's cards |
| The ring shows the pace | `Entire Week` by default, `Current Progress` on demand | v2's decision, kept by spec/30-screens.md |
| `Add` disabled silently | Disabled, with a red footnote naming what is missing | spec/30-screens.md |
| Days from Sunday | Days in the locale's week order | Same order as the chart (D24's week start) |
| Categories expand to their activities | Activities filed under a category listed under it, indented | Fewer taps; only rules' activities exist yet |
| `mesured` | `measured` | Corrected strings |

## Not done here

- Settings stay in memory until slice 7, so goals go at a cold start.
- The ring's colours are v1's: its two lime greens are pale on a light card. Kept for now as
  v1's identity; worth a look once MoOx has seen it.
- Large text sizes: slice 9. The recording is light only.

## Lessons

- iOS shows a one-time keyboard tip ("Type English and French") the first time a field is
  focused; the flow dismisses it if present, then presses Enter, as Maestro cannot hide this
  keyboard.
- `LabeledContent` reads as one element ("Weekly Goal, 7h"): the flow matches its text with a
  pattern.
