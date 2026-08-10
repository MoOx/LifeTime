# Screen blueprints

*What v1 actually put on the screen, block by block, extracted from its source rather than
from memory.*

---

## 0. Why this exists, and how to read it

`SPEC.md` describes what the app **does** — the domain, the computations, the navigation
map. It is a functional specification, and it turned out not to be enough: rebuilding from
it meant re-reading v1 screen by screen, on demand, and losing a detail each time. The
duration slider in the goal editor is the clearest example — it was there
(`GoalEdit.res:270-300`), it was replaced by chips, and nobody noticed until the build was
on a phone.

This document is the other half: **constructional**. For each screen, every block in order,
every string verbatim, every control, every state, with a citation into the v1 source so
any line here can be checked in seconds.

Rules for this document:

- **Cited or absent.** Every claim carries a `file:line` from the `main` branch. Where a
  screen has not been extracted yet, it says so rather than being described from memory.
- **Intent, not pixels.** v1's *styling* is deliberately not preserved — it hardcoded the
  iOS type ramp and shipped it to Android, which is the defect this rewrite exists to fix.
  What is preserved is the **structure and the wording**: a group heading with an action, a
  footnote under a group, a tinted check, a centred destructive row.
- **Strings are quoted exactly.** Where a v1 string is wrong (typo, awkward phrasing) it is
  quoted as-is and the correction is proposed separately, so the two are never confused.

---

## 1. The component grammar

Everything in v1 was built from six pieces, in `src/components/shareable/`. Rebuilt in
`src/ui/List.tsx`.

| v1 | What it is | v2 |
| --- | --- | --- |
| `BlockHeading` (`components/BlockHeading.res`) | Group heading above a list | `ListHeader title` |
| `BlockHeadingTouchable` (`BlockHeadingTouchable.res`) | Blue text action on the heading's right | `ListHeader action` |
| `ListItem` (`shareable/ListItem.res:1-34`) | Row: `left` slot, children, `right` slot; iOS press state `backgroundGray5`, Android ripple | `ListRow` |
| `ListItemText` (`ListItemText.res`) | The row's text, optional `color` + `center` | `ListRow title` + `destructive` / `centeredAction` |
| `ListSeparator` (`ListSeparator.res`) | Hairline; `spaceStart` insets it past the leading icon | `ListGroup separatorInset` |
| `BlockFootnote` (`BlockFootnote.res`) | Small grey explanation under a group | `ListFootnote` |
| `ListItemChevron` (`ListItemChevron.res`) | Disclosure chevron | `ListRow chevron` |

Two recurring accessories worth naming, because they carry meaning:

- **Tinted check.** `SVGCircle` when unselected, `SVGCheckmarkcircle` when selected, both
  filled with the *item's own colour* — the calendar's colour in Filters
  (`Filters.res:60-68`), the category's colour in ActivityOptions
  (`ActivityOptions.res:94-97`). Not a generic accent tick.
- **Separator inset arithmetic.** `Spacer.size(S) *. 2. +. NamedIcon.size`, written out at
  three call sites (`ActivityOptions.res:100`, `SettingsView.res:8`, `TopActivities.res:110`).
  In v2 this is `layout.separatorInset`, derived once.

---

## 2. Welcome — `components/Welcome.res`

The first thing anyone sees. Shown before permission is requested.

**Structure** (`Welcome.res:82-172`)

1. **Pitch block**, whole block tappable → continue (`Welcome.res:96`)
   - App icon, 76 pt (52 pt when window height ≤ 650) (`Welcome.res:99-110`)
   - `"Welcome to"` — weight 100, `adjustsFontSizeToFit`, 1 line (`Welcome.res:113-118`)
   - `"LifeTime"` — weight 800, accent colour (`Welcome.res:119-124`)
   - `"Your personal coach, helping you to reach your goals and spend your valuable time on things you love."` (`Welcome.res:126-128`)
