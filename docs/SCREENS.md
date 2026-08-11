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

**v2 status:** built, as `app/welcome.tsx` — the copy above verbatim, the two staged
entrances, and the responsive icon rule. It is reachable again from Settings → "Welcome
screen", so the tutorial is not a one-time thing you can never see twice.

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

**v2 status:** built, as `features/summary/EmptyState.tsx` — all four reasons, the two-week
window, and both buttons on each. The reason is derived by `explainEmptinessOverWeeks`
rather than by the screen, so the four messages cannot drift apart from the conditions that
select them. `"Get Started"` reads `"How to get started"` and goes to Help (§10).

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

**v2 status:** built with the right three blocks, the tinted check, and the events list over
the full six weeks. Added in v2: the **Match** row (issue #13), with a live count of how
many other titles a widened rule would claim.

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

**v2 status:** built with a different grouping, and now complete: `"Welcome screen"`, Help
(§10) and Backup & reset (§10c) all have their rows. Per-option icon colours are not
carried over — v1 tinted each row's icon a different hue, which turned a settings list into
a colour chart; the symbols are all accent-tinted here and the groups carry the structure.

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

**v2 status:** built, slider included — chips for the nine common durations, and a slider
under them for everything between. The day toggles carry their own name inside the circle
rather than a label above a tick.

---

## 8b. The weekly chart — `components/WeeklyGraph.res`

Geometry, exactly. Every number here is from the source, because a chart described
approximately is a chart redrawn wrongly.

**Constants** (`WeeklyGraph.res:6-10`)

| Name | Value | Meaning |
| --- | --- | --- |
| `graphHeight` | `140` | plot height |
| `graphLetterHeight` | `16` | strip below the plot for the day letters |
| `slices` | `4` | horizontal grid divisions — *always four*, not a step in hours |
| `rightSpace` | `28` | gutter reserved to the right of the plot, commented `// Enough for "99m"` |

The plot is `width − rightSpace` wide (`WeeklyGraph.res:253`), so the axis labels hang in
the gutter rather than over the bars.

**Horizontal grid** — `GridXAxis` (`WeeklyGraph.res:53-107`)

- `maxDuration` is divided into **4 equal slices**, whatever it is. Not "a line every 2 h".
- A hairline at every slice, `gray5`.
- Labels only on slices 1…3 — the baseline and the top are unlabelled
  (`WeeklyGraph.res:78`), so three numbers, never five.
- **The unit switches with the scale** (`WeeklyGraph.res:59`): above one hour the labels are
  hours (`"3h"`), at or below one hour they are minutes (`"45m"`). Formatted with no
  decimals.

**Vertical grid** — `GridYAxis` (`WeeklyGraph.res:109-161`)

- A **dashed** vertical line at every day boundary — eight for seven days
  (`nbDash = days + 1`), colour `gray4`, drawn by a `Dash` component.
- The day letter sits at the **bottom left of each column**, just right of its dash
  (`left = 100 / days * i`, `horizontal=XXS`), font size 10, `allowFontScaling=false`.
  It is *not* centred under the bar.

**Bars** (`WeeklyGraph.res:255-285`)

- One column per day, each `100 / days` wide; the bar itself is **60 % of its column**,
  top corners radius 3, `overflow: hidden`.
- Height per segment = `graphHeight / maxDuration * minutes`.
- An event crossing midnight is clamped into each day it touches (`WeeklyGraph.res:191-206`).
- **Stacking order comes from the week's category totals, reversed** — the week's biggest
  category ends up at the bottom of every bar (`WeeklyGraph.res:265-267`).

**Scale rounding** (`WeeklyGraph.res:238-245`) — `roundTo = max > 60 ? 240 : 20`, then round
up. Comment: *"the idea here is to avoid when divided for visual slice to have values with
digits"*.

**v2 status:** built to the geometry above — 140 pt plot, four grid slices with the
hours/minutes unit switch, the dashed vertical divider at every day boundary, and the day
letter left-aligned to its own dash. `chartGrid` is pure and tested, so the ladder cannot
drift from the maximum it is derived from.

*Deliberate departure:* v2 stacks by category declaration order rather than by week totals.
v1's order is consistent within a week but changes between weeks, so a colour band moves as
you swipe. Declaration order is stable everywhere. This one is a fix, not an omission.

---

## 8c. Goal card — `components/GoalCard.res`

**Look** (`GoalCard.res:173-176`, `225-231`) — a filled card in the goal's own category
colour, with an SVG linear gradient to black at 0.5 opacity over it, corner radius
`Theme.Radius.button`. All text is the on-dark palette regardless of light/dark mode.

**Layout**

1. Top row (`GoalCard.res:233-310`)
   - `"GOAL"` / `"LIMIT"`, uppercased, caption1 weight 700, dimmed
   - Goal title, **title1 weight 500**, one line
   - Footnote: duration per day, then `", "`, then the cadence — e.g. `"1h, every weekday"`
   - Right: a `SVGMore` button, 24 pt, `rgba(255,255,255,0.75)` → edit
2. Bottom row (`GoalCard.res:311-352`)
   - `ActivityRings` with an icon at its centre, 36 pt, `rgba(255,255,255,0.1)`:
     scope for a goal, hourglass for a limit, checkmark otherwise
   - `"Daily Average"` (caption1 weight 300) and the value (title2 weight 500), `"-"` when
     zero

**The cadence table** (`GoalCard.res:276-296`) is richer than v2's, and the extra cases are
the ones people actually have:

| Days (Sunday-indexed) | Text |
| --- | --- |
| all seven | `"every day"` |
| Mon–Fri | `"every weekday"` |
| Mon–Fri minus one | `"every weekday except monday"` … `"…except friday"` |
| Sat + Sun | `"every day of the weekend"` |
| anything else | short day names, comma-joined |

**Progress model** (`GoalCard.res:50-68`)

```
durationProgress        elapsed fraction of the calendar week, at now
durationProgressTonight elapsed fraction of the calendar week, at end of today
proportionalGoal        durationPerWeek × durationProgress
progress                currentTime / proportionalGoal
progressTonight         currentTime / proportionalGoalTonight   ← what the ring shows
totalProgress           currentTime / durationPerWeek
proportionalAverageTime currentTime / (numberOfDays × durationProgressTonight)
```

Two things follow, and both matter:

- **The fraction is of the calendar week, not of the scheduled days.** This is the bug in
  IMPROVEMENTS.md §A.1, visible here in one line: a weekday goal is measured against a
  denominator that keeps growing through Saturday and Sunday. v2's fix stands.
- **v1's ring showed the pace** (`progressTonight`), never the period total. v2 defaults to
  the period reading and offers pace as the alternative — a deliberate change, made because
  a ring that fills across the week is the thing worth filling, and an empty one on Monday
  morning is a prompt rather than a verdict.

`isAlreadyDone` / `canBeDone` (`GoalCard.res:64-68`) select the ring's colour pair, and
their definition flips between goal and limit — a goal is done when `totalProgress > 1`, a
limit is "done" when what remains exceeds the week's remaining wall-clock.

### The ring itself — `shareable/components/ActivityRings.js`

Read late and worth the delay: it is the most carefully built component in v1, and it uses
**no canvas at all**. Two half-circles clipped from a round `View`, a `MaskedView` whose
mask is a PNG (`ActivityRings.mask.png`) turning a solid `startColor` into an
`endColor` sweep, and Reanimated rotations so the whole thing runs on the UI thread.

The geometry is a workaround for not having a canvas; Skia gets there directly. The
**behaviours** are the part that was designed, and all three had been missed:

| Behaviour | Where | Why it matters |
| --- | --- | --- |
| Animates in over **1500 ms** on `bezier(0.32, 0.12, -0.1, 1)` | `ActivityRings.js:394, 172-178` | The negative third control point overshoots slightly. A ring that appears at 76 % is a graphic; one that sweeps there is a measurement. |
| The **end cap casts a shadow that strengthens as the arc closes** — opacity 0.5 → 1 between 80 % and 100 % of a turn | `ActivityRings.js:283-289` | Before that there is nothing underneath to cast onto. It arrives exactly when you need to see which end is on top. |
| The **start cap vanishes past a full turn** | `ActivityRings.js:265` | Once lapped, the start is underneath; drawing it is simply wrong. |
| Negative progress mirrors the ring (`scaleX: -1`) | `ActivityRings.js:180` | Intended for limits running the other way — `GoalCard.res:158-163` has the call commented out. Never shipped. |
| Concentric rings with `spaceBetween` | `ActivityRings.js:420-430` | Fitness-style stacking. Only ever used with one ring. |

**v2 status:** the ring now animates on the same curve, hides its start cap past a turn,
and carries the cap shadow with v1's opacity ramp. Not carried over: the mirrored negative
progress and the concentric stacking, neither of which v1 shipped either.

**v2 status:** built — the dark category-tinted card with its gradient to 50 % black, the
white ring on top of it, the `"Daily average"` figure, and `describeDays` covering all of
v1's cadence phrasings including "every day of the weekend" and "every weekday except
<day>". Both figures under the ring use `formatHoursMinutes`, which does not roll up into
days: "15h 1m of 40h" rather than "15h 1m of 1d 16h".

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

## 10. Help — `components/Help.res` + `src/md/help.md`

Markdown, compiled to JSON at build time (`package.json` script `md:to-json`) and rendered
by `MarkdownJsonRenderer` (`Help.res:5-14`). Title from the document's own `#` heading.

Structure of `help.md` (§ headings verbatim):

1. `# How to use LifeTime` — the same two sentences the empty state uses
2. `## Start by feeding your calendar` — *"LifeTime will mostly read events that already
   happened as a diary. The more you feed your calendar, the more LifeTime will be able to
   show you accurate data."* Then a collapsible `<details>` block, *"Learn More about how to
   use your calendar app"*, with per-provider links: Apple Calendar, Google Calendar,
   Microsoft Outlook, Others.
3. `## Categorize & filter activities` → `### Activities`, which is where the app **promised
   prefix / suffix matching as Premium** and never shipped it — issue #13. That promise is
   in the help text a user can read today.

**v2 status:** built, as `app/help.tsx` — a screen rather than compiled Markdown, so the
links are rows and "Sort my activities" is a control rather than a sentence describing one.
The `<details>` block survives as a disclosure row, because "how do I even get data in
here" is the first question a new user has and v1 answered it properly.

Three departures, all recorded in the file's own header:

- The **Premium** promise is dropped, because the feature it promised now exists (issue
  #13). The paragraph says how to use prefix / suffix / contains matching instead.
- **"Upcoming features"** is dropped entirely: trophies, awards and personalised
  encouragement were never built and are not planned.
- The empty state's first action, `"Get started"`, now points here rather than at the
  welcome tour, and reads `"How to get started"`. Someone looking at an empty chart is
  asking how to get data in, which is this screen's subject and not the tour's.

---

## 10b. Notifications — `components/SettingsNotifications.res`

1. Row `"Allow Notifications"` + switch (`:73-84`)
2. Row `"Daily Reminders"` + switch (`:88-109`)
3. One row per reminder, sorted by hour then minute (`:111-178`)
   - Left: the time
   - Right: `"Next notification"` above the relative time until it fires
   - Dimmed to `opacity: 0.1` when editing is not allowed (`:162`)
4. Inline picker with `"Cancel"` / `"Add"` while adding (`:210-222`)
5. Blue row `"Add a New Reminder"` (`:230-237`)
6. Footnote: *"Notifications are skipped if they are planned in less than `N`min to avoid
   unecessary reminder."* (`:240-244`, v1 typo "unecessary")

**Duplicate guard** (`:40-58`): adding a reminder that already exists raises an `Alert`,
title `"Duplicate Reminder"`, message *"You already have a identical reminder. It's not
necessary to have it twice."*

**v2 status:** built, as `app/reminders.tsx` — the list sorted by hour then minute, the
next-fire time under each, the inline picker, and the duplicate guard. The `MINIMUM_GAP`
rule is v1's and the footnote says so (typo fixed). The sorting, adding, removing and
next-occurrence logic lives in `domain/reminders.ts` and is tested; `opacity: 0.1` for the
disabled state is not carried over — a row at one tenth opacity reads as a rendering fault,
so disabled rows go grey instead.

---

## 10c. Danger zone — `components/SettingsDangerZone.res`

Three groups, each with its footnote. Every destructive action is confirmed by an `Alert`.

**Backup** (`:56-89`)

- Blue row `"Export Backup"` → copies to the clipboard, then an alert: `"Export Finished"` /
  *"Data are in you clipboard. Be sure to paste that in a safe place."*
- Blue row `"Import Backup"` → alert `"Import Data from Clipboard?"` / *"This is a
  destructive command, all settings will be overwritten by the content of the clipboard
  (assuming that's a valid Export Backup)."*, buttons `Cancel` / `Import` (destructive)
- Failure paths: `"No data in your clipboard"`, `"Data don't seem to be a valid Export
  Backup"` (`:24-28`)
- Footnote: *"Export contains events metadata including categories & goals that are not
  stored into your calendars. Export copy raw metadata into your clipboard. Import assume
  that you have your export in your clipboard, ready to be injected."*

**Demo calendar** (`:96-134`)

- Blue row `"Create Demo Calendar"` → alert `"Inject Demo Calendar"`, buttons `Cancel` /
  `Inject`
- Red row `"Remove Demo Calendar"` → alert `"Remove Demo Calendar"`, buttons `Keep` / …
- Footnote: *"Demo data allows you to quickly test the app if you have currently not enough
  data in your actual calendars. It can be safely removed without affecting your personal
  calendars."*

*Worth noting:* v1's demo **wrote a real calendar to the device**. v2 generates events in
memory instead (`domain/demo.ts`), which needs no write permission and cannot leave residue
behind — the same idea, done without touching the user's data.

**Reset** (`:139-160`)

- Centred red row `"Reset Settings & Erase All Metadata"` → alert `"Reset Settings & Erase
  All Data?"` / *"This is a destructive operation and will wipe all settings & data. It
  cannot be undone unless you use an Export."*, buttons `Cancel` / `Reset` (destructive)
- Footnote: *"This is a destructive operation and will delete all application metadata.
  Note: All your calendars and events are safe and are not affected by this operation."*

**v2 status:** built, as `app/backup.tsx`, with both confirms and the sentence that lets
someone press the button — that their calendars are never touched. Import goes through
`parseSettings`, which accepts a v1 export as well as a v2 one, so a backup taken from the
old app restores here. The demo-calendar rows are deliberately absent: v2's demo lives in
memory, so there is nothing to create and nothing to remove.

---

## 10d. Calendar permission — `components/CalendarsPermissions.res`

Shown before access is requested, on a card with `Theme.Radius.card`, entering with a
spring from `translateY: 1000` after a 150 ms delay (`:19-34`).

1. App icon, 48 pt, centred
2. `"Set Up Calendars Access"` — title2 weight 700
3. Scrollable body:
   > *"LifeTime has been designed to protect your personal data and respect your privacy. It
   > has been built as an on-device service that you can trust.*
   >
   > *Calendars are used as the primary source of informations to follow your activities.
   > LifeTime must have read access to them to be able to show reports and suggestions."*
4. Blue link `"Learn more about LifeTime & Privacy..."`
5. Blue button `"Continue"`, `testID="AllowCalendarsAccess"`

**v2 status:** replaced by a glass sheet over a working Summary. The *timing* changed
deliberately — v1 asked before showing anything, so the very first thing a new user was
asked was to trust an app they had never seen work. The copy is v1's, which is stronger:
"LifeTime is built as an on-device service" says what the app *is* before saying what it
wants. The `"Learn more about LifeTime & privacy…"` link is back, going to §9.

---

## 10e. Notification permission — `components/NotificationsPermissionsPopin.res`

Title `"Set Up Reminders"`; body *"Enabling notifications can help you to stay motivated by
giving you quick recap of your progress goals when necessary. Notifications are generated on
device."*; request button `testID="NotificationsPermissionsPopin_Button_request"`.

**v2 status:** built, but not as a popin. The sentence that earns the yes — "notifications
are generated on device" — sits under the switch it justifies, where someone deciding can
read it, rather than in a modal of its own that appears before the thing it is about. The
request happens when the switch is turned on, and only then.

**The bigger fix here was not the copy.** Until now the Reminders screen stored times that
nothing read: `expo-notifications` was named in `docs/ARCHITECTURE.md` and was not even a
dependency. The screen listed reminders, showed when each would next fire, and refused
duplicates — a complete, convincing interface to a feature that did not exist. Nothing
about it looked unfinished, which is what makes that state worse than a screen marked "not
built". `src/data/notifications.ts` now owns the OS schedule, `app/_layout.tsx` re-registers
it on launch, and the row reads "On" only when a notification can actually fire.

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

Nothing — but that sentence was written once before it was true. The first version of
this document claimed the extraction was complete while
`shareable/components/ActivityRings.js` had never been opened; it was listed in the
component table and skipped. It is the most carefully built component in v1, and three of
its behaviours were missing from the rebuild as a result (see §8c).

The lesson is in the rule at the top: *cited or absent*. A component named in a table is
not a component that has been read, and "everything is covered" is a claim that needs the
same evidence as any other.

What remains is **verification of this document against the running v1**, which nobody can
do — v1 no longer builds. So the citations are the only evidence, and that is why every
claim carries one.

### The colour roles, for reference

`shareable/Theme.res` names roles rather than colours, and the naming is worth keeping even
though the values are not (`Theme.res:182-232`):

| v1 role | Used for | v2 |
| --- | --- | --- |
| `text` | primary label | `colors.label` |
| `textLight1` / `textLight2` | secondary / tertiary label | `secondaryLabel` / `tertiaryLabel` |
| `textOnDarkLight` | dimmed label over a coloured card | needed for the goal card |
| `textMain` / `textBlue` | accent, link | `accent` / `link` |
| `background` / `backgroundDark` | screen, card | `background` / `surface` |
| `separatorOnBackground` | hairline (`gray3`) | `separator` |
| `backgroundGray5` | iOS row press state | `selection` |

The one role v2 does not have is **`textOnDarkLight`** — a dimmed label guaranteed legible
over a saturated card, in both appearances. The goal card needs it.
