# LifeTime — improvement proposals

> Companion to [SPEC.md](./SPEC.md) (what the app does today). Everything here is a
> proposal, ranked by value/effort. Nothing here is required for feature parity — the
> parity plan lives in [ARCHITECTURE.md](./ARCHITECTURE.md) §8.

Legend — **Impact**: 🔴 high · 🟠 medium · 🟡 nice-to-have. **Effort**: S / M / L.

---

## Part A — Correctness (fix these while porting, not after)

These are bugs in the current model. Porting them faithfully would be a mistake.

### A.1 🔴 S — Goal progress ignores which days are selected

**Today** (`GoalCard.res:655-666`): `durationProgress` is the elapsed fraction of the
**calendar** week. A goal of *"60 min every weekday"* is therefore measured against a target
that keeps rising through Saturday and Sunday — two days on which the user, by their own
definition, is not supposed to make progress. By Sunday evening the ring shows ~71 % for a
week that was completed perfectly on Friday.

**Fix:** measure progress in *scheduled* time, not wall-clock time.

```ts
// domain/goals.ts
const scheduledMinutesElapsed = (goal, weekStart, now) =>
  eachDayOfInterval({ start: weekStart, end: now })
    .filter((d) => goal.days[d.getDay()])
    .reduce((sum, d) => sum + minutesOfDayElapsed(d, now), 0)

const target = goal.durationPerDay * goal.days.filter(Boolean).length
const expectedByNow = goal.durationPerDay * (scheduledMinutesElapsed(...) / MINUTES_PER_DAY)
const progress = currentTime / expectedByNow
```

Same correction applies to `proportionalAverageTime`, which today divides by
`numberOfDays × durationProgressTonight` and is wrong for the same reason.

This is the single most valuable fix in the list: it is the number the user looks at.

### A.2 🟠 S — Editing a goal changes its id and resets `createdAt`

**Today:** `GoalEdit` rebuilds the goal through `Goal.make` on every keystroke, which
regenerates `Utils.makeId(title, Date.now())`. `GoalEditModalScreen` then replaces the goal
at the same array index, so the goal survives but under a **new id** with a **new**
`createdAt`.

**Fix:** separate "draft form state" from "commit". `make` creates; `update` patches an
existing goal and preserves `id` and `createdAt`. Trivial once the domain layer is pure.

### A.3 🟠 S — `period` is dead data

`Goal.period` is serialized, decoded, defaulted and round-tripped — and never read.
`GoalEdit` hardcodes `#week` with a `@todo`. Either implement it (A.4) or delete the field
and stop pretending.

### A.4 🟠 M — Actually support day / month / year goals

The data model already carries `period`. Implementing it means generalising the week
window into a period window and the "remaining time in period" computation. Daily goals in
particular are a very natural fit for this app (*"30 min of exercise per day"*) and would
make the Goals tab meaningful on a day-to-day basis rather than only on Sundays.

### A.5 🟡 S — Date comparisons by ISO string

`Calendars.res:184-190` compares dates with `>` on ISO **strings**. It works only because
the old native module always returned UTC `toISOString()`. `expo-calendar` returns
`string | Date`. Normalise to epoch ms at the data boundary (see
[CALENDAR.md](./CALENDAR.md) §5) and compare numbers.

### A.6 🟡 S — Day/month names bypass the locale

`Date.res` hardcodes English `"Monday"`, `"January"`… while `date-fns` locales are
correctly configured a few lines below. Use `format(date, 'EEEE d MMMM', { locale })`.

---

## Part B — Product

### B.1 🔴 M — User-defined categories

**Today:** 9 hardcoded categories, `(id, name, color, icon)` tuples in source. Users cannot
add "Commute", "Kids", "Side project", cannot rename "Nutrition", cannot recolor.

This is the most-requested kind of feature for any categorisation app, and the constraint
is arbitrary — nothing in the code requires the list to be static except that
`ActivityCategories.defaults` is a `list<cat>`. Move it into settings with the current 9 as
seed data, keep `unknown` as a reserved id, and add a category editor (name, color from a
curated palette, icon from an SF-Symbols/Material-Symbols picker).

Migration is trivial: existing `categoryId` strings stay valid.

### B.2 🔴 M — Smarter activity matching

`Activities.isSimilar` is exact case-insensitive equality. In a real calendar,
*"Standup"*, *"Daily standup"* and *"Standup — team"* are three separate activities, each
needing separate categorisation. The user's own `help.md` **already promises** prefix and
suffix matching (labelled "Premium") — a feature that was documented but never built.

Proposal, in increasing order of ambition:

