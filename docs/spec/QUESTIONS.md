# Questions for MoOx

Decisions only MoOx can take. The spec assumes each default. Once answered, the answers go to
[INTENT.md](../INTENT.md) §4 and into the spec.

| # | Question | Recommended default | Why it matters |
|---|---|---|---|
| Q1 | **First-release sources.** Calendar + sleep and workouts (HealthKit, Health Connect), with location visits as the first follow-up? | Yes | Visits are the biggest gain on iOS, but they cannot be tested on a simulator, need a week of carrying your iPhone, and have an open iOS 26 delivery bug. Including them delays the first release |
| Q2 | **Framing.** Adopt "the sensors give the skeleton, the calendar gives the meaning", and show unaccounted time openly (`X h unaccounted`)? | Yes | It decides whether the app admits what it does not know. Otherwise, gaps are hidden |
| Q3 | **Commutes.** When motion data arrives, a new Transport category, or Uncategorized? No impact until visits and motion exist | New `Transport` category, added with motion | Commutes fit none of the eight. Changing the list later touches goals and the chart legend |
| Q4 | **Summary refresh.** Keep pull-to-refresh, or a `Refresh` action beside `Updated …`? | Pull-to-refresh if spike 1 shows that it coexists with the large title; else the action | It is one of the conflicts that hurt v2 |
| Q5 | **What counts as "happened".** A past calendar event with no contradiction counts as time spent, as in v1, and counts for goals? | Yes, as `likely` | The alternative, requiring confirmation, brings manual logging back. The trade-off: an event you skipped still counts |
| Q6 | **Android timing.** Parity in every slice, or iOS first and Android after? | Every slice | D7 says iOS first, Android to parity. Parity per slice costs about a quarter more per slice, but prevents a second "doesn't feel native" |
| Q7 | **Screen Time.** File the Family Controls request now (it can take weeks and is free to file), for EU-only per-app data later? Needs your Apple account. It also requires positioning as personal device-usage management | Do not file; revisit after the first release | Only worth it if Entertainment on iOS matters to you. Filing late costs months if you change your mind |
| Q8 | **Reminders prompt.** v1's prompt right after the first goal (capture 07), or v2's approach, asking when the switch is turned on? | v1's prompt, as a native sheet | You asked to keep the inside of screens. v2 replaced it deliberately, arguing that a prompt before the feature is seen is premature |
| Q9 | **Languages.** English only as v1, or French too from the first release? | English first, with all copy in one file so French is one slice | v1's strings are English. Your first users are possibly French. Adding it later is cheap if prepared now |
| Q10 | **Same app identity.** The new app replaces v1 on the App Store (`io.moox.LifeTime`, same listing), and v1 exports import? | Yes | A new id means a new listing, and existing users would not receive it |
| Q11 | **Health positioning.** Are you fine with store copy such as "the balance of your sleep and exercise in your week"? Apple requires the health purpose to be evident in the UI and marketing | Yes | The alternative is dropping HealthKit, the most valuable iOS source |
| Q12 | **Recommendations.** Keep them out of this release entirely, with only the planned-versus-observed data kept for later? | Yes | Vision step 2. Scope and timing are yours |
| Q13 | **Business model.** Free, as v1? Free and Screen Time are linked (Guideline 4.10 forbids monetising Screen Time) | Free for the first release | It affects store setup, and whether anything must be held back |

Assumed without asking, because they follow from what you already said; tell me if any is
wrong:

- Web demo stays deferred.
- Ring switch opens on "entire week", as decided during v2.
- Chart stacking uses category order, so colours do not move as you swipe weeks.
- The app starts on the Summary after a cold start, instead of reopening the last sheet as v1
  did.
- Double counting ends: an overlap is counted once. Your totals will be lower than v1's
  where events overlap.

## Closed (2026-11-09)

All answered, and recorded in INTENT.md §4: Q1 (D21), Q2 (D22, D24), Q3 and overlaps (D23),
Q4 (D13), Q5 (D14; a past event counts, 10-model.md), Q6 (D7), Q7 (D19), Q8 (D20), Q9 (D15),
Q10 (D16), Q11 (D17), Q12 (out, 00-overview.md), Q13 (D18). The defaults in the table above are
kept as history; where they differ, the spec and INTENT.md prevail. Assumed points changed
since: chart stacking follows the week's totals (D25), and overlaps are D23, not a single
count.
