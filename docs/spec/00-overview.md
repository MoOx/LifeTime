# Overview

This is the product spec for the LifeTime rebuild (phase 2 of [INTENT.md](../INTENT.md) §5).
It decides what the first release is, from what MoOx asked for, the research in
[DATA-SOURCES.md](../DATA-SOURCES.md) and the native captures in
[reference/v1](../reference/v1/README.md). Choices that only MoOx can make are collected in
[QUESTIONS.md](./QUESTIONS.md), each with the default this spec assumes.

| File | Covers |
|---|---|
| [10-model.md](./10-model.md) | Observations, the resolved timeline, activities, rules, goals |
| [20-sources.md](./20-sources.md) | Each source: what is read, permissions, failures, how to fake it |
| [30-screens.md](./30-screens.md) | Navigation, headers, screens, states, strings |
| [40-design.md](./40-design.md) | Type, spacing, colour, components, Liquid Glass |
| [50-architecture.md](./50-architecture.md) | Scaffold, libraries, storage, background work, verification |
| [60-slices.md](./60-slices.md) | Ordered build slices with their evidence |

## The product in one paragraph

LifeTime shows how your week was spent, with as little manual logging as possible, using
only what is already on your phone, and helps you keep the goals and limits you set. Sensors
give the week its skeleton (when you slept, trained, were somewhere); the calendar gives it
its meaning (what you were doing). What the app does not know, it says it does not know.

## The two-step vision (D6)

1. **Now:** a weekly overview with minimal manual logging.
2. **Later:** recommendations to adjust time and activities against life goals and
   constraints. This release only prepares for it: the model keeps the planned-versus-observed
   distinction that step 2 needs ("you planned three gym sessions; your watch saw one").

## First release

The first release is **v1's product, rebuilt natively, plus the first automatic sources**.

**Sources**
- Calendar on iOS and Android, as in v1.
- iOS: HealthKit sleep and workouts.
- Android: Health Connect sleep and exercise.
- Demo data, shown before any permission is requested.

**Screens:** every v1 screen (Welcome, Summary, Activity detail, Filters, Goals, Goal editor,
Settings, Notifications, Reset, Help, Privacy), plus two new ones: the Sorter, which
categorises in bulk, and Sources.

**Categorisation:** text and calendar rules, the Sorter, keyword suggestions, and the magic
wand on devices that have an on-device model, if spike 6 passes.

**Quality bar:** v1's content, hierarchy and polish, as captured; headers and navigation that
are the platform's own (D10); every screen checked on a native renderer before MoOx sees it.

## Deliberately out of the first release

| Out | Why | When |
|---|---|---|
| Location visits and geofences | High value on iOS, but requires a real device for every check, has an open iOS 26 delivery regression, and is what makes "located but unlabelled" time appear. The model is ready for it | First follow-up, after a week of field testing on MoOx's iPhone |
| Core Motion and Android activity transitions | Depend on a custom module and give boundaries without labels; worth little before places exist | With visits |
| Android UsageStats | Strongest Android-only source, needs a custom module and a disclosure screen | Second follow-up, once the core passes Play review |
| Screen Time | Only useful in the EU, entitlement wait of weeks, "personal device usage management" positioning required | Only if MoOx files the request ([QUESTIONS.md](./QUESTIONS.md) Q7) |
| Android background location | Hardest review in the inventory; rules tighten on 27 January 2027 | After the core is approved |
| Focus filters, Shortcuts recipes | Exact but need user setup, one signal at a time | Later, on request |
| Cloud sources | Google Calendar and Microsoft Graph matter mainly for the web demo. Strava is out (D4) | With the web demo, deferred |
| Web target | Deferred by MoOx ([INTENT.md](../INTENT.md) §2.2) | After the native release |
| Recommendations | Vision step 2 | Later |
| Periods other than the week for goals | v1 stored them and never honoured them | Not planned |
| User-defined categories | Not asked for; the data shape allows it | Not planned |

## What success looks like

- A new user sees a believable week within seconds, with demo data and no permission asked.
- After granting access, a real week appears, and one action categorises most of it.
- MoOx, comparing with the v1 captures, finds the screens as clean as v1 was, and finds
  nothing wrong with titles on scroll or with navigation.
- No claim in the app is unproven: a number is either measured, or labelled as a guess, or
  counted as unaccounted.
