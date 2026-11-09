# Data model

Sources produce raw **observations**. A pure function resolves them into a **timeline** of
non-overlapping blocks. Reports and goals read only the timeline. User corrections become
rules; they never edit raw data, so revoking a source removes exactly what it contributed.

The two-layer design comes from [DATA-SOURCES.md](../DATA-SOURCES.md), "Merge immutable
observations". `src/domain/rules.ts`, `goals.ts`, `aggregate.ts`, `time.ts` and `week.ts` are
carried over with their tests (D1) and extended as described here.

## 1. Observation

Immutable once stored, except when its source re-reads it (a calendar event moved by the
user replaces its previous version, keyed by `sourceKey`).

```ts
type SourceId = 'calendar' | 'healthkit' | 'healthconnect' | 'demo'
              // reserved: 'visit' | 'motion' | 'usage'

type ObservationKind = 'sleep' | 'workout' | 'mindful' | 'event'
              // reserved: 'visit' | 'motion' | 'app'

type Observation = {
  id: string
  source: SourceId
  /** Stable key within the source; re-reading the same item replaces it. */
  sourceKey: string
  kind: ObservationKind
  start: number          // epoch ms
  end: number            // epoch ms
  /** Human label: an event title, "Running", "Sleep". */
  label: string
  /** Source detail, kept for rules and display: calendar id, workout type, writer app. */
  meta: Record<string, string>
  /** Calendar only. See §4. */
  allDay?: boolean
  /** Which rank applies, see §3. */
  rank: 2 | 3 | 4 | 5 | 6
}
```

Stored fields are the minimum: a calendar observation holds the title, the times and the
calendar id, as v1 did (`git show main:patches/react-native-calendar-events+2.2.0.patch`
strips notes, locations and attendees). Nothing else is ever read.

## 2. Timeline

```ts
type BlockState = 'confirmed' | 'likely' | 'guessed' | 'located' | 'unaccounted'

type Block = {
  start: number
  end: number
  state: BlockState
  /** Null for 'located' and 'unaccounted'. */
  activity: string | null
  categoryId: CategoryId | null
  observationIds: string[]
  /** Set when sources disagree, for the review list. */
  conflict?: { with: string[] }
}
```

| State | Meaning | First-release origin |
|---|---|---|
| `confirmed` | Measured with its label, or stated by the user | HealthKit and Health Connect sessions, user corrections |
| `likely` | Stated, not contradicted | A past calendar event |
| `guessed` | Label inferred | Keyword or model suggestion the user has not accepted |
| `located` | A boundary and a place, no label | None yet; reserved for visits |
| `unaccounted` | Nothing known | Every other minute of the week |

**A week is always 100% of its hours.** `confirmed + likely + guessed + located +
unaccounted = 168 h`. Only the first three count as logged time and appear in the chart;
`unaccounted` is displayed as a figure, never silently attributed.

## 3. Resolving overlaps

Precedence, from [DATA-SOURCES.md](../DATA-SOURCES.md) (lower wins):

| Rank | Evidence | Treatment |
|---|---|---|
| 1 | User entries and corrections | Always win; become rules |
| 2 | Workouts, sleep, mindfulness | Exact label and edges |
| 3 | Visits, geofences, motion | Edges and place; category through place rules |
| 4 | Calendar events | Stated plans. Timed and accepted are strong; all-day, tentative and "free" are excluded |
| 5 | App usage | Labels phone time; never overrides a higher rank |
| 6 | Points (reminders, photos) | Corroborate; never create a block |

**Algorithm** (`resolveTimeline(observations, rules, range)`, pure and tested):

1. Clamp every observation to the range. Drop those excluded by the filters (§4).
2. Deduplicate same-kind observations from different writers: if two overlap by more than
   80% of the shorter one, keep the one with the preferred writer. One sleep source per
   night: the one with the most stage detail, then the longest.
3. Sort every start and end. Between two consecutive boundaries, the winner is the covering
   observation of lowest rank; among equals, the **shortest** one (the more specific, so a
   meeting inside an all-afternoon block wins), then the earliest created.
