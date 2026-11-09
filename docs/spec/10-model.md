# Data model

## v2-alpha1: the existing logic

Alpha1 keeps the domain as it is (D1, D21): `src/domain/events.ts`, `rules.ts`, `goals.ts`,
`aggregate.ts`, `time.ts`, `week.ts`, with their tests. Events come from the calendar or the
demo; each event counts for its own minutes, clamped to the visible range, as in v1
(`docs/SPEC.md` §5.3). There is no timeline layer yet.

**One change to the domain:** the chart stacks each week by that week's category totals, the
biggest at the bottom, as v1 did (`WeeklyGraph.res:265-267`, D25): it shows the biggest
consumers of time. `STACK_ORDER` goes. Colours remain the fixed category colours.

### Filters

From v1 (`docs/SPEC.md` §5.2): an event is excluded if it is all-day, if its calendar is
skipped, or if its title is hidden while the hide switch is on. Issue #29's distinction stays:
hidden activities are out of the reports yet still count for a goal that names them.

### Activities and rules

An **activity** is the grouping of events by normalised title. Categories are v1's nine
(`docs/SPEC.md` §2.3). Resolution follows `resolve` in `src/domain/rules.ts`, first answer wins:

| Order | `ResolutionSource` | Example | Written by |
|---|---|---|---|
| 1 | `activity` | exact, starts with, ends with, contains; most specific wins | User |
| 2 | `calendar` | "everything in this calendar is Work" | User |
| 3 | `keyword` | FR/EN table | Suggestion only |
| 4 | `none` | Uncategorized | |

Automatic when possible, manual always possible, and manual works on "all events of this
kind" (D14).

### A rule from a selection (new, D26)

Select several events or titles, and the app deduces a rule that also applies to future
events. `inferRule(titles)`, pure and tested, works on normalised titles:

1. All identical: `exact`.
2. A common prefix of at least 3 characters that ends on a word boundary: `startsWith`.
3. Otherwise a common suffix under the same condition: `endsWith`.
4. Otherwise a common run of at least one whole word: `contains`.
5. Otherwise no single rule: the selection is answered with one `exact` rule per title.

The result is a proposal: the user sees the pattern, can switch the mode, and sees how many
other titles over the analysed weeks it would also claim (the Match row's live count) before
choosing the category.

### Goals

`src/domain/goals.ts`: `mode`, `days`, `durationPerDay`, categories, activities. Week only.
Progress against **scheduled days**, not the calendar week (IMPROVEMENTS.md §A.1). A past
calendar event counts as time spent, as in v1, including for goals; asking for confirmation
would bring manual logging back. Ring: a switch between "current progress" and "entire week",
`ringMode` in settings; colours follow v1's ramp (`docs/SPEC.md` §5.5).

### Time

As in v1 (week start from the device region, `docs/SPEC.md` §5.1). Events crossing midnight
count in each day they touch. Events are compared as numbers, never as strings.

### Storage

Settings, rules, goals and reminders: one JSON document, as today (`parseSettings`;
`importV1Settings` keeps v1 exports working). `Export Backup` / `Import Backup` as in v1.

## v2-alpha2: observations and overlaps

To be detailed when alpha2 starts, with what alpha1 has taught. What is settled:

**Two layers.** Sources store immutable **observations** (source, kind, start, end, label,
source detail) in SQLite. Reports read a derived result; user corrections become rules and
never edit raw data, so revoking a source removes exactly what it contributed. Observations
are not exported through the clipboard: health data does not travel that way.

**Two kinds of overlap (D23).** They must not be treated alike:

| Case | Example | Treatment |
|---|---|---|
| Same thing, seen twice | Gym in the calendar and the same session recorded by the watch | Counted **once** |
| Different things at the same time | A train commute (Transport) while reading (Entertainment) | Counted **in both**, because someone may want to know each |

**Same thing** means the same category, and heavily overlapping; `Uncategorized` never merges.
Which label survives, and how `Total Logged Time` reads when things run in parallel, are
decided in alpha2.

**Precedence when the same thing is seen twice:** user correction, then measured sessions
(workouts, sleep), then calendar events.

**Rules for known kinds:** sleep → Rest, workout → Exercise, mindful → Self-care, overridable
by a user rule. A source that already knows what happened does not go through a model. One
sleep source per night, the one with the most stage detail.

**Only what is logged is shown (D24).** Time nothing accounts for is not computed as a figure,
shown, or attributed: the app shows what you do, not what you do not.

**A contradiction is a hint, not a correction.** If a planned gym session has no matching
workout, it still counts; later the app may point it out.
