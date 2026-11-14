# What VoiceOver is given, screen by screen

Taken 2026-11-14 from the accessibility tree XCUITest sees (`maestro hierarchy`, E2E Release
build, iPhone 17 Pro, iOS 27.2, default text size, a seeded week). For a button, VoiceOver
reads the button's own label, which SwiftUI combines from its texts; the symbols listed inside
it are not read separately. "Selected" is the Selected trait (`selected: true` in the tree).

## Summary

| Element | Label | Value / trait |
|---|---|---|
| Week chart | `Sunday: 13h 15m, mostly Uncategorized. Monday: 13h 15m, mostly Uncategorized. …` | image |
| An activity row | `Sleep, 2d 1h` | button |
| The sentence under Top Activities | `Sleep took the most time: 2d 1h, 54% of everything logged.` | |

Before this slice, the chart was drawn as separate texts: seven narrow letters ("S", "M", …)
and gridline labels, with nothing about the bars (from the code; not dumped before the fix).

## Sorter

| Element | Label | Value / trait |
|---|---|---|
| Coverage | `Categorized`, `0%`, `of the time logged over these six weeks has a category.` | |
| A row's title and duration | `Gym, 10h 30m · Guess` | one element, the texts grouped |
| A row's category menu | `Category for Gym` | `Exercise` (`None` when there is no guess) |
| A row, selecting | `Gym, 10h 30m · Guess` | button, Selected when ticked |
| Selection bar | `1 selected`, `Make a Rule…` | |

Before, the menu read only its category ("Exercise"), with nothing saying which row it changed,
and the title and duration were two elements.

## Goal editor

| Element | Label | Value / trait |
|---|---|---|
| Type rows | `Goal to Reach`, `Limit to Respect` | button, Selected on the chosen one |
| Day circles | `Sunday` … `Saturday` | button, Selected when on |
| Quick durations | `30 minutes a day` … `90 minutes a day` | button |
| Slider | `Average Time per Day` | `1h` |

Before, each day's label was its name alone, with no trait saying whether it was on, and the
slider had SwiftUI's default value, its position as a percentage (from the code).

## Notifications

| Element | Label | Value / trait |
|---|---|---|
| Toggles | `Allow Notifications`, `Daily Reminders` | `0` / `1` |
| A reminder | `9:00 AM`, `Next notification`, `tomorrow at 9:00 AM` | |
| Its remove button | `Remove 9:00 AM reminder` | button |

Before, the remove button was not drawn at all (README, "Found on the way").
