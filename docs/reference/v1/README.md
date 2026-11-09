# v1 — native visual reference

Captures of v1 running natively in the iOS Simulator. MoOx described v1 as *"visuellement
très propre"* — this folder is that bar, made concrete: what every screen shows and how
it is laid out, in light and dark. The new UI is checked against it **for content,
hierarchy, spacing and polish**. Headers and navigation are deliberately *not* taken from
v1: its large title was a hand-built replica, and the new app uses each platform's own
(INTENT.md D10).

How v1 was rebuilt to take them: [BUILD.md](./BUILD.md). How they are produced:
`scripts/v1/capture.sh`, driving the flows in `.maestro/v1/`.

## Conventions

- Device: **iPhone 17 Pro** simulator, iOS 26.x runtime (402 × 874 pt — the same logical
  size the v2 harness used), status bar overridden to 9:41 and full bars.
- `ios/light/NN-slug.png`, `ios/dark/NN-slug.png`.
- Data: v1's own demo calendar (Settings → Danger Zone → Create Demo Calendar), with the
  activities categorised and the three goals created exactly as v1's App Store screenshot
  flow did (`git show main:e2e/demo.e2e.js`).

## Shot list

`§` refers to [SCREENS.md](../../SCREENS.md). Every capture below was opened and checked on 2026-11-09, from one clean
pass per appearance.

| # | Screen / state | § | Flow | Light | Dark | Notes |
|---|---|---|---|---|---|---|
| 00 | First launch proof | n/a | build.sh | yes | n/a | `ios/00-launch.png`, light only: it only proves that v1 launches |
| 01 | Welcome, after its staged entrance | 2 | 01 | yes | yes |  |
| 02 | Privacy (from "About LifeTime & Privacy…") | 9 | 01 | yes | yes | Sheet over Welcome |
| 03 | Calendar permission screen, access not yet asked | 10d | 01 | yes | yes |  |
| 04 | Home, empty state (no events on a fresh simulator) | 3.1 | 01 | yes | yes | Reason "no events in either week" |
| 05 | Goals, empty | 7 | 01 | yes | yes |  |
| 06 | New goal, untouched | 8 | 01 | yes | yes |  |
| 07 | Notification permission prompt after the first goal | 10e | 01 | yes | yes | Behind it, a goal with no data yet: empty ring and "-" |
| 10 | Danger Zone | 10c | 02 | yes | yes | v1 titles this screen "Reset"; the row leading to it reads "Reset" too, not "Danger Zone" as SCREENS.md §6 says |
| 11 | Activity options (category list, events, hide) | 4 | 02 | yes | yes |  |
| 12 | Home with data, at the top | 3 | 02 | yes | yes | Captured on a Monday with a Sunday-first week, so only two bars. The full week is row 16 |
| 14 | Home, scrolled to the middle | 3, 3.2 | 02 | yes | yes | The small sticky title of v1. Same position as row 15 (identical in dark): this short week barely scrolls |
| 15 | Home, bottom (footnote, reveal hidden activities) | 3 | 02 | yes | yes |  |
| 16 | Previous week, with "Show This Week" | 3, 8b | 02 | yes | yes | The best reference for the chart |
| 17 | Filters ("Customize report") | 5 | 02 | yes | yes |  |
| 20 | New goal, filled in | 8 | 03 | yes | yes | 7h 30m by slider, as in v1's demo flow |
| 21 | Goals list (rings, cards) | 7, 8c | 03 | yes | yes | Four cards, not three: v1's demo goals plus the "Rest" goal left by flow 01 |
| 22 | Edit goal | 8 | 03 | yes | yes | Opened with the card's "..." button |
| 30 | Settings, top | 6 | 04 | yes | yes |  |
| 32 | Settings, bottom (Reset row) | 6 | 04 | yes | yes | Identical to row 30: the page fits on one screen at this size |
| 33 | Notifications | 10b | 04 | yes | yes | Permission not granted, so reminders are dimmed |
| 34 | Help, top | 10 | 04 | yes | yes |  |
| 35 | Help, "Learn More…" expanded | 10 | 04 | yes | yes |  |
|  | Home empty, only all-day events | 3.1 |  | no | no | Not captured: needs a calendar with only all-day events. Same box as row 04, message in SCREENS.md §3.1 |
|  | Home empty, only skipped calendars | 3.1 |  | no | no | Not captured: same box as row 04, different message and first button, in SCREENS.md §3.1 |
|  | Home empty, only skipped activities | 3.1 |  | no | no | Not captured: same box as row 04, different message and first button, in SCREENS.md §3.1 |
|  | Header scroll videos |  |  | no | no | Off by default: v1's header is not the reference (INTENT.md D10). `V1_RECORD=1` records them |