1. **Rules instead of exact titles.** An activity becomes
   `{ match: 'exact' | 'startsWith' | 'endsWith' | 'contains', pattern: string }`.
   Covers 90 % of real calendars; the UI is one segmented control in the activity screen.
2. **Normalisation before matching** — trim, collapse whitespace, strip leading emoji, strip
   a trailing `— someone` / `w/ someone`, case-fold with `localeCompare`. Cheap, invisible,
   high yield.
3. **Bulk categorisation.** After matching, show *"12 activities are uncategorised, covering
   14 h this week"* and let the user sweep them in one screen instead of tapping through
   `TopActivities` one by one. **This is the biggest onboarding win in the whole app** —
   today a new user with a busy calendar faces dozens of individual taps before any chart
   means anything.
4. **Suggestions.** A small on-device keyword table (`sleep|nuit|dodo → rest`,
   `gym|run|swim|yoga → exercise`, `lunch|dîner|déjeuner → food`, `standup|meeting|1:1 →
   work`) pre-fills the category on first sight, always user-overridable. No ML, no network,
   ~100 lines, and it makes the app useful in the first 30 seconds instead of the first
   30 minutes.

### B.3 🔴 S — French (and real i18n)

The app is English-only hardcoded strings, written by a French developer, with `fr` already
in the `date-fns` locale list. Add `expo-localization` + a small i18n layer and ship
`en` + `fr`. Low effort, and it doubles the addressable audience for the author's own
market.

Do it **during** the rewrite — extracting strings afterwards is far more painful than
writing them into a catalogue from the start.

### B.4 🔴 M — Home-screen widgets

For an app whose entire value is a glanceable number, **not having a widget is the biggest
missed opportunity in the product.** "3 h 20 of Work today", "Exercise 40 / 150 min this
week", a mini weekly bar chart — these belong on the home screen, not behind an app launch.

- **iOS**: WidgetKit + App Intents, via a config plugin
  (`react-native-widget-extension` or a hand-rolled plugin + a Swift target). The widget
  reads a shared App Group container that the app writes on refresh.
- **Android**: Glance (Jetpack Compose for widgets), same shared-storage pattern.

Effort is real (a native target per platform), but this is the feature most likely to make
the app *stick*. Prioritise it right after parity.

### B.5 🟠 M — Trends and comparisons

The app shows the current week and lets you swipe back 5 weeks. It never *compares*.
Cheap additions on top of data already fetched:

- *"Work: 32 h this week, −4 h vs your 4-week average"*
- per-category week-over-week deltas
- a streak counter for goals ("4 weeks in a row")
- a "best day / worst day" callout

All of this is derived from aggregates you already compute — it is presentation, not new
plumbing.

### B.6 🟠 M — Month and year views

The chart is hardwired to 6 weeks (`Array.range(0, 5)`). A month view and a year heatmap
are the natural next zoom levels, and they are what makes a *life* time app rather than a
week tracker. Requires the aggregate caching from §C.3 to stay fast.

### B.7 🟠 S — Goal-aware notifications

**Today:** a generic daily reminder at 09:00, with no reference to actual goal state
(`Notifications.res` only computes *when*, never *what*).

**Proposal:** compose the body from live data — *"You're 40 min short of your Exercise goal
and 2 days left"*, or *"Screen time limit reached (5 h / 5 h)"*. Schedule the evening check
only when a goal is actually at risk. Same infrastructure, dramatically better signal.

Also: the notification-tap → navigate branch is **commented out** (`App.res:19-24`). With
`expo-router`, tapping a reminder should deep-link straight to the relevant goal.

### B.8 🟠 S — Export to a file, not the clipboard

*Export Backup* currently stringifies settings into the clipboard, which is fragile (size
limits, silent truncation, no history) and cannot be handed to a spreadsheet.

Use `expo-file-system` + `expo-sharing` to emit:
- `lifetime-backup-YYYY-MM-DD.json` (settings, importable)
- `lifetime-export-YYYY-MM-DD.csv` (activity, category, date, minutes) — **new**, and the
  thing people actually want for their own analysis.

### B.9 🟡 M — Health data as a second source

Calendars are a good proxy for time but a bad one for exercise. HealthKit workouts (iOS)
and Health Connect (Android) provide *actual* start/end times for exercise and sleep, which
map exactly onto the existing `exercise` and `rest` categories.

This turns "you have to write everything in your calendar" — the app's biggest adoption
barrier, and the reason `NoEventBox` needs four different empty states — into "some of it
fills itself in". Strictly additive: same `TimeEvent` shape, different provider.

### B.10 🟡 S — Siri / App Intents & quick actions

