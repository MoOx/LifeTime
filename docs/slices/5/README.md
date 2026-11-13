# Slice 5: Activity detail and rules

Done 2026-11-13 (docs/spec/60-slices.md, slice 5; SCREENS.md §4; spec/10-model.md).

## What changed

- **Activity detail** (`app/(tabs)/summary/activity.tsx`), a SwiftUI `Form` under the small
  native title:
  - `Category`: the nine categories, icon tile, and a check in the category's colour on
    the current one. A tap writes the rule for this title and replaces its previous one
    (`ActivityOptions.res:74-92`); the Summary's chart and list follow at once.
  - `Match` (v2's addition, kept by spec/30-screens.md, issue #13): `Exact`, `Starts With`,
    `Ends With`, `Contains`, as SwiftUI's own picker, and below it the blast radius:
    `Also matches N other activities: ...` over the six weeks shown, or `Matches only "..."`.
  - `Events`: the visible week's events behind the number, the week's range, each event's
    day, a bar against the week's longest, its duration, start and end (`Events.res`).
  - `Hide Activity` / `Reveal Activity` with v1's footnotes.
- **Domain** (`src/domain/activities.ts`, tested): `withRule` (replace the rule with the same
  pattern), `ruleFor`, `alsoMatches` (the titles a rule would also claim). 133 tests.
- The Summary passes the visible week to the screen, as v1 did.
- The E2E fortnight gains `Gym` and `Gym legs`, two titles sharing a start, so the blast
  radius has something to show.

## Evidence

`maestro test .maestro/activity.yaml` on an E2E Release build, iPhone 17 Pro, iOS 27.2, all
steps `COMPLETED` in light and in dark. On a real (seeded) fortnight, uncategorised and grey:

1. Sleep's detail: [compare-11.png](./compare-11.png) (v1 left), its events
   [light-11b-activity-events.png](./light-11b-activity-events.png).
2. **A rule changes the chart**: Sleep set to Rest, and the indigo band appears at the bottom
   of every bar, the week's biggest category: [before](./light-12-before-rule.png),
   [after](./light-12-after-rule.png).
3. **The blast radius shows**: `Gym` widened to `Starts With` reads
   `Also matches 1 other activity: Gym legs` ([light-11c-blast-radius.png](./light-11c-blast-radius.png)),
   and `Gym legs` then resolves to Exercise ([light-11d-claimed.png](./light-11d-claimed.png)).
4. Hide, then Reveal, asserted by the flow.

Dark: the same names with `dark-`. [check.txt](./check.txt): `npm run check`.

## Differences from v1

| v1 | Now | Why |
|---|---|---|
| Edge-to-edge rows, uppercase headings | SwiftUI `Form` | D27 |
| Exact rules only | The Match row with its live count | Issue #13, spec/30-screens.md "Kept from v2" |
| Times in 24 h (`22:00`) | The device's format | The OS's locale |
| `Sat - 7 Nov` | Day and month in the device's order (`Fri - Nov 13` in en-US) | The OS's locale |

## Not done here

- A title claimed by another activity's widened rule shows its own Match row as `Exact`;
  it does not yet say which rule claims it.
- The Sorter's `Make a Rule…` from a selection (D26) is slice 8.
- Rules live in memory until slice 7 persists the settings.

## Lessons

- Every Maestro tap on a row near the floating tab bar or under the navigation bar must
  centre the row first: three of this slice's failures were taps landing on chrome.
- A SwiftUI `Text` beside a fixed-width bar wraps by character when squeezed (`7` above `h`);
  `fixedSize()` keeps a duration on one line.
