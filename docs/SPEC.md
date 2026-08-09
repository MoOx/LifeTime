# LifeTime — Functional & Technical Specification

> Reverse-engineered from the v1 codebase (last commit `dd90c0d`, 2022-03-07,
> React Native 0.67 + ReScript 9). This document describes **what v1 does**, not what it
> should do. Improvement proposals live in [IMPROVEMENTS.md](./IMPROVEMENTS.md).
>
> **Every `src/*.res` path quoted below refers to v1**, which now lives on the `main`
> branch — the v2 tree replaced it at the repository root. To follow along:
> `git show main:src/components/GoalCard.res`, or `git checkout main -- src` in a
> scratch clone.

---

## 1. Product overview

LifeTime turns the calendars already present on the user's phone into a **time-usage
report**. It never asks the user to log anything: it reads past events, groups them into
*activities*, maps activities to *categories*, and shows how much time went where. On top
of that reporting layer it adds *goals* (a minimum to reach) and *limits* (a maximum to
respect), evaluated on a weekly basis.

**Pitch (from the Welcome screen):** *"Your personal coach, helping you to reach your
goals and spend your valuable time on things you love."*

**Core constraints that shape the whole design:**

- **On-device only.** No account, no server, no sync. All state lives in
  `AsyncStorage`; all activity data is read live from the OS calendar store.
  The only network call in the app is Sentry crash reporting (production builds only,
  `index.js:11-19`).
- **Read-mostly on calendars.** The app reads events; it only writes when injecting demo
  data (dev builds, `src/Demo.res`).
- **Retrospective, not prospective.** The app is a diary reader. `Home` clamps the end of
  every range to "now" (`src/components/Home.res:174`), so future events never count.

**Bundle identifiers:** `io.moox.lifetime` (Android, `android/app/src/main/AndroidManifest.xml:2`).
Shipped versions per git history: iOS `1.0.0 (13)`, Android `1.0.0 (5)`.

---

## 2. Domain model

### 2.1 Calendar & Event (external, owned by the OS)

Read through `react-native-calendar-events` (bindings in `src/ReactNativeCalendarEvents.res`).

| Entity | Fields actually used by the app |
|---|---|
| `calendar` | `id`, `title`, `source`, `color` |
| `calendarEventReadable` | `id`, `title`, `startDate` (ISO string), `endDate` (ISO string), `allDay`, `calendar.id` |

Everything else the library can return (notes, location, attendees, alarms, recurrence,
availability, timezone) is **deliberately stripped out at the native level** by
`patches/react-native-calendar-events+2.2.0.patch` — see [CALENDAR.md](./CALENDAR.md) §2.

### 2.2 Activity — `src/Activities.res`

```
type t = {
  id: string,          // Utils.makeId(title, createdAt) — Caesar-shifted "title@timestamp"
  title: string,       // must match the calendar event title
  createdAt: float,
  categoryId: string,
}
```

An "activity" is **not** stored per event. It is a user-created mapping row that says
*"events whose title matches this string belong to this category"*. Matching is
`title.toLowerCase() === other.toLowerCase()` (`Activities.isSimilar`, `Activities.res:3`).
Events with no matching activity fall back to the `unknown` category.

### 2.3 Category — `src/ActivityCategories.res`

A **fixed, non-extensible** list of 9 categories, hardcoded as `(id, name, color, icon)`
tuples:

| id | Name | Color | Icon |
|---|---|---|---|
| `rest` | Rest | indigo | moonsymbol |
| `food` | Nutrition | green | carrot |
| `exercise` | Exercise | pink | workout |
| `work` | Work | blue | edit |
| `social` | Social | orange | social |
| `self` | Self-care | teal | meditation |
| `fun` | Entertainment | purple | theatremask |
| `chores` | Chores | yellow | broom |
| `unknown` | Uncategorized | gray | bookmark |

Colors are names resolved against the iOS system palette per theme mode
(`ActivityCategories.getColor`).

### 2.4 Goal — `src/Goal.res`