2. **Bottom block**
   - Calendar icon + `"LifeTime needs access to your calendar to show activity reports & suggestions. Your data stay on your device."` — whole row tappable → continue (`Welcome.res:150-158`)
   - `"About LifeTime & Privacy..."` → Privacy screen (`Welcome.res:160-172`)
   - Primary button `"Continue"`, `testID="WelcomeContinue"` (`Welcome.res:176`)

**Animation** (`Welcome.res:34-79`) — two staged entrances, and they are the reason the
screen feels considered rather than perfunctory:

| Element | Delay | Motion |
| --- | --- | --- |
| Pitch | 750 ms | scale 0.75 → 1 (spring, tension 1) + opacity 0 → 1 over 1200 ms |
| Bottom | 1250 ms | translateY 200 → 0 (spring) + opacity 0 → 1 over 1200 ms |

**Responsive rule:** `isWindowTall = height > 650`; drives icon size and the two vertical
gaps (`Welcome.res:81, 99-112`).

**v2 status:** not built. This is the "tutorial" to preserve.

---

## 3. Home / Summary — `components/Home.res`

Title: `"Your LifeTime"` (`Home.res:6`).

**Structure, in order** (`Home.res:120-300`)

1. **Header** (`Home.res:121-136`)
   - `TitlePre`: today, uppercased — `"MONDAY 10 AUGUST"` (`Home.res:124-133`)
   - `"Your LifeTime"`, largeTitle weight 700, `allowFontScaling=false`
2. **`NoEventBox`** — the contextual empty states, see §3.1 (`Home.res:169`)
3. **Heading `"Weekly Chart"`** + action `"Show This Week"`, shown only when the visible
   week is not the current one (`Home.res:171-179`)
4. **Chart card**
   - Caption line, one of (`Home.res:186-198`):
     - `"Daily Average"` — current week
     - `"Last Week's Average"` — previous week
     - `"4 - 10 Aug Average"` — any older week
   - Horizontal paged `ScrollView` over **6 weeks**, `pagingEnabled`, one `WeeklyGraph` per
     page, page width = window width − 2 × margin (`Home.res:200-238`)
   - Auto-scrolls to the last page on mount, inside `requestAnimationFrame` (`Home.res:110-118`)
   - Row: `"Total Logged Time"` + the total (`Home.res:241-268`)
5. **Footnote**: `"Updated "` + relative time, plus an 8 pt `ActivityIndicator` while
   refreshing (`Home.res:271-275`)
6. **`TopActivities`** — see §3.2 (`Home.res:277-284`)
7. **Centred blue row**: `"Reveal Hidden Activities"` / `"Mask Hidden Activities"`,
   toggling `activitiesSkippedFlag` (`Home.res:286-300`)

**Refresh:** pull-to-refresh at the screen level, plus a re-read whenever the app returns
to the foreground (`Home.res:26-32`).

### 3.1 Empty states — `components/NoEventBox.res`

Materially different from what v2 built, in two ways: it looks at the **last two weeks**,
not one, and each state offers **two buttons**.

Evaluated over week −0 and week −1 (`NoEventBox.res:12-74`). Shared suffix, appended to the
first message only (`NoEventBox.res:76-79`):

> `" LifeTime can help you to understand how you use your time and rely on calendar events to learn how you use it. By saving events into your calendars, you will be able to visualize reports so you can take more informed decisions about how to use your valuable time."`

| Condition | Message | Buttons |
| --- | --- | --- |
| No events in either week | `"LifeTime could not find any events on the last two weeks."` + suffix | `Get Started` (primary), `Open Calendar` (simple) |
| Only all-day events | `"LifeTime could not find any relevent events on the last two weeks. All day events are not suitable for time tracking."` | `Get Started`, `Open Calendar` |
| Only skipped calendars | `"LifeTime could not find any recent events that aren't part of skipped calendars."` | `Help me customize settings`, `Open Calendar` |
| Only skipped activities *(only when `activitiesSkippedFlag`)* | `"LifeTime could not find any recent events that aren't part of skipped activities."` | `Toggle Hidden Activities`, `Open Calendar` |

