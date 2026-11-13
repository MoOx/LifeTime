# Slice 5b: the Summary as cards (D28)

Done 2026-11-13 (docs/spec/60-slices.md, slice 5b; INTENT.md D28;
[reference/health-27.md](../../reference/health-27.md)).

## What changed

- **Section titles** of the feed use SwiftUI's own increased header prominence
  (`Section prominent`, `src/ui/Form.tsx`): bold and in the label colour, as Health's "This
  Week". Their actions (`Show This Week`, `Customize report`) are unchanged.
- **Weekly Chart card**: `Total Logged Time` moves from a row under the chart to the top of
  the card, as Health's figure beside its chart, drawn with the numbers large and the units
  small (`DurationMetric`, `src/ui/Metric.tsx`, from `durationParts` in `src/domain/time.ts`,
  tested). A divider, then the pager, unchanged. VoiceOver reads the figure as one value.
- **Top Activities card** opens with a sentence that sums up the week, as Health's cards:
  "Sleep took the most time: 1d 20h 55m, 52% of everything logged." The rows follow,
  unchanged.
- The notices of slice 4b sit above, the `Reveal Hidden Activities` button below.

## Evidence

`maestro test` on an E2E Release build, iPhone 17 Pro, iOS 27.2, every step `COMPLETED`,
in light and in dark: `.maestro/summary.yaml` (40 steps), `.maestro/calendar.yaml` (46),
`.maestro/activity.yaml` (50). [check.txt](./check.txt): `npm run check`, 134 tests.

| | Comparison (v1 left) | Light | Dark |
|---|---|---|---|
| 12 Top | [compare-12.png](./compare-12.png) | [light-12-top.png](./light-12-top.png) | [dark-12-top.png](./dark-12-top.png) |
| 14 Scrolled | [compare-14.png](./compare-14.png) | [light-14-scrolled.png](./light-14-scrolled.png) | [dark-14-scrolled.png](./dark-14-scrolled.png) |
| 15 Bottom | [compare-15.png](./compare-15.png) | [light-15-bottom.png](./light-15-bottom.png) | [dark-15-bottom.png](./dark-15-bottom.png) |
| 16 Previous week | [compare-16.png](./compare-16.png) | [light-16-previous-week.png](./light-16-previous-week.png) | [dark-16-previous-week.png](./dark-16-previous-week.png) |
| A real fortnight (calendar) | | [light-12-calendar-week.png](./light-12-calendar-week.png) | [dark-12-calendar-week.png](./dark-12-calendar-week.png) |

No side-by-side with Health: MoOx's screenshots hold his health data and stay out of the
repository. The comparison was made by eye against them.

## Differences from v1

| v1 | Now | Why |
|---|---|---|
| Uppercase grey group headings | Bold section titles in the label colour, SwiftUI's increased prominence | D28, Health's feed |
| `Total Logged Time` as a row under the chart, `1d 5h` | At the top of the card, numbers large and units small | Health's figure beside its chart |
| Top Activities starts with its rows | A summary sentence first (new text) | Health's cards open with one |

## Not done here

- Health's coloured heading inside each card (category icon and name) has no obvious
  counterpart for the whole week; it fits the activity screen, a later step.
- Large text sizes: slice 9.