```
type t = {
  id: string,
  title: string,               // optional; falls back to the joined activity/category names
  createdAt: float,
  mode: int,                   // 0 = Goal (minimum), 1 = Limit (maximum)
  days: array<bool>,           // length 7, index 0 = Sunday
  durationPerDay: float,       // minutes
  categoriesId: array<string>,
  activitiesId: array<string>,
  period: int,                 // 0=day 1=week 2=month 3=year — persisted but NOT honoured
}
```

`period` is serialized and round-tripped but **`GoalEdit` hardcodes `~period=#week`**
(`src/components/GoalEdit.res:201`, with a `@todo`) and `GoalCard` never reads it.
Everything is weekly in practice.

### 2.5 Settings — `src/AppSettings.res`

The single persisted document, stored as JSON under the AsyncStorage key `"settings"`:

```
type t = {
  theme: string,                                    // "light" | "dark" | "auto"
  lastUpdated: float,                               // 0. means "never used" → triggers Welcome
  notificationsPermissionsDismissed: float,
  notificationsRecurrentRemindersOn: bool,
  notificationsRecurrentReminders: array<array<option<int>>>,  // [[minute, hour], ...]
  calendarsSkipped: array<calendarSkipped>,         // {id, title, color, source}
  activities: array<Activities.t>,
  activitiesSkipped: array<string>,                 // activity titles
  activitiesSkippedFlag: bool,                      // master switch for the above
  goals: array<Goal.t>,
}
```

Defaults: theme `auto`, reminders on at 09:00, nothing skipped, no activities, no goals.

---

## 3. Navigation map

`react-navigation` v6, native stacks (`src/Navigators.res`, `src/Nav.res`).

```
RootStack (native-stack, presentation: formSheet, headerShown: false)
├── Tabs (bottom tabs)                       ← initial route
│   ├── StatsStack   "Summary"  (timeline icon)
│   │   ├── HomeScreen                       ← headerShown: false
│   │   └── ActivityOptionsScreen            ← title = activity name
│   ├── GoalsStack   "Goals"    (pennant icon)
│   │   └── GoalsScreen
│   └── SettingsStack "Settings" (gear icon)
│       ├── SettingsScreen
│       ├── SettingsDangerZoneScreen
│       └── SettingsNotificationsScreen
├── WelcomeModalScreen        (gestureEnabled: false)
├── PrivacyModalScreen
├── FiltersModalScreen
├── GoalNewModalScreen
├── GoalEditModalScreen
└── HelpModalScreen
```

Navigation state is persisted to AsyncStorage under `react-navigation:state:2` and
restored on cold start (`src/App.res:47-107`).

---

## 4. Screens & behaviour

### 4.1 Welcome (`WelcomeModalScreen`)

Shown automatically when `settings.lastUpdated === 0.`, i.e. on first launch
(`src/screens/HomeScreen.res:44-54`, with a 100 ms delay "to get a nicer visual effect").
Also reachable from Settings → *Welcome Screen*.

Staged entrance animation (`src/components/Welcome.res:32-84`): the pitch block springs
+ fades in at 750 ms, the bottom block at 1250 ms. Content: app icon, "Welcome to
LifeTime", the pitch line, a calendar-permission explainer, a link to Privacy, and a
*Continue* button which simply dismisses the modal.

### 4.2 Summary — `HomeScreen` + `Home`

The main screen. Structure top to bottom:

1. **Sticky animated header** — appears past 80 px of scroll, title *"Your LifeTime"*.
2. **Date line** — `SUNDAY 9 AUGUST`, uppercased.
3. **NoEventBox** — a contextual empty-state card, see §4.3.
4. **Weekly Chart** — a horizontally paged `ScrollView` of the **last 6 weeks**
   (`Array.range(0, 5)` → 6 entries, `Home.res:160-168`), one stacked bar chart per week,
   paging snapped to the viewport width. Auto-scrolls to the current week on mount.
   Header shows *Daily Average* / *Last Week's Average* / `9 - 15 Aug Average` depending
   on which page is visible, plus a *Show This Week* shortcut when off the current week.
