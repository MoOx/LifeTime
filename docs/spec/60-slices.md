# Build slices

Spikes come first (step 4 of [NEXT.md](../NEXT.md)); a verdict can change a slice.

**Every slice's definition of done includes:** `npm run check` passes; the slice's screens are
captured with Maestro on the iOS Simulator, in light and dark, and at a large text size where
stated; each capture has been opened and compared by eye with its v1 reference (content) and
the platform (headers); the evidence is committed under `docs/slices/<n>/`. Differences from
v1 are listed there, each with its reason.

## v2-alpha1: v1 brought up to date, iOS, calendar only

| # | Slice | Done when | Evidence beyond the common bar |
|---|---|---|---|
| 0 | **Scaffold.** Fresh SDK 58, `src/domain` and tests ported, checks, TestFlight and fastlane, Maestro | App launches on the newest iOS runtime; tests green | Launch capture; `npm run check` output |
| 1 | **Shell.** Tabs, three stacks, headers per 30-screens.md, design system primitives, placeholders with a long list | Large title collapses as in Mail on all three tabs; push and sheets behave; re-tap pops to root | Screen recording of each tab, at rest and collapsed |
| 2 | **Summary on demo.** Date line, chart pager, top activities, demo row, `Reveal Hidden Activities` | Matches captures 12, 14, 15, 16; swipe through six weeks; chart geometry per SCREENS.md §8b; stacking by the week's totals | Side-by-side with captures |
| 3 | **Welcome, Privacy, Help.** | Matches 01, 02, 34, 35; staged entrances | Recording of Welcome |
| 4 | **Calendar source.** Permission card, Filters, empty states, always up to date | Matches 03, 04, 17; each of the four empty reasons, and denied, reachable by a flow; an event added in Calendar appears with no action | Captures of all four reasons, which v1's set lacks |
| 5 | **Activity detail and rules.** Category list, Events, Hide, Match row | Matches 11; a rule changes the chart; the blast radius shows | |
| 6 | **Goals.** List, empty state, editor, slider, validation, ring and its switch | Matches 05, 06, 20, 21, 22; ring behaviours; red footnote on invalid | Recording of the ring sweep |
| 7 | **Settings, Notifications, Reset.** Reminders really scheduled | Matches 07, 10, 30, 33; a reminder fires in the simulator; export, import, reset round trip | Log of a delivered notification |
| 8 | **Sorter and rule from a selection.** Bulk categorisation, keywords, coverage, `inferRule` | One action categorises the demo week; selecting several titles yields the expected rule, which also applies to a new event | `inferRule` tests |
| 9 | **Accessibility pass.** Large text, VoiceOver labels, Reduce Motion | Every screen at the largest text size; labels read correctly | Captures; audit notes |

**Milestone: v2-alpha1 on TestFlight.** MoOx installs it and uses it on his real calendars.

## v2-alpha2: sleep and sport

| # | Slice | Done when | Evidence beyond the common bar |
|---|---|---|---|
| 10 | **Spike HealthKit**, then detail this alpha from what alpha1 taught | Verdict in `docs/spikes/` | |
| 11 | **Observations and overlap rules.** | Same thing seen twice counted once; different things in parallel counted in both; tested | Test output |
| 12 | **HealthKit source and Sources screen.** | Seeded week appears, gym in the calendar and on the watch counted once; denied case honest | Seeded captures; a real week on MoOx's iPhone |

**Milestone: v2-alpha2 on TestFlight.** MoOx uses it for a few weeks.

## Then, in an order to decide with what those weeks showed

Android pass (D7); interface rethink around automation; magic wand; location visits.
