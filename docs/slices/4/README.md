# Slice 4: the calendar source

Done 2026-11-13 (docs/spec/60-slices.md, slice 4; spec/20-sources.md, "Calendar"; SCREENS.md
§3.1, §5, §10d).

## What changed

- **Calendar module** (`modules/lifetime-calendar`): LifeTime's own Expo module on EventKit,
  replacing `expo-calendar`. Read-only: access status (a class method, nothing created),
  the full-access request, calendars, events in a range, and the event store's change signal
  (`EKEventStoreChanged`). The write functions Maestro needs are compiled only when
  `EXPO_PUBLIC_E2E=1` at `pod install` (`LIFETIME_E2E`, see the podspec).
- **Sources** (`src/data/report.ts`): `demo` until access is granted, `calendar` once it is,
  `denied` when refused. The calendar is re-read on launch, on return to the foreground, when
  the Summary regains focus, and on the change signal (D13): no refresh action. v1's small
  indicator shows beside `Updated` while it reads.
- **Permission card**: `Use my calendar` on the demo row opens v1's card (SCREENS.md §10d) as
  a sheet, `Continue` asks iOS. When refused, the Summary shows the card inline with
  `Open Settings`, and the chart's grid stays empty (spec/30-screens.md, "States").
- **Empty states** (`src/features/summary/EmptyState.tsx`): the four reasons of SCREENS.md
  §3.1 over the last two weeks, v1's messages ("relevant" corrected) and buttons:
  `Get Started` (Help), `Help me customize settings` (Filters), `Toggle Hidden Activities`,
  `Open Calendar`.
- **Filters** (`app/filters.tsx`): `Calendars` with `Hide All` / `Show All`, a row per
  calendar with its source, and a check in the calendar's own colour. `Customize report` on
  the Summary opens it.
- **E2E seeding** (`src/data/e2e.ts`, `app/e2e.tsx`): `lifetime://e2e?scenario=...` seeds a
  `LifeTime E2E` calendar (empty, all-day only, a fortnight, one late event) and can mark it
  or its activities skipped. Does nothing outside E2E builds.
- The demo flows set `permissions: calendar: unset`: Maestro grants every permission by
  default, which would have skipped the demo.

## Evidence

`maestro test .maestro/calendar.yaml` on an E2E Release build, iPhone 17 Pro, iOS 27.2: all
steps `COMPLETED`, in light and in dark. The flow starts on the demo, opens the card from
`Use my calendar`, accepts iOS's real prompt, then walks the four empty reasons, Filters, a
real fortnight, and a late event, which appears with no action.

| | Comparison (v1 left) / capture | Dark |
|---|---|---|
| 03 Permission card | [compare-03.png](./compare-03.png) | [dark-03-calendar-permission.png](./dark-03-calendar-permission.png) |
| iOS's prompt, after `Continue` | [light-03b-system-prompt.png](./light-03b-system-prompt.png) | [dark-03b-system-prompt.png](./dark-03b-system-prompt.png) |
| 04 No events on the last two weeks | [compare-04.png](./compare-04.png) | [dark-04-empty-no-events.png](./dark-04-empty-no-events.png) |
| Only all-day events (not in v1's set) | [light-04b-empty-only-all-day.png](./light-04b-empty-only-all-day.png) | [dark-04b-empty-only-all-day.png](./dark-04b-empty-only-all-day.png) |
| Only skipped calendars (not in v1's set) | [light-04c-empty-only-skipped-calendars.png](./light-04c-empty-only-skipped-calendars.png) | [dark-04c-empty-only-skipped-calendars.png](./dark-04c-empty-only-skipped-calendars.png) |
| Only hidden activities (not in v1's set) | [light-04d-empty-only-skipped-activities.png](./light-04d-empty-only-skipped-activities.png) | [dark-04d-empty-only-skipped-activities.png](./dark-04d-empty-only-skipped-activities.png) |
| 17 Filters | [compare-17.png](./compare-17.png) | [dark-17-filters.png](./dark-17-filters.png) |
| A real fortnight | [light-12-calendar-week.png](./light-12-calendar-week.png) | [dark-12-calendar-week.png](./dark-12-calendar-week.png) |
| An event added afterwards | [light-18-late-addition.png](./light-18-late-addition.png) | [dark-18-late-addition.png](./dark-18-late-addition.png) |

Shipped builds cannot write: see [read-only.txt](./read-only.txt), the write functions
searched for in an E2E binary and in a build without the flag. [check.txt](./check.txt):
`npm run check`.

## Differences from v1

| v1 | Now | Why |
|---|---|---|
| Permission card over the Summary at first launch | The same card and copy, as a sheet from `Use my calendar` | Demo first, spec/30-screens.md |
| Card with a calendar glyph | No glyph: the sheet's title leads | The sheet carries the context |
| Empty-state card with a shadow and a spring entrance | A SwiftUI section with the message and its two buttons | D27 |
| Pull to refresh | Re-read on launch, foreground, focus and the store's change signal | D13 |
| `relevent` | `relevant` | Corrected strings |
| Filters as edge-to-edge rows | SwiftUI `Form` rows, checks in the calendar's colour | D27 |

Real events are uncategorised, hence grey, until rules exist: that is slice 5.

## Not done here

- `Customize report` shows calendars only; v2's per-calendar category comes with the rules
  (slice 5).
- The denied state was not driven by Maestro: answering `Don't Allow` would need a second
  install. Its card is the sheet's content with `Open Settings`.
- The change signal was not exercised by a sync from another device; the flow's late event
  is written by the app's own E2E path and picked up when the Summary regains focus.

## Lessons

- **A system alert outlives the app.** A permission prompt left unanswered by an
  interrupted run stayed on screen through uninstalls, reinstalls and relaunches, and looked
  exactly like the app prompting at launch. Three wrong diagnoses later (`expo-calendar`,
  the event store's creation, the status read), a screenshot of the home screen with the app
  uninstalled showed the truth. Before blaming the app for a system alert, check whether the
  alert is there without it. The local module stayed, for the reasons above, not for this.
- Maestro grants every permission at `launchApp` unless told otherwise
  (`permissions: calendar: unset`), and its `allow` does not grant iOS 17+'s full access.
- `openLink` from Maestro goes through iOS's "Open in LifeTime?" confirmation; the flow taps
  `Open`, and an unanswered one blocks the next run the same way.
- In zsh with `noclobber`, `cat > file` silently fails on an existing file; write with the
  editor tools or `>|`.