5. **Total Logged Time** for the visible week.
6. **Footnote** — `Updated <relative time>`, from `date-fns` `formatRelative`.
7. **Top Activities** — see §4.5.
8. **Reveal / Mask Hidden Activities** toggle (flips `activitiesSkippedFlag`).

Pull-to-refresh re-reads today's date and invalidates the events cache. The same refresh
runs automatically whenever the app returns to foreground
(`ReactNativeHooks.useAppStateUpdateIsActive`).

**Calendar permission gate:** if the calendar permission is not `granted`, a dimmed
overlay with the `CalendarsPermissions` card is rendered on top of the whole screen
(`HomeScreen.res:120-186`). Denying twice routes the user to the OS settings via an alert.

### 4.3 NoEventBox — contextual empty states

Fetches the current week and the previous week, then classifies with
`Calendars.noEvents` (`src/Calendars.res:216-244`) into `None | OnlyAllDays |
OnlySkippedCalendars | OnlySkippedActivities | Some`, and renders a matching message +
call to action:

| Situation | Message | Actions |
|---|---|---|
| No events at all in 2 weeks | "could not find any events on the last two weeks" + long explainer | *Get Started* (Help), *Open Calendar* |
| Only all-day events | "All day events are not suitable for time tracking" | *Get Started*, *Open Calendar* |
| Everything in hidden calendars | "…that aren't part of skipped calendars" | *Help me customize settings* (Filters), *Open Calendar* |
| Everything in hidden activities | "…that aren't part of skipped activities" | *Help me customize settings*, *Toggle Hidden Activities* |

*Open Calendar* deep-links to the system calendar: `calshow:` on iOS,
`content://com.android.calendar/time/` on Android (`Calendars.res:6-12`).

### 4.4 Weekly chart — `WeeklyGraph`

A hand-rolled stacked bar chart built from plain `View`s (no chart library).

- One bar per day of the week; each bar is a vertical stack of colored segments, one per
  category, ordered by that week's global category ranking.
- Per-day, per-category minutes are computed by clamping each event to
  `[startOfDay, endOfDay]` — so an event crossing midnight is split across both days
  (`WeeklyGraph.res:172-201`, via `Date.hasOverlap`).
- **Y axis**: 4 slices, max rounded up to a multiple of 4 h (if max > 1 h) or 20 min
  otherwise, so labels stay integer-ish (`WeeklyGraph.res:224-232`).
- **X axis**: dashed vertical separators (`Dash` component) + one-letter day labels.
- `allowFontScaling=false` on the axis labels.

### 4.5 Top Activities — `TopActivities`

Ranked list of activities for the visible range, sorted by total minutes descending.
Shows 8 initially with *Show More* / *Show Less* in steps of 8. Each row: category icon,
activity title, a proportional colored bar, the formatted duration, chevron. Tapping a
row opens `ActivityOptionsScreen` for that title **and that week**.

Duration formatting (`Date.minToString`): `2d 3h 15m`, collapsing empty units, `0m` floor.

### 4.6 Activity options — `ActivityOptionsScreen` + `ActivityOptions`

For one activity title within one week:

- **Category** — a radio list of the 9 categories. Selecting one removes any existing
  activity row with a similar title and inserts a fresh one with the new `categoryId`.
- **Events** — the individual calendar events for that title in the range, sorted by
  decreasing start date.
- **Hide/Show this activity** — toggles membership in `activitiesSkipped`.

### 4.7 Goals — `GoalsScreen` + `Goals` + `GoalCard`

Lists goal cards. When there are no goals, an onboarding block explains the concept and
offers two entry points: *Add a Goal* (minimum to achieve) and *Add a Limit* (maximum to
respect).

Each `GoalCard` renders a colored card with a gradient overlay, an `ActivityRings`
progress ring (a masked SVG/Skia-free implementation in
`src/components/shareable/components/ActivityRings.js`), the goal title, the cadence in
plain English (*"every day"*, *"every weekday"*, *"every weekday except monday"*, or an
explicit day list), and the daily average achieved so far.

