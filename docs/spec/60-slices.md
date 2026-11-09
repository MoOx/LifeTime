# Build slices

Spikes come first (step 4 of [NEXT.md](../NEXT.md)); a verdict can change a slice.

**Every slice's definition of done includes:** `npm run check` passes; the slice's screens are
captured with Maestro on the iOS Simulator and the Android emulator, in light and dark, and
at a large text size where stated; each capture has been opened and compared by eye with its
v1 reference (content) and the platform (headers); the evidence is committed under
`docs/slices/<n>/`. Differences from v1 are listed there, each with its reason.

| # | Slice | Done when | Evidence beyond the common bar |
|---|---|---|---|
| 0 | **Scaffold.** Fresh SDK 58, `src/domain` and tests ported, checks, TestFlight and fastlane, Maestro | App launches on the newest iOS runtime and an Android emulator; tests green | Launch captures; `npm run check` output |
| 1 | **Shell.** Tabs, three stacks, headers per 30-screens.md, design system primitives, placeholders with a long list | Large title collapses as in Mail on all three tabs; push and sheets behave; re-tap pops to root | Screen recording of each tab, at rest and collapsed, on both platforms |
| 2 | **Model.** `resolveTimeline`, coverage, states, storage | Overlaps, nesting, dedupe, DST and 100% invariant tested | Test output only |
| 3 | **Summary on demo.** Date line, chart pager, top activities, demo row, `Reveal Hidden Activities` | Matches captures 12, 14, 15, 16; swipe through six weeks; chart geometry per SCREENS.md §8b | Side-by-side with captures |
| 4 | **Welcome, Privacy, Help.** | Matches 01, 02, 34, 35; staged entrances | Recording of Welcome |
| 5 | **Calendar source.** Permission card, Filters, empty states, Sources screen | Matches 03, 04, 17; each of the four empty reasons, and denied, reachable by a flow | Captures of all four reasons, which v1's set lacks |
| 6 | **Activity detail and rules.** Category list, Events, Hide, Match row | Matches 11; a rule changes the chart; the blast radius shows | |
| 7 | **Goals.** List, empty state, editor, slider, validation, ring and its switch | Matches 05, 06, 20, 21, 22; ring behaviours; red footnote on invalid | Recording of the ring sweep |
|  | **Milestone A: first TestFlight.** Calendar-only product, feature-complete against v1 | | MoOx installs it |
| 8 | **Settings, Notifications, Reset.** Reminders really scheduled | Matches 10, 30, 33; a reminder fires in the simulator; export, import, reset round trip | Log of a delivered notification |
| 9 | **Sorter.** Bulk categorisation, keywords, coverage | One action categorises the demo week | |
| 10 | **HealthKit.** Sources row, permission, sleep and workouts in the timeline, conflicts | Seeded week appears, merged with calendar without double counting; denied case honest | Seeded captures; a real week on MoOx's iPhone |
| 11 | **Health Connect.** | Seeded week on an emulator; denied and absent cases | |
|  | **Milestone B: second TestFlight.** Automatic sources | | MoOx uses it for a week |
| 12 | **Magic wand**, if spike 6 passes. Batches, cache, cascade | Real titles in French and English sorted, on the device; no-model case silent | Accuracy table on a real title list |
| 13 | **Polish pass.** Accessibility sizes, VoiceOver and TalkBack labels, Reduce Motion, resizable iOS 27 windows | Every screen at the largest text size; labels read correctly | Captures; audit notes |
|  | **Milestone C: release candidate.** Store copy per Health guidelines, Play declarations | | MoOx decides |

Android parity is part of every slice from 1 onward, not a phase at the end (see Q6).