*(`NoEventBox.res:81-159`. "relevent" is v1's typo — corrected to "relevant" in v2, noted
here so the diff is deliberate.)*

Appears with a spring scale + fade (`NoEventBox.res:161-177`), and carries a soft shadow
(`NoEventBox.res:186-192`).

**v2 status:** built, but one-week and single-action. Needs the two-week window and the
second button.

### 3.2 Top activities — `components/TopActivities.res`

- Heading `"Top Activities"` + action **`"Customize report"`** → Filters (`TopActivities.res:31-39`)
- 8 rows by default (`TopActivities.res:6`), with show-more / show-less
- Row: category icon tinted with the category colour (left) · title, 1 line, `callout` ·
  under it a bar + duration · chevron right (`TopActivities.res:76-110`)
- Bar width = `duration / maxDuration * (rowWidth − 85 − 4 × space)`; the 85 reserves room
  for the duration string (`TopActivities.res:28`)
- Separator inset past the icon (`TopActivities.res:110`)
- Empty: `"No activities"` (title3, weight 500) + `"You should add some events to your calendar or activate more calendars."` (footnote) (`TopActivities.res:47-64`)

---

## 4. Activity detail — `components/ActivityOptions.res`

Three blocks, not one list.

1. **Heading `"Category"`** (`ActivityOptions.res:69`)
   - One row per category, all 9, in declaration order
   - Left: the category's icon, filled with its colour
   - Right: `SVGCircle` (unselected) / `SVGCheckmarkcircle` (selected), **in the category's
     colour** (`ActivityOptions.res:94-97`)
   - Tapping writes an `exact` rule for this title, replacing any existing one
     (`ActivityOptions.res:74-92`)
   - `testID="ActivityOption_Category_<id>"`
2. **Heading `"Events"`** → the events behind the number, for the visible week
   (`ActivityOptions.res:108-113`), rendered by `components/Events.res`:
   - Sub-heading with the range: `"4 - 10 Aug"` (`Events.res:36-44`)
   - Empty: `"No events"` + `"You should add some events to your calendar or activate more calendars."` (`Events.res:49-66`)
3. **Centred red row**: `"Hide Activity"` / `"Reveal Activity"` (`ActivityOptions.res:115-133`)
   - Footnote: `"This will hide similar activities from all reports."` /
     `"This will reveal similar activities in all reports."` (`ActivityOptions.res:136-142`)