Dev-only affordances on this screen (hidden behind `__DEV__`): a debug overlay dumping
all intermediate computations, and a toggle to force the onboarding content.

**Notification opt-in popin** appears once goals exist and the prompt was never dismissed
(`GoalsScreen.res:73-75`).

### 4.8 Goal creation / edition — `GoalEdit`

Sections: free-text title (optional), Type (Goal / Limit), Days (7 toggles, ordered by
locale week start), Duration (4 quick presets 30/45/60/90 min + a 0–1440 min slider with
15 min steps, throttled at 100 ms), and Category-or-Activity (expandable category rows;
checking a category selects "all", including future activities; expanding lets you pick
individual activities).

Live computed readouts: *Average Time per Day* and *Weekly Goal*.

A goal is only savable when it has a type, a duration > 0, at least one day, and at least
one category or activity (`GoalEdit.res:172-208`).

Deletion is offered on edit only, behind a destructive confirmation alert.

> **Identity caveat:** `GoalEdit` rebuilds the goal via `Goal.make` on every change, which
> regenerates `id` **and** `createdAt`. `GoalEditModalScreen` then replaces the goal at
> the matching index, so an edited goal keeps its position but **changes its id** and
> loses its original creation date.

### 4.9 Filters — `FiltersModalScreen` + `Filters`

Lists every device calendar with its source and color, each toggling membership in
`calendarsSkipped`, plus a *Hide All* / *Show All* shortcut.

### 4.10 Settings

- **Notifications** → `SettingsNotificationsScreen`
- **Theme** → Light / Dark / Auto
- **More** → Help (markdown modal), Welcome Screen, Calendar App (deep link), App System Settings
- **Danger Zone** → `SettingsDangerZoneScreen`

**Danger Zone** exposes *Export Backup* (dumps the whole settings JSON to the clipboard)
and *Import Data from Clipboard* (parses, validates and replaces settings — destructive,
behind a confirmation).

### 4.11 Help & Privacy modals

Markdown sources in `src/md/help.md`, converted to JSON at build time by
`@moox/markdown-to-json` (`npm run md:to-json`) and rendered by `MarkdownJsonRenderer`.
The help content already references "Premium" matching modes (prefix/suffix matching) that
are **not implemented**.

---

## 5. Computation rules

### 5.1 Week boundaries

Week start is derived from the device country via `react-native-localize`
(`src/Date.res:238-250`): Friday for `MV`, Saturday for 15 MENA countries, Sunday for a
list of ~55 countries including `US`/`GB`/`JP`, Monday otherwise. `date-fns` receives this
as `weekStartsOn` for all `startOfWeek`/`endOfWeek` calls.

### 5.2 Event filtering pipeline

`Calendars.filterEvents` drops an event if **any** of these hold:

1. `allDay === true`
2. its calendar id is in `calendarsSkipped`
3. `activitiesSkippedFlag` is on **and** its title matches an entry of `activitiesSkipped`

### 5.3 Duration aggregation

`makeMapTitleDuration` / `makeMapCategoryDuration` group events by lowercased title (resp.
by resolved category id), then sum, **clamping each event to the requested range**:

```
duration = |min(evt.end, rangeEnd) − max(evt.start, rangeStart)|   (rounded to the minute)
```

Note the clamping is done by **ISO string comparison** rather than timestamp comparison
(`Calendars.res:184-190`) — correct only because both sides are UTC `toISOString()` output.

### 5.4 Goal progress (`GoalCard.res:627-672`)

Given the visible week `[weekStart, weekEnd]`, `now = min(weekEnd, today)` and
`tonight = endOfDay(now)`:

