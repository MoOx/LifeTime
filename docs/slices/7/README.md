# Slice 7: Settings, Notifications, Reset

Done 2026-11-13 (docs/spec/60-slices.md, slice 7; SCREENS.md §6, §10b, §10c, §10e).

## What changed

- **Settings kept on the device** (`src/data/settings.tsx`): one JSON document in SQLite
  (`expo-sqlite`, spec/50-architecture.md), read synchronously before the first screen and
  written after each change, through `parseSettings`. Welcome no longer shows at every launch.
  The theme preference applies with `Appearance.setColorScheme`, SwiftUI included.
- **Settings** (`app/(tabs)/settings/index.tsx`): v1's rows and coloured symbols:
  Notifications; Theme (Light, Dark, Auto, a check, v1's footnote); More (Help, Welcome
  Screen, Calendar App, App System Settings); Reset. `Row` gained a symbol, a check and the
  link and destructive colours (`src/ui/Form.tsx`).
- **Notifications** (`app/(tabs)/settings/notifications.tsx`, `src/data/notifications.ts`):
  `Allow Notifications` mirrors iOS's permission (asks, or opens Settings once refused);
  `Daily Reminders`; reminders sorted by time with "Next notification / tomorrow at 9:00 AM";
  a time picker with `Cancel` / `Add`; v1's duplicate alert; v1's footnote. Reminders are
  really scheduled: a week of one-off local notifications, rescheduled on launch, foreground
  and change, with v1's phrases (`NotificationsRegisterer.res`).
- **Reminders card** (`app/reminders-access.tsx`, capture 07): v1's bell, "Set Up Reminders"
  and sentence, after the first goal when iOS has not been asked, as a sheet sized to its
  content with `Not Now` (D20, D28).
- **Reset** (`app/(tabs)/settings/reset.tsx`): `Export Backup` / `Import Backup` through the
  clipboard with v1's alerts and failure messages; `Show Demo Data` / `Hide Demo Data`
  (spec/30-screens.md: the demo lives in memory); `Reset Settings & Erase All Metadata` with
  v1's confirmation. The Summary's demo card offers `Hide Demo Data` when the calendar is
  allowed.
- Domain, tested: `upcomingFirings` (a week ahead, v1's rule for a firing too close, iOS's
  64 pending at most), `MINIMUM_GAP_MINUTES` back to v1's 30 (v2 had 15, unsourced),
  "tomorrow at" in `formatUpdated`, `showDemo` in the settings.

## Evidence

`maestro test .maestro/settings.yaml` on an E2E Release build, iPhone 17 Pro, iOS 27.2:
75 steps `COMPLETED`, in light and in dark. The flow adds a first goal, gets the reminders
card and iOS's real prompt, switches the theme, checks the reminders and the duplicate alert,
exports, erases, imports back (the goal returns), stops and relaunches the app (no Welcome,
the goal is still there), then schedules a reminder a minute ahead (E2E builds only) and waits
on the home screen until it is delivered. The other flows pass again in light (`summary` 40,
`calendar` 46, `goals` 61, `activity` 50). [check.txt](./check.txt): `npm run check`, 144
tests.

[delivered.log](./delivered.log): the simulator's SpringBoard log for that last run: 8
notifications pending (7 reminders and the test one), the test one saved with
`shouldPresentAlert: YES`, then 7 pending.

| | Comparison (v1 left) | Light | Dark |
|---|---|---|---|
| 07 Reminders card | [compare-07.png](./compare-07.png) | [light-07-reminders-prompt.png](./light-07-reminders-prompt.png) | [dark-07-reminders-prompt.png](./dark-07-reminders-prompt.png) |
| iOS's prompt | | [light-07b-system-prompt.png](./light-07b-system-prompt.png) | [dark-07b-system-prompt.png](./dark-07b-system-prompt.png) |
| 30 Settings | [compare-30.png](./compare-30.png) | [light-30-settings-top.png](./light-30-settings-top.png) | [dark-30-settings-top.png](./dark-30-settings-top.png) |
| Theme forced dark | | [light-30b-theme-dark.png](./light-30b-theme-dark.png) | |
| 33 Notifications | [compare-33.png](./compare-33.png) | [light-33-notifications.png](./light-33-notifications.png) | [dark-33-notifications.png](./dark-33-notifications.png) |
| Adding a reminder | | [light-33b-adding.png](./light-33b-adding.png) | [dark-33b-adding.png](./dark-33b-adding.png) |
| Duplicate | | [light-33c-duplicate.png](./light-33c-duplicate.png) | [dark-33c-duplicate.png](./dark-33c-duplicate.png) |
| A reminder delivered | | [light-33d-delivered.png](./light-33d-delivered.png) | [dark-33d-delivered.png](./dark-33d-delivered.png) |
| 10 Reset | [compare-10.png](./compare-10.png) | [light-10-reset.png](./light-10-reset.png) | [dark-10-reset.png](./dark-10-reset.png) |
| Reset asks first | | [light-10b-reset-confirm.png](./light-10b-reset-confirm.png) | [dark-10b-reset-confirm.png](./dark-10b-reset-confirm.png) |

The dark run is from the build before the scheduling fix below, which changed no screen.

## Differences from v1

| v1 | Now | Why |
|---|---|---|
| Edge-to-edge rows, uppercase headings | SwiftUI `Form` | D27, D28 |
| Reminders card as a popin over Goals | A sheet sized to its content, with `Not Now` | D20, D28 |
| One repeating notification per reminder | A week of one-off notifications, rescheduled | A repeating trigger cannot skip a firing too close, v1's rule |
| Rows dimmed to 0.1 when off | Dimmed to 0.4 | 0.1 reads as a rendering fault (SCREENS.md §10b) |
| Create / Remove Demo Calendar | Show / Hide Demo Data | The demo lives in memory |
| `Reset Settings & Erase All Metadata` centred | Leading, in red | SwiftUI's row; centring it is a later polish |
| Reset sends back to Welcome | Reset keeps the person in the app | Welcome is one row away |
| `unecessary`, `a identical`, `you clipboard`, `look to`, `spend this days`, `progress goals` | Corrected | Corrected strings |

## Lessons

- **Two overlapping reschedules doubled the reminders.** Each cancelled, then each scheduled
  its week: iOS held 14 for 7. Scheduling now runs one at a time; the log shows 7.
- A row near the bottom of a tab root can sit under the floating tab bar; flows centre it
  before tapping. An alert button named like the screen's title ("Reset") is tapped by
  position.
- Maestro's `launchApp` leaves notifications undetermined unless granted, so the goals flow
  now dismisses the reminders card.
