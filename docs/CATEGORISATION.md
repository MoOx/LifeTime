# Categorisation

*How an event title becomes a category, why v1's answer was the thing that stopped the app
being adopted, and where an on-device model fits.*

---

## 1. The problem, stated plainly

LifeTime's entire output depends on one mapping: **event title → category**. Every chart,
every goal, every number comes from it. If that mapping is empty, the app shows one grey
bar and nothing else.

v1 had exactly one way to fill it in:

1. Open the Summary.
2. Tap an activity.
3. Pick a category.
4. Repeat.

And the match was strict lowercase equality (`Activities.isSimilar`). So `Standup`,
`Daily standup` and `Standup — team` were three separate activities, each needing its own
trip through those four steps.

A real calendar has a few hundred distinct titles. That is a few hundred taps before the
app tells you anything you did not already know — which is a fair description of why it
never got past its author. Everything below exists to reduce that number.

Two of the three mechanisms below were already promised in v1's own help text as "Premium"
features (issues [#13](https://github.com/MoOx/LifeTime/issues/13),
[#14](https://github.com/MoOx/LifeTime/issues/14)). They were never built.

---

## 2. The mechanisms, in precedence order

`src/domain/rules.ts` resolves a category by trying each in turn and stopping at the first
answer. Precedence is by **specificity**, so adding a broad rule can never silently
override a narrow one the user wrote earlier.

### 2.1 Text rules — `source: 'activity'`

An `Activity` is a pattern plus a match mode:

| Mode | Meaning | Specificity |
| --- | --- | --- |
| `exact` | the whole normalised title | 3 |
| `startsWith` | prefix | 2 |
| `endsWith` | suffix | 2 |
| `contains` | anywhere | 1 |

Within one mode, the **longer** pattern wins. So:

```
contains "dinner"           → Nutrition
exact    "dinner with jane" → Social
```

resolves *Dinner with Jane Doe* to Social — which is exactly the scenario issue #13 worried
about, resolved by rule rather than by asking the user to order anything.

Both sides are put through `normalizeTitle` first: case-folded, whitespace collapsed
(issue [#12](https://github.com/MoOx/LifeTime/issues/12)), leading emoji dropped, and a
trailing ` — someone` / ` w/ someone` attendee suffix removed. That last one collapses a
lot of real calendar noise into one activity for free.

The reach of a broad rule is shown before it is saved. `app/activity/[title].tsx` counts
how many *other* titles in the last six weeks the rule would also claim, and says so —
issue #13 identified an invisible blast radius as the hard part of the UX, and it is.

### 2.2 Calendar rules — `source: 'calendar'`

> "tout ce calendrier c'est *travail*"

A whole calendar maps to a category, in `Settings.calendarCategories`. One tap, hundreds of
events. For anyone whose work already lives in a work calendar — which is most people who
would install this app — that single row *is* the onboarding.

It sits below text rules deliberately: a work calendar is a good default and a bad
absolute, and `Team lunch` should still be able to be Nutrition.

### 2.3 Keyword suggestions — `source: 'keyword'`

A small bilingual table in `activities.ts` (`SUGGESTIONS`). No network, no model, ~8 regexes.

It exists so a brand-new user sees a full-colour chart in the first thirty seconds rather
than after an afternoon of tapping. It is **only ever a suggestion**: `resolve` does not
consult it unless asked with `{ includeKeywords: true }`, which only the sorter does.

---

## 3. The sorter

`app/categorize.tsx`. The screen that replaces "repeat a few hundred times".

- Reads the last `categorisationWeeks` weeks (default 6, user-settable).
- `suggestAll` groups every **uncategorised** title, sums its minutes, and sorts by
  **weight**. Six hours of *Deep work* is offered before twenty minutes of *Charge
  airpods*, because that is the order in which decisions change the chart.
- Every row carries a guess. **Accept all** applies every guess at once.
- Answering a row writes an `exact` rule. Tapping the row opens the activity screen, where
  the rule can be broadened.
- A coverage figure (`coverage`) says how much of your time is now categorised, in
  **minutes, not in row count** — which is the honest measure of how done you are.

The list is frozen once when the events arrive. Recomputing it per answer would make rows
vanish under the user's thumb and the remaining count jump around.

---

## 4. Where the on-device model goes

> "à terme, idéalement des propositions en utilisant un llm local qui pourrait proposer
> « voilà le nom de l'event, voilà les categories dispo, tu classerais ça où ? » […] Un
> bouton baguette magique qui propose de tout classer en un clic. Pour les novices."

**Not built.** This section is the design it should slot into, so that it can be.

### 4.1 Why it fits here and nowhere else

Everything the model needs is already the shape of `Suggestion`:

```ts
type Suggestion = {
  title: string        // the prompt
  categoryId: string   // the answer
  source: ResolutionSource
  minutes: number      // impact, for sorting
  count: number
}
```

`ResolutionSource` already reserves `'model'`. Swapping the keyword table for a model
changes **where `categoryId` comes from** and nothing else: same list, same rows, same
accept-all, same undo. The wand button in the UI is the same button.

### 4.2 The APIs

| Platform | API | Availability |
| --- | --- | --- |
| iOS 26+ | Foundation Models (`LanguageModelSession`, guided generation) | On-device, free, no entitlement. Apple Intelligence devices only. |
| Android | ML Kit GenAI / Gemini Nano via AICore | On-device, Pixel 9+ and comparable; capability must be queried, not assumed. |

Neither is exposed by an Expo module today, so each needs a small native module. Guided
generation matters: constraining the output to the category enum removes parsing entirely,
which is what makes this reliable enough to run unattended over hundreds of titles.

### 4.3 The rules that must hold

1. **Batch, do not stream.** One session, all uncategorised titles, one pass. Per-title
   round trips over a few hundred titles is minutes of wall clock and a flat battery.
2. **Send titles, nothing else.** No dates, no attendees, no notes, no location. The
   privacy claim in `app/privacy.tsx` is that the calendar does not leave the device, and
   an on-device model does not weaken it — but only if the prompt stays minimal, so that
   the claim survives the day someone asks for a cloud fallback. There is no cloud
   fallback.
3. **Suggestions, never writes.** The wand fills the pickers. The user accepts.
4. **Degrade in silence.** No capable model → the keyword table, no message, no nag. Most
   devices will not have one for years.
5. **Cache by normalised title.** The same title must not be classified twice, ever.

### 4.4 What it would be worth

On the demo calendar, the keyword table covers roughly the events it was written for and
leaves the rest. A model that reads *Charge airpods*, *Odysée* or *Nuit des étoiles* and
files them sensibly is the difference between "sort 40 activities" and "check 40
suggestions" — which is the difference between a tool for its author and a tool for
someone else. That is why this is written down rather than left in a message.

---

## 5. Testing

`src/domain/__tests__/rules.test.ts` covers precedence (specific over broad, longer over
shorter), calendar rules and their override, the keyword opt-in, `suggestAll` ordering and
grouping, coverage-by-minutes, and issue #29's hidden-but-categorised case.

All of it runs with no device and no calendar, because `demoEvents` generates a
deterministic week — see `src/domain/demo.ts`.