| Quantity | Formula |
|---|---|
| `currentTime` | Σ minutes over the goal's categories + Σ over its activities |
| `numberOfDays` | count of `true` in `goal.days` |
| `durationPerWeek` | `durationPerDay × numberOfDays` |
| `durationProgress` | elapsed fraction of the calendar week, at `now` |
| `durationProgressTonight` | elapsed fraction of the calendar week, at `tonight` |
| `proportionalGoalTonight` | `durationPerWeek × durationProgressTonight` |
| `totalProgress` | `currentTime / durationPerWeek` |
| `progressTonight` | `currentTime / proportionalGoalTonight` ← **drives the ring and the colors** |
| `proportionalAverageTime` | `currentTime / (numberOfDays × durationProgressTonight)` |
| `remainingMinLimit` | `durationPerWeek − currentTime` |

Feasibility flags:

- **Goal**: `isAlreadyDone = totalProgress > 1`; `canBeDone = remainingMinLimit < remainingMinThisWeek`
- **Limit**: `isAlreadyDone = remainingMinLimit > remainingMinThisWeek`; `canBeDone = totalProgress < 1`

where `remainingMinThisWeek` is the wall-clock minutes left until `weekEnd`.

> **Known modelling flaw:** `durationProgress*` measures elapsed fraction of the *calendar*
> week, not of the *selected days*. A "60 min every weekday" goal is therefore judged
> against a target that keeps growing through Saturday and Sunday, when no progress can be
> made. Same flaw in `proportionalAverageTime`.

### 5.5 Ring color ramp

`progressTonight` maps to a `(startColor, endColor)` gradient pair
(`GoalCard.res:727-747`), with a first pass on feasibility:

- not feasible & not done → `danger → bad` (orange → red)
- not feasible & already done → `ok → good` (light green → lime)
- Goals: ≤0.25 red, ≤0.5 orange→red, ≤0.75 yellow→orange, ≤0.9 green→orange, <1 green→yellow, >1 green→lime
- Limits: ≤0.75 green→lime, ≤0.9 yellow→green, <1 orange→green, ≥1 yellow→orange, ≥1.15 yellow→red

---

## 6. Notifications

`react-native-push-notification` + `@react-native-community/push-notification-ios`.
Configured at module load in `src/App.res:9-33`, with `requestPermissions: false` (the
prompt is deferred to an in-app popin) and an Android channel `reminders` / *"Reminders
for your goals"*.

`notificationsRecurrentReminders` is an array of `[minute, hour]` pairs; the default is
`[[0, 9]]` → 09:00. `Notifications.appropriateTimeForNextNotification`
(`src/Notifications.res:3-56`) computes the next fire date, pushing to tomorrow if the app
is opened within 30 minutes before the scheduled time or after it — so opening the app at
08:45 does not produce a notification 15 minutes later.

The permission prompt is surfaced by `NotificationsPermissionsPopin`, tracked by
`notificationsPermissionsDismissed`. `NotificationsRegisterer` re-registers the schedule
whenever the settings change.

Notification tap handling exists but its navigation branch is **commented out**
(`App.res:19-24`).

---

## 7. Theming & design system

`src/components/shareable/Theme.res` plus the external `react-multiversal` package
(pinned to a git SHA: `MoOx/react-multiversal#5efbecf`).

- Two `StyleSheet`s, `light` and `dark`, exposing named tokens (`background`,
  `backgroundDark`, `text`, `textLight1/2`, `textOnDarkLight`, `separatorOnBackground`,
  `textGray`…`textGray6`, etc.).
- Base palette = the iOS system colors (`Predefined.Colors.Ios.light/dark`) — **on both
  platforms**.
- Mode resolution: `auto` reads `Appearance.useColorScheme()`, else forced.
- **Typography is a hardcoded replica of the iOS type ramp**: `largeTitle` 34/41/0.37,
  `title1` 28/34, `title2` 22/28, `title3` 20/24, `headline`/`body` 17/22/−0.41,
  `callout` 16/21, `subhead` 15/20, `footnote` 13/18, `caption1` 12/16, `caption2` 11/13.
- Font weights are mapped per-platform with an explicit comment documenting how badly
  Android OEMs (stock / ColorOS / OxygenOS) disagree on `sans-serif-*` family ↔ weight
  mapping (`Theme.res:118-137`).
