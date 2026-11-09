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
add what they measure with certainty (when you slept, trained); the calendar gives the week
its meaning (what you were doing). The calendar stays the primary source: someone who works
and trains at home gives sensors little to see, and the app must be good with the calendar
alone. The app shows what you do, not what it could not see.

## The two-step vision (D6)

1. **Now:** a weekly overview with minimal manual logging.
2. **Later:** recommendations to adjust time and activities against life goals and
   constraints. This release only prepares for it: the model keeps the planned-versus-observed
   distinction that step 2 needs ("you planned three gym sessions; your watch saw one").

## Release plan (D21)

Each step is small enough to use for real before deciding the next one.

| Release | Content |
|---|---|
| **v2-alpha1** | v1's product brought up to date on iOS: calendar only, existing domain logic, all v1 screens, the Sorter, demo data before any permission |
| **v2-alpha2** | Sleep and workouts (HealthKit), the observation model and the overlap rules, the Sources screen |
| **Then** | Android pass (D7); rethink the interface around automation, from what real weeks showed |

Sleep and workouts change the visuals little: they are new blocks in the same chart. The
interface is deliberately not rethought yet. Automation should move the app from "sort your
list" towards "here is your week, fix what is wrong", but what automation really names on real
weeks must be known first. So alpha1 puts its care in what survives a redesign: navigation,
native headers, lists, chart, rings.

**Quality bar:** v1's content, hierarchy and polish, as captured; headers and navigation that
are the platform's own (D10); every screen checked on a native renderer before MoOx sees it.

## Deliberately out of alpha1 and alpha2

| Out | Why | When |
|---|---|---|
| Android | iOS first (D7) | A dedicated pass after alpha2 |
| Magic wand (on-device model) | Keywords, rules and the Sorter come first | After alpha2 |
| Location visits, geofences | Need a real device for every check and have an open iOS 26 delivery regression | After alpha2, with field testing |
| Core Motion, activity transitions | Boundaries without labels; worth little before places | With visits |
| Android UsageStats | Custom module and disclosure screen | After the Android pass |
| Screen Time | EU-only data; not urgent (D19) | Later |
| Focus filters, Shortcuts recipes | User setup, one signal at a time | On request |
| Cloud sources, web target | Deferred by MoOx. Strava is out (D4) | Later |
| Recommendations | Vision step 2 | After the interface rethink |
| Periods other than the week for goals | v1 stored them and never honoured them | Not planned |
| User-defined categories | MoOx raised someone tracking both Transport and reading; to revisit with alpha2's overlap rules | To discuss |

## What success looks like

- A new user sees a believable week within seconds, with demo data and no permission asked.
- After granting access, a real week appears, and one action categorises most of it.
- MoOx, comparing with the v1 captures, finds the screens as clean as v1 was, and finds
  nothing wrong with titles on scroll or with navigation.
- No claim in the app is unproven: a number is either measured or stated by a source, and a
  guess is labelled as one.
