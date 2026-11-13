# Slice 2: the Summary on demo data

Done 2026-11-13 (docs/spec/60-slices.md, slice 2; SCREENS.md §3, §3.2, §8b).

## What changed

- **Domain.** `weekStackOrder` stacks each week by its category totals, the biggest at the
  bottom of every bar, as v1 (`WeeklyGraph.res:265-267`) and D25; v2's declaration order is
  gone. `formatUpdated` writes v1's `Updated today at 1:53 PM`. Both tested (130 tests).
- **Data.** `src/data/`: the week start and language from the OS (`expo-localization`, as
  v2 did instead of v1's country table), the settings in memory (persistence is slice 7),
  and `useReport`, six weeks of demo events with the demo rules after the user's.
- **Summary** (`app/(tabs)/summary/index.tsx`), a SwiftUI `Form` (D27):
  - the date line (`FRIDAY 13 NOVEMBER`) as the header of the first section, under the
    native large title (spec/30-screens.md, "Headers");
  - the demo row, `Demo data` and `Use my calendar` (spec/20-sources.md, "Demo");
  - `Weekly Chart` with `Show This Week` when an older week is shown, the six-week pager,
    `Total Logged Time`, and `Updated ...` as the footer;
  - `Top Activities`: category icon, title, bar in the category colour with the duration,
    chevron; eight rows then `Show More` / `Show Less`; a row opens the activity screen;
  - `Reveal Hidden Activities` / `Mask Hidden Activities`, toggling the setting.
- **Chart** (`src/features/summary/WeekChart.tsx`): React Native views, v1's geometry
  (140 pt plot, 16 pt letters, 28 pt gutter, four slices, hours or minutes, bars 60 % of the
  column with 3 pt top corners, a dashed line at every day boundary), hosted in each page
  through `RNHostView`. No Skia: the spec said Skia, views were enough.
- **Pager** (`src/features/summary/WeekPager.tsx`): SwiftUI's page-style `TabView`, one
  week per swipe, opening on the current week.
- `Section` (`src/ui/Form.tsx`) takes a trailing header `action`, kept in the tree and
  hidden when it has nothing to do (see "Lessons").
- `AppText` takes `maxFontSizeMultiplier`, so the chart labels stop growing at 1.3
  (40-design.md).

## Evidence

`maestro test .maestro/summary.yaml`, Release build, iPhone 17 Pro, iOS 27.2: all steps
`COMPLETED`, once in light and once in dark. The flow swipes back through all six weeks and
past the oldest, checks that `Show This Week` appears and brings the current week back,
scrolls to the bottom, toggles `Reveal` / `Mask Hidden Activities`, and opens an activity.

Side by side with v1 (v1 left, this build right):

| v1 capture | Comparison |
|---|---|
| 12, top | [compare-12.png](./compare-12.png) |
| 14, scrolled | [compare-14.png](./compare-14.png) |
| 15, bottom | [compare-15.png](./compare-15.png) |
| 16, previous week | [compare-16.png](./compare-16.png) |

All captures, light and dark: `light-*.png`, `dark-*.png` (top, previous week, oldest week,
back to this week, scrolled, bottom, activity). [check.txt](./check.txt): `npm run check`.

## Differences from v1

| v1 | Now | Why |
|---|---|---|
| Hand-built title with the date line above it | Native large title; the date line heads the first section | D10; spec/30-screens.md |
| Edge-to-edge groups, uppercase headings | SwiftUI `Form`, rounded groups, the OS's headings | D27 |
| No demo row | `Demo data` / `Use my calendar` | Demo before permission, spec/20-sources.md |
| Caption above the pager, swapped after the swipe | Caption inside each page | It never disagrees with the bars mid-swipe |
| Week start from a country table | From the OS | v2's fix, kept |
| Pull to refresh | None yet | Demo data needs none; D13's always-up-to-date reading comes with the calendar, slice 4 |
| Category icons drawn for v1 | SF Symbols of the categories | expo-symbols everywhere, spec/30-screens.md "Kept from v2" |
| Bar: row width minus 85 pt | 40 % of the list width at most, duration never cut | SwiftUI lays the row out; see "Lessons" |

Kept from v1 on purpose, though odd: the `Daily Average` caption shows no figure, as in v1.

## Not done here

- `Use my calendar` and `Customize report` are shown disabled: the permission card and
  Filters arrive with slice 4.
- The empty states (SCREENS.md §3.1) need a real source: slice 4.
- Large text sizes: slice 9. `maxFontSizeMultiplier` on the chart labels is not yet checked
  under Fabric with `dynamicTypeRamp`.

## Lessons

- **A React Native horizontal `ScrollView` inside a SwiftUI `Form` never receives the
  swipe.** The pager had to be SwiftUI's.
- **SwiftUI `ScrollView` with `.paging` lets a fling skip pages**, and an initial
  `scrollPosition` is not applied on first layout. A page-style `TabView` turns one page per
  swipe, like v1's paged `UIScrollView`.
- **Changing a `Section` from a plain `title` to a custom `header` rebuilds it**, and
  everything inside, which threw the pager back to the current week after every swipe. The
  header now always has its button, hidden when idle.
- A hidden SwiftUI button stays in the accessibility tree, disabled and without text;
  Maestro checks `enabled: false`. Off-screen pages are in the tree too, so captions cannot
  prove which week is shown: the flow relies on the button and the screenshots.
- Maestro's `swipe` from an element is too short for the `TabView`; an explicit swipe across
  the chart works. Before tapping a row, centre it: under the floating tab bar, the tap lands
  on the tab.
- Formatting: the repository has no Prettier config and its files do not follow Prettier's
  defaults; format only new files, with `--no-semi --single-quote --print-width 100
  --bracket-same-line`.