- Several key texts set `allowFontScaling=false` (titles, chart labels, header buttons),
  which **opts out of Dynamic Type / Android font scaling**.

This is the root cause of the "doesn't feel native on Android" complaint: the app renders
an iOS type ramp and an iOS color palette on Android, with accessibility scaling disabled
in places. See [ARCHITECTURE.md](./ARCHITECTURE.md) §4.

Radii: `Theme.Radius.button = 10`, `Theme.Radius.card = 6`.

Status/navigation bars are driven by `react-native-bars` (`SystemBars`), with
`react-native-transparent-status-and-navigation-bar` left as dead commented-out code.

---

## 8. Localisation

- **UI copy is English-only and hardcoded** in components. There is no i18n layer.
- **Dates are localized**: `date-fns` locales `en-US`, `en-GB`, `en-CA`, `fr`, selected via
  `react-native-localize.findBestAvailableLanguage` with an `en` fallback
  (`src/Date.res:252-283`).
- Day and month names used in the Summary header are **hardcoded English strings**
  (`Date.res:6-88`), bypassing the locale entirely.

So: French users get French relative dates in the footnote but English day names in the
title. Inconsistent by construction.

---

## 9. Technical stack (as-is)

| Layer | Choice |
|---|---|
| Language | **ReScript 9.1** (`.res`), compiled to JS; a handful of `.js` files (`App.js`, `ActivityRings.js`, `IconCalendar.*.js`) |
| Framework | React 17, React Native **0.67.1** (old architecture, Hermes optional) |
| Navigation | react-navigation 6 (native-stack + bottom-tabs) via `rescript-react-navigation` |
| Storage | `@react-native-async-storage/async-storage` |
| Calendars | `react-native-calendar-events` **2.2.0** + a 17 KB local patch |
| Permissions | `react-native-permissions` 3 |
| Notifications | `react-native-push-notification` 7 + `push-notification-ios` |
| Dates | `date-fns` 2 |
| Graphics | `react-native-svg` 12, `@react-native-masked-view/masked-view`, `@react-native-community/blur` |
| Animation | `react-native-reanimated` 2, `react-native-gesture-handler` 2 (patched) |
| Async | `rescript-future` (a `Future`/`Result` abstraction over promises) |
| Events | `fbemitter` (used only to bridge notification taps to navigation) |
| Crash reporting | `@sentry/react-native` (production only) |
| Splash | `react-native-bootsplash` |
| Web | `react-native-web` 0.12 + `react-scripts` 3.2 — present but effectively unmaintained |
| Icons | 40 local SVGs converted to components at install time by `react-from-svg` |

### 9.1 Build pipeline quirks

`npm run prepare` chains **six** codegen steps before anything can compile:
`patch-package` → `husky install` → SVG→component conversion → markdown→JSON →
`rescript clean` → `rescript build` → bootsplash generation. A fresh clone cannot run
without all of them succeeding.

### 9.2 Testing & CI

- **Unit**: Jest, `testRegex: "Test\\.js$"` — the `tests/` folder exists but coverage is
  minimal.
- **E2E**: Detox 19 (`e2e/demo.e2e.js`, `e2e/fresh.e2e.js`), used mainly to drive
  **App Store screenshot automation** (`fastlane/screenshots.sh`, `frame_screenshots`).
- **CI**: three GitHub Actions workflows (iOS build, Android bundle, tests) pinned to
  `actions/checkout@v2` / `setup-node@v2` / `cache@v2`.
- **Release**: Fastlane lanes `ios beta` (match code signing → bump build → build →
  TestFlight) and `android beta` (bump version code → `bundleProdRelease` → Play beta),
  plus `versionBump` and `screenshots`.

---

## 10. Privacy & permissions

