# Slice 8: the Sorter and a rule from a selection

Done 2026-11-14 (docs/spec/60-slices.md, slice 8; CATEGORISATION.md §3; spec/10-model.md, "A
rule from a selection"; D26). A new screen: no v1 capture to compare with.

## What changed

- **`inferRule`** (`src/domain/activities.ts`, tested): one rule for several titles, as
  spec/10-model.md orders it: identical titles give `exact`; a common start of at least three
  characters on a word boundary gives `startsWith`; then a common end, `endsWith`; then a
  common run of whole words, `contains`; otherwise one `exact` rule per title. It never cuts a
  word ("Gymnastics" and "Gym" share nothing).
- **Sorter** (`app/sorter.tsx`), a sheet, `Sort Activities`, `Select` and `Done`:
  - the share of logged minutes that has a category, large, and `Accept All (n)`, which
    applies every keyword guess at once;
  - `To Sort`: every uncategorised title over the six weeks shown, heaviest first, frozen
    once the events are in, each with its duration, its guess and a menu to choose another
    category (an `exact` rule). A row covered since by a broader rule reads `Sorted`;
  - `Select`: tick titles, `Make a Rule…` shows the deduced pattern, its mode (a picker, as
    on the activity screen) and what else it would claim, then the category to apply it to.
- **Way in**: a Health-style card on the Summary, `Sort Activities`, while some of the time
  read from the calendar has no category (INTENT.md D28). Not on the demo, which comes sorted.
- E2E: `lifetime://e2e?scenario=late-event&title=...` names the late event, for a new "Gym
  arms" the rule should claim.

## Evidence

`maestro test .maestro/sorter.yaml` on an E2E Release build, iPhone 17 Pro, iOS 27.2: 47 steps
`COMPLETED`, in light and in dark. On a seeded fortnight with no rule, the flow opens the
Sorter from the Summary, selects "Gym" and "Gym legs" and applies `Starts With "gym"` to
Exercise, accepts every other guess, gives "CrossFit" an exact rule, sees 100 %, then adds a
"Gym arms" event that lands in Exercise with no action. The other flows pass again in light:
`summary` 40, `calendar` 46, `activity` 50, `goals` 61, `settings` 75 (`calendar` and
`activity` on a second run: the first tapped Welcome's `Continue` during its entrance, with
the machine's load at 64). [check.txt](./check.txt): `npm run check`, 152 tests.

The dark run is from the build before the card was limited to real calendars and the file
formatted, which changed nothing in this flow.

| | Light | Dark |
|---|---|---|
| The way in, on a fortnight with no rule | [light-40-sorter-card.png](./light-40-sorter-card.png) | [dark-40-sorter-card.png](./dark-40-sorter-card.png) |
| The Sorter: 0 %, six titles, five guesses | [light-41-sorter.png](./light-41-sorter.png) | [dark-41-sorter.png](./dark-41-sorter.png) |
| "Gym" and "Gym legs" give `Starts With "gym"` | [light-42-rule-from-selection.png](./light-42-rule-from-selection.png) | [dark-42-rule-from-selection.png](./dark-42-rule-from-selection.png) |
| After `Accept All` and one exact rule: 100 % | [light-43-all-sorted.png](./light-43-all-sorted.png) | [dark-43-all-sorted.png](./dark-43-all-sorted.png) |
| The Summary, sorted, the card gone | [light-44-summary-sorted.png](./light-44-summary-sorted.png) | [dark-44-summary-sorted.png](./dark-44-summary-sorted.png) |
| A new "Gym arms", Exercise with no action | [light-45-new-event-claimed.png](./light-45-new-event-claimed.png) | [dark-45-new-event-claimed.png](./dark-45-new-event-claimed.png) |

## Not done here

- The Sorter's other ways in (spec/30-screens.md: the empty state and Help). The empty state
  has no events to sort; Help would need a link in its text.
- The same `Make a Rule…` on the activity screen's Events list (spec/30-screens.md).
- The analysed window is the six weeks the Summary reads, not `categorisationWeeks`.

## Lessons

- A screen with its own report starts empty and reads the calendar: freezing the list on the
  first render froze nothing. It now freezes once events are in.
- The card moved the Summary's content down, so three earlier flows waited for "Deep work"
  off screen; they now wait for the card, the sign that the week is in.