4. Merge adjacent segments that share a winner.
5. Fill the rest with `unaccounted` blocks.
6. Flag a conflict when a rank 2 observation overlaps a rank 4 one by more than 15 minutes
   and they resolve to different categories: "the calendar says Meeting; your watch saw
   a run". The rank 2 observation still wins, and the block goes to the review list.

**Nested intervals refine, they do not conflict.** A workout inside a calendar block called
"Gym" resolves to the same category and raises no conflict.

**Double counting ends here.** v1 summed overlapping events, so a week could log more than
it holds (visible in the demo data). The timeline makes that impossible. This is a deliberate
change of the totals, shown as `Total Logged Time`.

## 4. Filters

Carried over from v1 (`docs/SPEC.md` §5.2): an event is excluded if it is all-day, if its
calendar is skipped, or if its title is hidden while the hide switch is on. Added: an event
whose availability is "free", or which the user declined, is excluded. Issue #29's distinction
stays: hidden activities are out of the reports yet still count for a goal that names them
(`src/domain/events.ts`).

## 5. Activities and categories

An **activity** is the grouping of blocks by normalised label, as today. Categories are v1's
nine (`docs/SPEC.md` §2.3); see [QUESTIONS.md](./QUESTIONS.md) Q3 for commutes.

Resolution order, extending `resolve` in `src/domain/rules.ts`, stopping at the first answer:

| Order | `ResolutionSource` | Example | Writes? |
|---|---|---|---|
| 1 | `activity` | exact, starts with, ends with, contains; most specific wins | User |
| 2 | `kind` (new) | sleep → Rest, workout → Exercise, mindful → Self-care | Built in, overridable by 1 |
| 3 | `calendar` | "everything in this calendar is Work" | User |
| 4 | `keyword` | FR/EN table, suggestion only | Suggestion |
| 5 | `model` | on-device model, suggestion only | Suggestion |
| 6 | `none` | Uncategorized | |

Workout types map deterministically to the label (`Running`), and always to Exercise: a
source that already knows what happened does not go through a model.

Suggestions are never written without the user accepting them (CATEGORISATION.md §4.3).
Every accepted answer writes an `exact` rule.

## 6. Coverage

`coverage(range)` returns minutes per state. The figure shown is:

- **Logged**: `confirmed + likely + guessed`, what `Total Logged Time` already meant.
- **Categorised share**: within logged time, the share not `Uncategorized`, in minutes.
- **Unaccounted**: 168 h minus everything else, shown as a footnote on the Summary.

## 7. Goals

Unchanged from `src/domain/goals.ts`, tested: `mode`, `days`, `durationPerDay`, categories,
activities. Week only.

- A goal counts `confirmed` and `likely` time. It does **not** count `guessed` time: a goal
  must not be met on the strength of an unaccepted guess.
- Progress is against **scheduled days**, not the calendar week: the correction of v1's
  flaw (IMPROVEMENTS.md §A.1), already in the domain.
- Ring: a switch between "current progress" and "entire week" ([INTENT.md](../INTENT.md) §2.2),
  `ringMode` in settings. Colours follow v1's ramp (`docs/SPEC.md` §5.5).

## 8. Time

Weeks and locale as in v1 (week start from the device region, `docs/SPEC.md` §5.1). Blocks
crossing midnight count in each day they touch. Events are compared as numbers, never as
strings. A daylight-saving week has 167 or 169 hours: the 100% invariant uses the real
length of the range.

## 9. Storage

| Data | Where | Note |
|---|---|---|
| Observations | SQLite table `observation`, indexed on `start`, `end` | Rebuilt by re-reading the source when possible |
| Timeline | Computed on read, per visible week; memoised | Never stored, so it cannot drift |
| Settings, rules, goals, reminders | One JSON document, as today (`parseSettings`, version bump) | `importV1Settings` keeps v1 exports working |
| Model suggestions | SQLite table `suggestion`, keyed by normalised title | Same title never classified twice |

Export and backup keep working (`Export Backup` / `Import Backup`): settings, rules and goals
only. Observations are not exported, since health data must not travel through the clipboard.

Revoking or disabling a source deletes its observations.
