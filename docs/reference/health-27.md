# iOS 27's Health app: what LifeTime takes from it

MoOx shared thirteen screenshots of Health on iOS 27.3 (2026-11-13) as a reference for the
look he likes. They hold his own health data and photo, so they stay out of the repository
(`.gitignore`); this note keeps what matters for LifeTime, without the data. Decision:
INTENT.md D28.

## The main lesson

Health does not draw its feed as grouped lists. It is a scroll of rounded cards on the
grouped background, under bold section titles ("This Week", "Your Schedule"), with native
controls inside the cards: tinted capsule buttons, segmented controls, chevrons. Grouped
lists, as in Settings.app, are kept for settings. D27 ("grouped lists everywhere") was too
strict for LifeTime's Summary and Goals: D28 amends it.

## Patterns, and where they go in LifeTime

| Health | What it is | In LifeTime |
|---|---|---|
| "Noise Notifications" alert | A banner in a strong colour (icon, uppercase label, date, round close button) on top of a card; under it an icon on the left, a bold title, the text in the secondary colour, a tinted capsule button | The Summary's empty states. It had inspired v1's (capture 04: indigo banner "No Events Available", a close button, "No Events", two buttons) |
| "Test your hearing" suggestion | A card with an illustration on the left, a title, the text, a filled capsule button and a close button | The invitation to use one's calendar while the Summary shows demo data |
| "This Week" cards | A heading in the category's colour with its icon and a chevron; a sentence that sums up ("You slept 6 h 36 min a day on average over the last 7 days"); a divider; bars per day with a coloured average line and the average in large type | The activity screen, and one card per main category on the Summary |
| Large numbers, small units | "5 h 33 min": digits in a large rounded weight, units smaller | Totals, averages, goals |
| Hero with a verdict | A large ring or score, then a bold sentence as the title ("Your Stand ring is on track") and a secondary explanation | A goal's screen (slice 6) |
| A week of rings | One row per day: a small ring and three values | A goal's history |
| Trends | Two averages compared over two periods, with a sentence ("Your sleep time went down over the last 10 days") | New, not v1: possible with six weeks of data |
| Pinned cards | A coloured heading with the time of the last sample, a value and a sparkline | A later idea for pinned activities |
| Segmented D / W / M / 6M | SwiftUI's segmented `Picker` | Any period switch |
| Glass back button, floating tab bar | The system's own | Already the native stack's and tab bar's (D10) |

## What it means for building

- Cards are still SwiftUI views and controls through `@expo/ui` (D27's point stands: the OS
  draws them). In a screen that has a native large title, a card is a `Form` section with a
  single row whose insets are removed, so the large title keeps collapsing as in spike 4.
- A card's banner is drawn edge to edge at the top of the card; its content then uses the
  card's own margins.
- Buttons in cards are capsules: `borderedProminent` for the main action, `bordered` for a
  secondary one, tinted with the accent colour.
