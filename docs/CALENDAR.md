# Calendar access — post-mortem and replacement strategy

> This was **the** blocking issue of the original project. This document explains exactly
> what broke, what the options are today, and what to do.

---

## 1. Verdict

`react-native-calendar-events` is **dead**.

| | |
|---|---|
| Version used | `2.2.0` |
| Published | **2021-01-08** |
| Last repo activity in npm metadata | 2022-06-26 |
| Local patch carried by LifeTime | **17 KB** (`patches/react-native-calendar-events+2.2.0.patch`) |

Five and a half years without a release, while React Native shipped the New Architecture,
Fabric, TurboModules, Swift/Kotlin module systems, and iOS 17's split calendar permissions
(`NSCalendarsWriteOnlyAccessUsageDescription` / `NSCalendarsFullAccessUsageDescription`).
An unmaintained `RCTBridgeModule` written against RN 0.6x will not survive that.

**Replacement: [`expo-calendar`](https://www.npmjs.com/package/expo-calendar).**
Version `57.0.1`, published 2026-07-15, part of the Expo SDK, with commits landing in the
current month. It is the only calendar-access module in the ecosystem with a maintenance
budget behind it.

---

## 2. What the patch actually tells us

The patch is the most valuable artifact in the repo: it is a bug report written in diff
form. It does three distinct things.

### 2.1 It disables most of the event payload — for speed

On **both** platforms the patch comments out serialization of `recurrenceRule`,
`attendees`, `alarms`, `notes`/`description`, `location`, `availability`,
`occurrenceDate`, `isDetached`, `structuredLocation`, `timeZone`, `url`, `syncId`.

```diff
-        event.putString("description", cursor.getString(2));
+        // event.putString("description", cursor.getString(2));
...
-        event.putArray("attendees", (WritableArray) findAttendeesByEventId(cursor.getString(0)));
+        // event.putArray("attendees", ...);
```

The reason is structural: the old library **eagerly serializes every field of every event**
into a `WritableMap` before crossing the bridge. `findAttendeesByEventId` and
`findReminderByEventId` each issue **an extra content-provider query per event**. LifeTime
reads 6 weeks at a time and only ever uses `title`, `startDate`, `endDate`, `allDay` and
`calendar.id` — so it was paying an N+1 query cost plus a full JSON serialization for data
it discarded.

This also explains why `src/Calendars.res` keeps an in-memory `Map` cache keyed by ISO
range: fetching was expensive enough to need memoizing.

### 2.2 It fixes iOS thread-safety

The patch wraps `findCalendars`, `saveCalendar`, `removeCalendar`, `fetchAllEvents`,
`findEventById`, `saveEvent` and `removeEvent` in `dispatch_async(serialQueue, ...)` and
replaces direct `self.eventStore` access with a `weakSelf`/`strongSelf` pair:

```diff
+    __weak RNCalendarEvents *weakSelf = self;
+    dispatch_async(serialQueue, ^{
     @try {
-        NSArray* calendars = [self.eventStore calendarsForEntityType:EKEntityTypeEvent];
+    RNCalendarEvents *strongSelf = weakSelf;
+        NSArray* calendars = [strongSelf.eventStore calendarsForEntityType:EKEntityTypeEvent];
```

`EKEventStore` calls were running on the JS/bridge thread and blocking it. This is the
class of bug that produces the "the app freezes for two seconds when I open it" symptom.

### 2.3 It works around an iCloud/subscribed calendar bug

`saveCalendar` only accepted `EKSourceTypeLocal` as a fallback source; the patch also
accepts `EKSourceTypeSubscribed`. Without it, demo-data injection failed on devices with
no local calendar account.

**Net conclusion:** the maintenance burden was not incidental. The library's data model
(eager full serialization) was fundamentally wrong for a read-heavy analytics app, and the
iOS implementation was not thread-safe. Both are fixed by design in `expo-calendar`.

---

## 3. Why `expo-calendar` fixes it

### 3.1 Lazy shared objects instead of eager serialization

Since SDK 56 the object-oriented API is the default export
(`expo-calendar` root; the old record-based API moved to `expo-calendar/legacy`).
`getCalendars()` and `listEvents()` return **shared objects** whose fields are declared as
native `Property` getters:

```kotlin
// android/src/main/java/expo/modules/calendar/next/CalendarNextModule.kt
Property("title")     { expoCalendarEvent: ExpoCalendarEvent -> ... }
Property("alarms")    { expoCalendarEvent: ExpoCalendarEvent -> ... }
Property("attendees") { expoCalendarEvent: ExpoCalendarEvent -> ... }
```

A field you never read is never computed and never crosses the boundary. The exact problem
the patch was hacking around is gone at the architecture level — no fork required.

### 3.2 Correct recurrence expansion on both platforms

- **Android** queries `CalendarContract.Instances.CONTENT_URI` with the range appended and
  `Instances.VISIBLE = 1`, sorted by `Instances.BEGIN`
  (`next/domain/repositories/instance/InstanceRepository.kt`) — occurrences are expanded
  by the provider, and hidden calendars are filtered out natively.
- **iOS** uses `EKEventStore.predicateForEvents(withStart:end:calendars:)`, which also
  returns expanded occurrences.

The old library's recurrence handling was the first thing the patch disabled.

### 3.3 Modern permission model

`requestCalendarPermissions({ writeOnly })` maps to iOS 17+'s split full/write-only
calendar access, with the matching `Info.plist` keys generated by the config plugin.
`react-native-calendar-events` predates that split entirely.

### 3.4 Config plugin — no more native edits

Permission strings, `Info.plist` keys and the Android manifest entries are declared in
`app.json`, not hand-edited:

```json
["expo-calendar", {
  "calendarPermission": "LifeTime reads your calendars to build your time reports. Your data never leaves your device."
}]
```

---

## 4. API mapping

| LifeTime today (`src/ReactNativeCalendarEvents.res`) | `expo-calendar` |
|---|---|
| `checkPermissions(false)` | `getCalendarPermissions()` |
| `requestPermissions()` | `requestCalendarPermissions()` |
| `findCalendars()` | `getCalendars(EntityTypes.EVENT)` |
| `fetchAllEvents(startISO, endISO, None)` | `listEvents(calendarIds, start, end)` |
| `findEventById(id)` | `ExpoCalendarEvent.get(id)` |
| `saveCalendar(opts)` *(demo only)* | `createCalendar(details)` |
| `saveEvent(title, evt, opts)` *(demo only)* | `calendar.createEvent({...})` |
| `removeEvent(id, opts)` | `event.delete()` |

Field mapping for the five fields LifeTime actually consumes:

| Old | New | Note |
|---|---|---|
| `event.title` | `event.title` | identical |
| `event.startDate: string` | `event.startDate: string \| Date` | **no longer ISO-string-only** |
| `event.endDate: string` | `event.endDate: string \| Date` | idem |
| `event.allDay: option<bool>` | `event.allDay: boolean` | no longer optional |
| `event.calendar.id` | `event.calendarId` | flat, cheaper — no nested calendar object |

> ⚠️ **Migration trap.** `src/Calendars.res:184-190` compares dates by **ISO string
> ordering** (`evt.endDate > endDate->Js.Date.toISOString()`). That only works because the
> old library always returned UTC `toISOString()` output. With `expo-calendar` you must
> compare timestamps. Normalize once at the edge:
> ```ts
> const start = new Date(event.startDate).getTime()
> ```

---

## 5. One decision to make: new API vs `legacy`

`expo-calendar` ships both, and for LifeTime the trade-off is not obvious.

|  | `expo-calendar` (shared objects) | `expo-calendar/legacy` (`getEventsAsync`) |
|---|---|---|
| Payload | lazy per-property, native getters | one bulk serialization, plain JS records |
| Cost of reading 5 fields × N events | 5·N native property reads | 1 bridge crossing, then plain JS |
| Best when | you read few events, or few fields of many | you read **all** events and iterate hard |
| Future | the maintained path | supported, but explicitly "legacy" |

LifeTime iterates over **every** event of a 6-week window several times per render
(`makeMapTitleDuration`, `makeMapCategoryDuration`, `WeeklyGraph` per-day bucketing). That
is the pattern where per-property native reads can lose to one bulk copy.

**Recommendation:** use the modern API, but **project immediately into a plain local
type** at the repository boundary — read each field exactly once:

```ts
// data/events.ts
export type TimeEvent = {
  id: string
  calendarId: string
  title: string
  start: number   // epoch ms
  end: number     // epoch ms
  allDay: boolean
}

export async function fetchEvents(
  calendarIds: string[], start: Date, end: Date,
): Promise<TimeEvent[]> {
  const events = await Calendar.listEvents(calendarIds, start, end)
  return events.map((e) => ({
    id: e.id,
    calendarId: e.calendarId,
    title: e.title,
    start: new Date(e.startDate).getTime(),
    end: new Date(e.endDate).getTime(),
    allDay: e.allDay,
  }))
}
```

Everything downstream works on `TimeEvent`, which is:

- **fast** — one pass, then pure JS on numbers;
- **testable** — the whole aggregation layer becomes a pure function over an array of
  plain objects, no native mocking needed (the current code has almost no unit tests
  precisely because everything is entangled with the native module);
- **swappable** — if `expo-calendar` ever needs replacing, only this file changes.

Benchmark both on a real device with a busy calendar before committing; the projection
boundary makes switching a one-line change.

---

## 6. Remaining gaps and how to handle them

| Gap | Impact on LifeTime | Mitigation |
|---|---|---|
| No change notifications (`EKEventStoreChanged` / Android `ContentObserver` are not exposed) | must poll on foreground, as today | keep the `AppState` refresh; add `expo-background-task` for a periodic pre-warm |
| Android providers vary by OEM/ROM | some calendars may report odd `isVisible`/`isSynced` | filter on `isVisible`, and surface every calendar in Filters so the user can correct |
| Recurring instances have no stable per-occurrence id (both OSes) | do not key React lists on `event.id` alone | key on `` `${id}@${start}` `` |
| Very large ranges are still a content-provider query | a "whole year" report would be slow | fetch week-by-week, cache aggregates (see IMPROVEMENTS §3.2) |
| iOS 17+ write-only permission | demo-data injection needs full access | request full access only when the user opts into demo data |

---

## 7. Alternatives considered

| Option | Verdict |
|---|---|
| **`expo-calendar`** | ✅ **Chosen.** Actively maintained, lazy payload, config plugin, modern permissions, correct recurrence expansion. |
| Fork `react-native-calendar-events` | ❌ Inherits an eager-serialization design and a non-thread-safe iOS implementation, and makes *you* the maintainer of the thing that already blocked the project once. |
| Write a custom Expo Module (Swift `EventKit` + Kotlin `CalendarContract`) | ⚠️ Viable and not very large (~400 lines), and it would let you push aggregation into native. But it re-creates the exact single-maintainer risk. **Keep as a plan B**, only if profiling proves `expo-calendar` too slow — and then only for the read path. |
| `react-native-add-calendar-event` | ❌ Write-only, and its own author now recommends `expo-calendar`. |
| `react-native-calendars` (wix) | ❌ Different thing entirely — a calendar *UI* widget, not device calendar access. Potentially useful later for a day/agenda view, unrelated to this problem. |

---

## 8. Migration checklist

- [ ] `npx expo install expo-calendar`
- [ ] Add the config plugin + permission copy to `app.json`
- [ ] Implement `data/events.ts` with the `TimeEvent` projection (§5)
- [ ] Replace ISO-string date comparisons with timestamp comparisons everywhere
- [ ] Re-key React lists on `id@start` for recurring occurrences
- [ ] Port the calendar-reconciliation logic from `AppSettings.decodeJsonSettings`
      (matching skipped calendars by `id`, falling back to `title` + `color` — a genuinely
      good idea, because calendar ids are not stable across devices; keep it)
- [ ] Benchmark `listEvents` vs `legacy.getEventsAsync` on a device with a real calendar
- [ ] Delete `patches/react-native-calendar-events+2.2.0.patch` and the `patch-package` step