**v2 status:** built with the right three blocks. Missing: the events list shows the week,
not 6 weeks; the tinted check is present. Added in v2: the **Match** row (issue #13).

---

## 5. Filters — `components/Filters.res`

- Heading `"Calendars"` + action toggling between **`"Hide All"`** and **`"Show All"`**;
  shows `"Hide All"` when nothing is currently skipped (`Filters.res:20-52`)
- Row per calendar: title, then its `source` in caption grey underneath; right = tinted
  circle/check **in the calendar's own colour** (`Filters.res:58-93`)
- Separator inset `Spacer.size(S)` — a small inset, not the icon-width one (`Filters.res:95`)

**v2 status:** built, plus the per-calendar category and the rules list.

---

## 6. Settings — `components/SettingsView.res`

Icon column 28 pt; separator inset `2 × S + 28` (`SettingsView.res:5-7`).

1. Large title `"Settings"` (`SettingsView.res:23-31`)
2. Ungrouped row: `"Notifications"` → notifications screen, blue badge icon, chevron
   (`SettingsView.res:33-40`)
3. **Heading `"Theme"`** (`SettingsView.res:43`)
   - `"Light"` — sun icon, blue (`SettingsView.res:45-55`)
   - `"Dark"` — moon icon, **indigo** (`SettingsView.res:57-67`)
   - `"Auto"` — moonshine icon, **purple** (`SettingsView.res:69-79`)
   - Right: blue checkmark on the active one, nothing on the others
   - Footnote: `"Auto theme will switch between Light & Dark automatically to match your system settings."` (`SettingsView.res:81-84`)
4. **Heading `"More"`** (`SettingsView.res:86`)
   - `"Help"` — info icon (`SettingsView.res:88-94`)
   - `"Welcome Screen"` — play-circle icon; **re-opens the onboarding on demand** (`SettingsView.res:96-102`)
   - `"Calendar App"` — calendar icon, opens the system calendar (`SettingsView.res:104-110`)
   - `"App System Settings"` — gear icon (`SettingsView.res:112-118`)
5. Separated at the bottom: `"Danger Zone"` → its own screen (`SettingsView.res:120-131`)

**v2 status:** built with a different grouping. Missing: `"Welcome Screen"` (no onboarding
yet), Help, Danger Zone, per-option icon colours.

---

## 7. Goals — `components/Goals.res`

1. Large title `"Goals"` + a **`+` button** in the header right, `testID="Goals_Button_AddAGoal"` (`Goals.res:58-92`)
2. **When there are no goals** (`Goals.res:93-154`):
   - Two paragraphs, `subhead`:
     - `"LifeTime lets you visualize the time you spend on everything. This allows you to take more informed decisions about how to use your valuable time."`
     - `"You can help yourself by adding goals & limits you would like to respect. LifeTime will try to remind you when you successfully achieve your goals & respect your limits and can help your to improve your self-discipline if needed."`
   - Heading `"Minimum to achieve"` → row `"Add a Goal"`, scope icon in **green**
   - Heading `"Maximum to respect"` → row `"Add a Limit"`, hourglass icon in **orange**
   - *This is the part v2 flattened into one "Add a goal" button, losing the distinction
     between the two things the app measures at the moment the user first meets them.*
3. One `GoalCard` per goal (`Goals.res:163-181`)

**v2 status:** built, but the empty state is a single generic block.

---

## 8. Goal editor — `components/GoalEdit.res`

1. **Heading `"Type"`** — two rows (`GoalEdit.res:172-196`)
   - `"Goal to Reach"` / `"Limit to Respect"`
2. **Heading `"Days"`** (`GoalEdit.res:202-241`)
   - **Seven circles in a row**, day letter above, `SVGCircle` (off, grey) /
     `SVGCheckmarkcircle` (on, blue) below
   - Footnote: `"Select the days where you would like to respect this goal."`
3. **Heading `"Duration"`** (`GoalEdit.res:242-359`)
   - A row of **quick-duration chips**, evenly spread, blue subhead weight 600,
     `testID="GoalEdit_quickDuration_<n>"`
   - **and below it a slider** (`GoalEdit.res:288-300`): `min 0`, `max 1440`, **`step 15`**,
     `testID="GoalEdit_durationSlider"`, with `"0"` and `"24"` captions either side and five
     dashes drawn behind the track as tick marks
   - Footnote: `"Goals are mesured on a weekly basis. The time spent on an entire week is what matters to achieve your goal."` *(v1 typo: "mesured")*
4. **Heading `"Category or Activity"`** (`GoalEdit.res:361-505`)
   - Categories, each expandable to the activities filed under it
   - Footnote: `"By selecting a category, all future activities in that category will be included."`
5. **Centred red row** `"Delete This Goal"` with a confirm `Alert`
   (`GoalEdit.res:513-532`): title `"Delete This Goal"`, buttons `Cancel` (default) and
   `Delete` (destructive)

**Debounce:** everything below "Type" is hidden until a debounced flag flips
(`GoalEdit.res:199-201`) — the screen renders progressively rather than all at once.

**v2 status:** built. **Missing: the slider.** Chips alone cannot express 3 h 45.

---

## 9. Privacy — `components/Privacy.res`

Title `"LifeTime & Privacy"`, centred, largeTitle weight 700 (`Privacy.res:9, 15-20`).
One body of text, quoted here in full because it is a promise and its wording matters
(`Privacy.res:23-40`):

> LifeTime is designed to protect your information. It only runs computation on your device
> and does not share your information anywhere.
>
> The calendars access we need to run our computation is mostly read-only. All the
> informations retrieved from your calendars are only used on your device, to generate
> reports & offers you suggestions. We don't collect anything. We don't track you with any
> kind of third-party services.
>
> The settings of the application are stored on device, which includes things like:
>
> - Names of activities that are assigned to categories,
> - Categories of activities,
> - Names of calendars skipped
> - Goals informations
> - Application settings like color theme & notifications preferences
>
> This mean, unless you backup your data, you cannot recover your personal settings if you
> remove the application.
>
> In the future, if we need to share collect data to improve the application, this will be
> with your explicit consent and all the data will be anonymised to respect privacy.

**Note:** "mostly read-only" was true of v1 and is **not** true of v2 — `expo-calendar` is
only ever read from. The v2 wording should say read-only without the hedge, and that is a
strengthening, not a drift.

**v2 status:** rewritten as four illustrated points. The v1 text is more specific about
what is stored; the list of stored settings should come back.

---

## 10. Help — `components/Help.res`

Rendered from `src/md/help.md` through a markdown → JSON pipeline
(`Help.res:5-14`, `package.json` script `md:to-json`). Content not yet extracted.

**v2 status:** not built.

---

## 11. Deliberate departures

Things v2 changes on purpose. Listed so they are never mistaken for omissions.

| v1 | v2 | Why |
| --- | --- | --- |
| Navigation: `@react-navigation` stack + bottom tabs, hand-themed | `expo-router` + native tabs | v1's tab bar could not do scroll-to-top, pop-to-root, or the iOS 26 treatment |
| Screen titles drawn by the app, `allowFontScaling=false` | `headerLargeTitle` | The size and the collapse-on-scroll become UIKit's |
| Hardcoded iOS type ramp on both platforms | `AppText` roles → Dynamic Type / Material 3 | The defect this rewrite exists to fix |
| 40 hand-drawn SVGs | `expo-symbols` | Every one has a system equivalent |
| Strict-equality activity matching | prefix / suffix / contains + calendar rules | Issue #13, and the adoption blocker |
| Progress against the calendar week | progress against *scheduled* days | The bug in IMPROVEMENTS.md §A.1 |
| One-by-one categorisation | the sorter, weighted by minutes | The other adoption blocker |

---

## 12. The web target

Web is no longer only a preview harness — it is a target: a demo on the site, and possibly
a Google Calendar source for people who are already in that ecosystem.

That has one architectural consequence, and it is small because the seam already exists:
**`src/data/calendars.ts` is the only file that touches `expo-calendar`.** Everything above
it works on `TimeEvent`. So the event source becomes an interface with three
implementations — device (`expo-calendar`), demo (`domain/demo.ts`, already
platform-neutral), and later Google Calendar over HTTP — and no screen changes.

What must **not** drift: the privacy claim is per-source, not global. "Nothing leaves this
device" is true of the device and demo sources and false of a Google source, so the copy
has to be attached to the source rather than written once into the Privacy screen.

---

## 13. Still to extract

Named rather than guessed. Each needs a pass before the screen that depends on it is
rebuilt.

- `components/GoalCard.res` (368 lines) — the card's exact composition, the debug overlay,
  what the ring showed and how progress was worded
- `components/WeeklyGraph.res` (301 lines) — grid rules, hour markers, bar geometry, the
  today marker, the "no data" per-day state
- `components/SettingsNotifications.res` (247 lines) — reminder times UI, permission flow
- `components/SettingsDangerZone.res` (162 lines) — export / import / reset wording
- `components/CalendarsPermissions.res` (81 lines) — the pre-permission screen
- `components/NotificationsPermissionsPopin.res` (149 lines)
- `src/md/help.md` — the Help content
- `components/shareable/Theme.res` (295 lines) — for the *semantic* colour roles only, not
  the values