| Permission | Platform | Purpose | Copy |
|---|---|---|---|
| Calendars (read) | both | the entire data source | *"LifeTime needs access to your calendar to show activity reports and suggestions."* |
| Calendars (write) | Android manifest | only used by dev-mode demo data injection | — |
| Notifications | both | goal reminders | requested in-app, deferred |
| Internet | Android | Sentry only | — |
| Vibrate, Boot completed | Android | scheduled local notifications | — |

The commit history records that the permission-request wording had to be changed to avoid
an App Store rejection (`eec1755`).

---

## 11. Known limitations & technical debt

Ordered by impact. These are stated as facts about the current code; fixes are proposed in
[IMPROVEMENTS.md](./IMPROVEMENTS.md).

1. **The calendar library is abandoned** — `react-native-calendar-events@2.2.0` was last
   published 2021-01-08. The project carries a 17 KB patch that disables recurrence rules,
   attendees, alarms, notes and location on both platforms, and rewrites iOS threading
   with `dispatch_async`/`weakSelf`. This was the blocking issue. → [CALENDAR.md](./CALENDAR.md)
2. **Android does not look native** — iOS type ramp, iOS palette, `allowFontScaling=false`,
   hand-rolled OEM font-weight mapping table.
3. **Goal progress model is wrong on partial-week goals** (§5.4).
4. **Editing a goal changes its id and resets `createdAt`** (§4.8).
5. **`period` on goals is dead data** — persisted, never honoured (§2.4).
6. **Categories are a hardcoded list of 9** — users cannot add, rename or recolor.
7. **Activity matching is exact-lowercase only.** The help text promises prefix/suffix
   matching as "Premium"; it does not exist.
8. **No i18n**, and mixed hardcoded-English / localized dates (§8).
9. **Events are refetched and re-aggregated in JS on every foreground**, with an in-memory
   `Map` cache keyed by ISO range that is fully invalidated on any refresh
   (`Calendars.res:110-160`). No persistence, no incremental update.
10. **Settings writes go through nested `InteractionManager` + `setTimeout(0)` hops**
    (`App.res:118-140`) to avoid jank — a workaround for doing all state work on the JS
    thread.
11. **Stack is ~4 years behind**: RN 0.67 (current: 0.86), React 17 (current: 19),
    ReScript 9 (current: 12), old architecture only, no Fabric/TurboModules.
12. **`react-multiversal` is pinned to a git SHA**, not a published version.
13. **Web target is vestigial** — `react-scripts@3.2`, `react-native-web@0.12`.
14. **Notification deep-linking is dead code** (§6).
15. **App name mismatch**: `app.json` still says `"displayName": "Reason React Native Boilerplate"`.

---

## 12. Screen-to-file index

| Screen / concern | Entry file |
|---|---|
| App root, providers, nav state | `src/App.res` |
| Navigator declarations | `src/Nav.res`, `src/Navigators.res` |
| Persisted settings + codecs | `src/AppSettings.res` |
| Calendar access, filtering, aggregation | `src/Calendars.res` |
| Activity ↔ category mapping | `src/Activities.res`, `src/ActivityCategories.res` |
| Goal model | `src/Goal.res` |
| Date math, locale, week rules | `src/Date.res`, `src/DateFns.res` |
| Summary | `src/screens/HomeScreen.res`, `src/components/Home.res` |
| Weekly chart | `src/components/WeeklyGraph.res` |
| Top activities | `src/components/TopActivities.res` |
| Empty states | `src/components/NoEventBox.res` |
| Activity detail | `src/screens/ActivityOptionsScreen.res`, `src/components/ActivityOptions.res` |
| Goals | `src/screens/GoalsScreen.res`, `src/components/Goals.res`, `src/components/GoalCard.res` |
| Goal editor | `src/components/GoalEdit.res` |
| Calendar filters | `src/components/Filters.res` |
| Settings | `src/components/SettingsView.res`, `SettingsNotifications.res`, `SettingsDangerZone.res` |
| Notifications | `src/Notifications.res`, `src/NotificationsHooks.res`, `src/components/NotificationsRegisterer.res` |
| Theme | `src/components/shareable/Theme.res` |
| Demo data (dev) | `src/Demo.res` |
