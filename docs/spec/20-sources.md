# Sources

Facts and citations are in [DATA-SOURCES.md](../DATA-SOURCES.md); this file states what the
app does with them. Each source implements one interface and owns its own privacy claim
([SCREENS.md](../SCREENS.md) §12): "nothing leaves this device" is attached to the source,
not written once for the whole app.

```ts
interface Source {
  id: SourceId
  status(): Promise<'available' | 'unavailable' | 'notAsked' | 'granted' | 'denied' | 'unknown'>
  request(): Promise<void>
  read(range: Range): Promise<Observation[]>
  /** Delete everything this source contributed. */
  forget(): Promise<void>
}
```

**The ask is always in context**: a source explains itself on its own row in Sources, and the
system prompt appears only after the user taps it.

## Demo

- **Reads:** generated events and sessions (`src/domain/demo.ts`), in memory.
- **When:** from first launch until the first real source is granted, and on demand from
  Reset.
- **Permission:** none. The Summary, Goals and Activity detail all work with it.
- **Change from v1:** v1 wrote a real calendar; demo stays in memory, so nothing can be left
  behind ([SCREENS.md](../SCREENS.md) §10c). `Create Demo Calendar` is replaced by
  `Show Demo Data`.
- **Banner:** a persistent row on the Summary: `Demo data` with an action `Use my calendar`.

## Calendar (iOS, Android)

- **Reads:** title, start, end, all-day, calendar id, availability, and the user's own
  attendee status where the platform gives it. Six weeks back, one forward.
- **When:** on app launch, on return to the foreground, on pull to refresh (see
  [QUESTIONS.md](./QUESTIONS.md) Q4), and on the platform's event-store change signal.
- **Permission:** iOS full access; Android `READ_CALENDAR`. Never write access.
- **Privacy statement:** `Your calendars stay on this device. LifeTime only reads them.`
  v1's "mostly read-only" hedge goes ([SCREENS.md](../SCREENS.md) §9).
- **Failures:** denied → Summary shows the permission card with `Open Settings`; no calendars
  → the empty state; a calendar that disappears → its observations are dropped.
- **Library:** `expo-calendar`.
- **Fake it:** Maestro flow granting calendar then injecting events through a debug-only deep
  link, as v1's demo calendar did; the simulator's calendar is real.

## HealthKit (iOS)

- **Reads:** `HKWorkout` (type, start, end), `sleepAnalysis` (in bed and stages), `mindfulSession`.
  No quantities in the first release.
- **When:** as calendar, using anchored queries. Background delivery is not used in the first
  release: reading on open is enough for a weekly report.
- **Permission:** per type, requested from the Sources row. iOS 27 adds a history window
  screen.
- **Privacy statement:** `Your sleep and workouts stay on this device.`
- **Failures that must be designed for:**
  - A denied read looks like no data. Never display "no exercise": the Sources row says
    `No workouts found. Check access in the Health app.` with a link.
  - iOS 27 limited history: weeks before `earliestAuthorizedSampleDate` are labelled unknown,
    not empty.
  - Store locked in the background: read on open only, so this does not arise.
  - Two watches or apps writing sleep: one source per night (10-model.md §3).
- **Policy:** the health purpose must be visible in the UI and in store copy (Guideline 2.5.1,
  DPLA 3.3.3(H)). Position it as `The balance of your sleep and exercise in your week`. No
  health data in iCloud; the backup excludes observations.
- **Library:** `@kingstinct/react-native-healthkit`.
- **Fake it:** the simulator keeps samples an app saves: a debug-only seed writes a week of
  sleep and workouts. Spike 4 proves it. The permission sheet is tapped by Maestro.

## Health Connect (Android)

- **Reads:** `SleepSessionRecord`, `ExerciseSessionRecord`, `MindfulnessSessionRecord` where
  supported.
- **When:** on open. No background reads in the first release.
- **Permission:** READ_SLEEP, READ_EXERCISE, READ_MINDFULNESS. No history permission: a weekly
  report needs at most 30 days.
- **Privacy statement:** same as HealthKit.
- **Failures:** Health Connect missing on Android 9 to 13 → Sources row offers the install; no
  wearable → an honest `No sleep data on this phone`; deduplicate by `metadata.dataOrigin`.
- **Policy:** Play health apps declaration, per data type.
- **Library:** `react-native-health-connect`; its open time-zone bug is covered by a test with
  fixture records.
- **Fake it:** seed through the Health Connect testing tools on an emulator; verified in the
  Android slice.

## Reserved, not built in the first release

`visit`, `motion` and `usage` are designed in [DATA-SOURCES.md](../DATA-SOURCES.md). The
model reserves their kinds and the `located` state so that adding them changes no schema.
Their one common obligation, when they come: on iOS the app must open or wake at least every
7 days (Core Motion), on Android every 10 (usage events), or detail is lost for good.

## On-device categorisation is not a source

It labels calendar titles only. It sends titles and nothing else: no dates, no attendees, no
notes. The Private Cloud Compute entitlement is never added, and a check in `npm run check`
fails if it appears. See [CATEGORISATION.md](../CATEGORISATION.md) §4.
