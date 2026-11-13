# Slice 4b: notices as cards (D28)

Done 2026-11-13. MoOx found that some boxes had become too much `@expo/ui` lists, the empty
state above all, and shared screenshots of iOS 27's Health app
([reference/health-27.md](../../reference/health-27.md)). D27 is amended by D28: notices and
feeds are cards, grouped lists stay for settings-like screens.

## What changed

- **Card** (`src/ui/Card.tsx`): `NoticeCard`, a `Form` section with one row whose insets are
  removed, so the large title still collapses. Optional banner in the accent colour (uppercase
  label, round close button), then an SF Symbol, a Headline title, the text in Subheadline
  secondary, and capsule buttons: `borderedProminent` for the main action, `bordered` for the
  other, as Health's cards. `CalendarGlyph`: v1's calendar glyph in SwiftUI.
- **Empty states** (`src/features/summary/EmptyState.tsx`): v1's card again (capture 04): the
  banner `No Events Available` with its close button, `No Events`, the message, two buttons.
  The close button shows v1's alert, "Let's stay motivated!" (`NoEventBox.res:205-217`).
- **Calendar access** (`app/calendar-access.tsx`): v1's centred card with its glyph (capture
  03), as a form sheet sized to its content, `Continue` then `Not Now`, instead of a page
  with a large title.
- **Demo invitation**: the `Demo data` row becomes a card as Health's suggestions, `Demo Data`,
  one sentence, `Use my calendar`.
- **Access refused**: the same card, `Open Settings` then the privacy link.
- Specs: INTENT.md D28; spec/40-design.md (notice and feed cards, permission sheet);
  spec/20-sources.md (demo banner); spec/60-slices.md (slice 5b, the Summary as cards; Goals
  as cards in slice 6).

## Evidence

`maestro test` on an E2E Release build, iPhone 17 Pro, iOS 27.2, every step `COMPLETED`
(the only warnings are the optional taps on iOS's "Open in LifeTime?"):
`.maestro/calendar.yaml` (46 steps), `.maestro/summary.yaml` (40) and
`.maestro/activity.yaml` (50), each in light and in dark. [check.txt](./check.txt):
`npm run check`, 133 tests.

| | Comparison (v1 left) / capture | Dark |
|---|---|---|
| 03 Permission sheet | [compare-03.png](./compare-03.png) | [dark-03-calendar-permission.png](./dark-03-calendar-permission.png) |
| 04 No events | [compare-04.png](./compare-04.png) | [dark-04-empty-no-events.png](./dark-04-empty-no-events.png) |
| The close button's alert | [light-04e-empty-about.png](./light-04e-empty-about.png) | [dark-04e-empty-about.png](./dark-04e-empty-about.png) |
| Only all-day events | [light-04b-empty-only-all-day.png](./light-04b-empty-only-all-day.png) | [dark-04b-empty-only-all-day.png](./dark-04b-empty-only-all-day.png) |
| Only skipped calendars (the longest buttons) | [light-04c-empty-only-skipped-calendars.png](./light-04c-empty-only-skipped-calendars.png) | [dark-04c-empty-only-skipped-calendars.png](./dark-04c-empty-only-skipped-calendars.png) |
| Only hidden activities | [light-04d-empty-only-skipped-activities.png](./light-04d-empty-only-skipped-activities.png) | [dark-04d-empty-only-skipped-activities.png](./dark-04d-empty-only-skipped-activities.png) |
| Demo invitation | [light-12-demo-card.png](./light-12-demo-card.png) | [dark-12-demo-card.png](./dark-12-demo-card.png) |

Not driven: the access-refused card (as in slice 4, refusing needs a second install), and
the large text sizes (slice 9).

## Differences from v1

| v1 | Now | Why |
|---|---|---|
| Empty-state card with a shadow and a spring entrance | The card and its banner, with the OS's rounded group, no shadow, no entrance | D28; Health's cards have neither |
| `Get Started` filled, `Open Calendar` as a text link, centred | Two capsules under the text, aligned with it, filled then tinted | Health's cards |
| No icon in the empty-state card | `calendar.badge.exclamationmark` beside the title | Health's cards lead with an icon |
| `advices`, `foward` in the close button's alert | `advice`, `forward` | Corrected strings |
| Permission card over the dimmed Summary, no way out but `Continue` | A sheet sized to its content, with `Not Now` and the grabber | Demo first (spec/30-screens.md); iOS's own permission sheets |
| No demo (v1 wrote a demo calendar) | The demo card's sentence is new: "These reports come from generated events. Use your calendar to see how your own weeks are spent. It stays on this device." | The demo is in memory (spec/20-sources.md); the card says so, and where the calendar stays |

## Lessons

- `accessibilityIdentifier` on a SwiftUI stack is handed down to every element in it: the
  buttons of the first card lost their own identifiers and Maestro could not find
  `use-my-calendar`. A card's identifier now sits on its title.
- **The simulator's calendars change on their own.** On 2026-11-13 iOS added a "US Holidays"
  calendar, 122 all-day events, and the flow's "no events" became "only all-day events": the
  app was right, the flow was not isolated. Once a flow seeds, an E2E build now reads its
  `LifeTime E2E` calendar alone (`e2eIsolated` in `src/data/e2e.ts`); shipped builds are
  unaffected.
- The flow's hidden-activities scenario hid four titles while slice 5 had added `Gym` and
  `Gym legs` to the seeded week: it now hides every seeded title (`WEEK_TITLES`). Slice 5 had
  not rerun `calendar.yaml`.
- The taller demo card moved the chart down: the Summary flow's swipe now crosses the chart
  at 68 % of the height, and the bottom button is centred before it is tapped, or the tap
  lands on the floating tab bar.
- A form sheet with `sheetAllowedDetents: 'fitToContents'` sizes itself to a `Host` with
  `matchContents={{ vertical: true }}`.