*"Hey Siri, how much did I work this week?"* is a two-line App Intent over an aggregate
that already exists. `expo-quick-actions` gives long-press home-icon shortcuts (Add goal,
This week) for near-zero effort.

### B.11 🟡 S — Onboarding that shows the value first

Today: Welcome modal → permission → an empty-ish Summary → the user must categorise before
anything means anything. Better: after permission, immediately show *"We found 47 events
across 3 calendars in the last 2 weeks"* and drop them straight into bulk categorisation
(§B.2.3). Time-to-first-useful-chart goes from minutes to seconds.

---

## Part C — Engineering

### C.1 🔴 M — Extract a pure domain layer and test it

Today the goal maths lives in `GoalCard.res`'s render body — ~120 lines of computation
before the first JSX tag — which is exactly why A.1 shipped unnoticed. Jest is configured
with `testRegex: "Test\\.js$"` and effectively nothing matches.

Extracted into `domain/`, `goalProgress(goal, events, now)` becomes a pure function testable
with a table of fixtures and no simulator. Target: the aggregation and goal maths at high
coverage, everything else opportunistic. This is the difference between an app you can pick
up after two years and one you cannot.

### C.2 🟠 S — Replace Detox with Maestro

Detox 19 is heavy (build-per-run, flaky, macOS-bound). The e2e suite here exists mainly to
drive App Store screenshots. Maestro does the same in YAML, runs on both platforms, and
works in CI without a bespoke build step — and Expo has first-class docs for it.

### C.3 🟠 M — Aggregate caching

`Calendars.res` caches raw events per ISO range in memory and invalidates **everything** on
any refresh, then recomputes all aggregates in JS on every render. Instead: cache the
*derived* per-day/per-category minutes keyed by `(day, settingsHash)`, persist in SQLite,
and only recompute days whose events changed. This is what makes B.6 (month/year) viable.

### C.4 🟠 S — Background pre-warm

`expo-background-task` can refresh aggregates before the user opens the app, so the Summary
is instant instead of showing a spinner while `fetchAllEvents` runs. Also feeds the widget
(§B.4).

### C.5 🟡 S — Accessibility pass

- Remove every `allowFontScaling={false}` (see [ARCHITECTURE.md](./ARCHITECTURE.md) §4.1).
- Give the weekly chart an accessible summary — SwiftUI `Chart` provides VoiceOver audio
  graphs for free on iOS.
- Check contrast of the 9 category colors against both themes; several of the iOS system
  colors used are borderline on colored card backgrounds.

### C.6 🟡 S — Modernise CI

The three workflows are pinned to `actions/checkout@v2` / `setup-node@v2` / `cache@v2`.
Replace with EAS Build on push to `main` + a lint/typecheck/test job. See
[RELEASE.md](./RELEASE.md).

### C.7 🟡 S — Housekeeping

- `app.json` still advertises `"displayName": "Reason React Native Boilerplate"`.
- The README documents the boilerplate it was forked from (`git clone
  reason-react-native-boilerplate`), not LifeTime.
- `LifeTime.sketch` is a 2.5 MB binary in git — move to a design tool / release asset.
- Sentry DSN is hardcoded in `index.js`; move to an env var via `expo-constants`.

---

## Part D — Positioning (optional, but worth deciding early)

`help.md` already labels prefix/suffix matching as "Premium" and promises "awards" and a
"digital trophy case" in "upcoming versions". None of it exists. Two coherent options:

1. **Free and open-source, no premium.** Delete the Premium mentions from the help text
   (they currently read as a broken promise to anyone who finds them).
2. **Ship a real premium tier.** The credible candidates are the expensive-to-build,
   high-value items: widgets (§B.4), month/year history (§B.6), CSV export (§B.8), health
   sources (§B.9). `expo-in-app-purchases` / RevenueCat handle the plumbing.

Either is fine. What is not fine is leaving the current state, where the docs promise
features the binary does not have.

---

## Suggested order

| Wave | Content | Rationale |
|---|---|---|
| **1. Parity + correctness** | ARCHITECTURE §8 phases 0–6, with A.1–A.6 fixed en route and C.1 (domain tests) | Ship something better than v1, on a stack that can be maintained |
| **2. Make it useful fast** | B.2 (matching + bulk categorisation), B.11 (onboarding), B.3 (fr) | Removes the adoption barrier — this is what stopped the app being sticky |
| **3. Make it stick** | B.4 (widgets), B.7 (smart notifications) | Value outside the app |
| **4. Make it deep** | B.1 (custom categories), B.5 (trends), B.6 (month/year) + C.3 | Retention features |
| **5. Opportunistic** | B.8, B.9, B.10, C.4, C.5 | Whenever there is appetite |
