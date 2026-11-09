# Screens

**[SCREENS.md](../SCREENS.md) is the authority for each v1 screen's blocks and verbatim
strings**, each cited to the v1 source; `docs/reference/v1/ios/` shows them rendered. This
file does not repeat them. It states the navigation, the headers (D10), the states, and what
differs from v1. Anything not listed as different is as in SCREENS.md and the captures.

Its "v2 status" notes describe the abandoned attempt and are not requirements, with the
exceptions listed under "Kept from v2" below.

## Navigation map

```
Root Stack
├── Tabs (native: Liquid Glass tab bar on iOS, Material navigation bar on Android)
│   ├── Summary stack
│   │   ├── Summary
│   │   └── Activity detail
│   ├── Goals stack
│   │   └── Goals
│   └── Settings stack
│       ├── Settings
│       ├── Sources (new, alpha2)
│       ├── Notifications
│       └── Reset
├── Sheet: Welcome (no swipe to dismiss)
├── Sheet: Privacy
├── Sheet: Filters
├── Sheet: New goal / Edit goal
├── Sheet: Help
└── Sheet: Sorter (new)
```

Tab bar: re-tapping the active tab pops to root and scrolls to top, the platform behaviour.
Navigation state is not restored after a cold start: v1 reopened sheets (observed during the
captures), and the app starts on the Summary.

## Headers (D10)

Conditions for the iOS large title are established by spike 1, and must hold on every large
header: the scroll view is the screen's first scrollable descendant, it uses
`contentInsetAdjustmentBehavior="automatic"`, and `headerTransparent` is not set.

| Screen | iOS | Android, at the Android pass (if the spike passes) | Android fallback | Actions |
|---|---|---|---|---|
| Summary | Large title, collapses as in Mail | Large top app bar, collapsing | Small | None |
| Goals | Large title | Large, collapsing | Small | `+` trailing |
| Settings | Large title | Large, collapsing | Small | None |
| Sources | Large title | Medium, collapsing | Small | Back |
| Activity detail | Small, title is the activity, minimal back button | Small | Small | Back |
| Notifications | Small | Small | Small | Back |
| Reset | Small | Small | Small | Back |
| Filters | Sheet, small | Sheet or full-screen with small bar | | `Done` trailing |
| New goal / Edit goal | Sheet, small | Same | | `Cancel` leading, `Add` / `Save` trailing |
| Privacy, Help | Sheet, small; the title is in the content, as in v1 | Same | | `Done` trailing |
| Sorter | Sheet, small | Same | | `Done` trailing |
| Welcome | No header | No header | | None |

The Summary's date line (`MONDAY 9 NOVEMBER`) sits above v1's title. A native large title
cannot hold it, so it becomes the first line of the content, under the header.

## Kept from v2, on purpose

Decided or fixed during the v2 attempt, and correct: progress against scheduled days; the
Match row on Activity detail with its live count (issue #13); `Get Started` opening Help; corrected typos
(below); the demo in memory; expo-symbols everywhere with both platform names.

## Different from v1

| Screen | v1 | New | Why |
|---|---|---|---|
| First launch | Welcome, then calendar permission | Welcome, then the Summary on demo data | [INTENT.md](../INTENT.md) §2.2 |
| Calendar permission card | Over the Summary at first launch | Same card and copy, opened by `Use my calendar` | Same |
| Summary | Pull to refresh | Always up to date: re-read on launch, focus and calendar change, v1's small indicator beside `Updated`; pull to refresh only if free of conflict with the large title | D13 |
| Summary | | Adds the demo row | Demo before permission |
| Settings (alpha2) | Rows of 10b, 10c as captured | Adds `Sources`, first row of the `More` group | New source management |
| Goal editor | Add disabled silently | Add disabled, red footnote naming what is missing | Contacts-style validation, [INTENT.md](../INTENT.md) §2.2 |
| Reset | `Create Demo Calendar`, `Remove Demo Calendar` | One row, `Show Demo Data` / `Hide Demo Data` | Demo in memory |
| Goals ring | Pace only | Switch "current progress" / "entire week", trailing above the list | [INTENT.md](../INTENT.md) §2.2 |
| Reminders prompt | Popin after the first goal, seen in capture 07 | Same content and moment, optional, as a native sheet. To revisit when the notifications' content is decided | D20 |
| Privacy | One block of text | Same text, corrected: read-only, and per source | SCREENS.md §9, §12 |

The row that opens Reset reads `Reset` in the running v1, and SCREENS.md §6 says
`Danger Zone`: the capture is right; the string is `Reset`.

## New screens

### Sources (Settings), alpha2

Large title `Sources`. One group per source, each row: icon, name, status on the right.

| Source | Status strings | Tap |
|---|---|---|
| Calendar | `On`, `Off`, `Not allowed` | Permission card, or system settings |
| Health (iOS) / Health Connect (Android) | `On`, `Off`, `No data found` | Explanation sheet, then system prompt |

Footnote per source: its privacy statement ([20-sources.md](./20-sources.md)). Group
`Coming later` is not shown: unbuilt features are not advertised.

### Sorter (from Summary, empty state and Help), alpha1

As specified in [CATEGORISATION.md](../CATEGORISATION.md) §3: title `Sort Activities`, the
coverage figure (share of logged minutes categorised), the frozen list weighted by minutes, a
guess on each row, `Accept All`.

**Select to make a rule (D26).** A `Select` action enters multi-selection. With rows selected,
the bottom action is `Make a Rule…`, which shows the deduced rule ([10-model.md](./10-model.md)):
the pattern, its mode (`Exact`, `Starts With`, `Ends With`, `Contains`), `Also matches N other
activities`, and the category. Applying it covers the selection and future events.

The same action is available on the Events list of Activity detail.

## States

Every screen below is verified in each applicable state.

| Screen | Demo | Empty | Denied | Loading |
|---|---|---|---|---|
| Summary | Demo row, full week | SCREENS.md §3.1, all four reasons | Permission card; chart grid empty | The 8 pt indicator beside `Updated` |
| Activity detail | Works; rules apply to demo | `No events` | n/a | Instant, from the same data |
| Goals | Works, one seeded goal absent; empty state first | SCREENS.md §7 | Works, rings at zero | n/a |
| Filters | Demo calendars | `No calendars` | Link to Settings | n/a |
| Sorter | Works | `Everything is sorted` | n/a | Streams suggestions into rows |
| Sources (alpha2) | Status `Off` for all | n/a | `Not allowed` with action | Status resolves per row |

## Corrected strings

| v1 | New |
|---|---|
| `relevent` | `relevant` |
| `mesured` | `measured` |
| `unecessary` | `unnecessary` |
| `informations` | `information` |
| `Data are in you clipboard` | `Data are in your clipboard` |
| `can help your to improve` | `can help you to improve` |
| `a identical reminder` | `an identical reminder` |
| `to share collect data` | `to share collected data` |
| `This mean, unless` | `This means that unless` |
| `Your data stay on your device.` | `Your data stays on your device.` |
| `as a diary` and the rest of the Help text | Unchanged, except that the Premium promise and `Upcoming features` are removed (SCREENS.md §10) |

New copy is in English (D15), in v1's voice: short, direct, no marketing.
