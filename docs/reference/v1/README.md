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

`§` refers to [SCREENS.md](../../SCREENS.md). Fill in the last column while checking each
capture; add rows for any state worth keeping that the flows did not plan for.

| # | Screen / state | § | Flow | Light | Dark | Notes |
|---|---|---|---|---|---|---|
| 00 | First launch proof | — | build.sh | | — | |
| 01 | Welcome, after its staged entrance | 2 | 01 | | | |
| 02 | Privacy (from "About LifeTime & Privacy…") | 9 | 01 | | | |
| 03 | Calendar permission screen, access not yet asked | 10d | 01 | | | |
| 04 | Home, empty state (no events on a fresh simulator) | 3.1 | 01 | | | |
| 05 | Goals, empty | 7 | 01 | | | |
| 06 | New goal, untouched | 8 | 01 | | | |
| 07 | Notification permission prompt after the first goal | 10e | 01 | | | |
| 10 | Danger Zone | 10c | 02 | | | |
| 11 | Activity options (category list, events, hide) | 4 | 02 | | | |
| 12 | Home with data, at the top | 3 | 02 | | | |
| 14 | Home, scrolled to the middle | 3, 3.2 | 02 | | | |
| 15 | Home, bottom (footnote, reveal hidden activities) | 3 | 02 | | | |
| 16 | Previous week, with "Show This Week" | 3, 8b | 02 | | | |
| 17 | Filters ("Customize report") | 5 | 02 | | | |
| 20 | New goal, filled in | 8 | 03 | | | |
| 21 | Goals with three goals (rings, cards) | 7, 8c | 03 | | | |
| 22 | Edit goal | 8 | 03 | | | |
| 30 | Settings, top | 6 | 04 | | | |
| 32 | Settings, bottom (Danger Zone row) | 6 | 04 | | | |
| 33 | Notifications | 10b | 04 | | | |
| 34 | Help, top | 10 | 04 | | | |
| 35 | Help, "Learn More…" expanded | 10 | 04 | | | |
