/**
 * Daily reminders.
 *
 * v1 had a whole screen for these and v2 had reduced them to one switch
 * (`docs/SCREENS.md` §10b). Three behaviours of it are worth having, and all three are
 * decisions rather than plumbing:
 *
 *   • **Sorted by time**, so the list reads like a day rather than like an edit history
 *     (`SettingsNotifications.res:111-135`).
 *   • **Each row says when it next fires.** A reminder set for 09:00 on a screen opened at
 *     18:00 is not firing today, and the only way to know that is to be told.
 *   • **Duplicates are refused by name**, not silently merged
 *     (`SettingsNotifications.res:40-58`) — two identical reminders is always a mistake,
 *     and the right answer is to say so.
 *
 * Pure: no notification scheduling here, only the rules. Scheduling belongs with the
 * platform module.
 */

import type { Reminder } from './settings'
import { addDays, startOfDay } from './time'

/** Minutes from midnight — the natural key for a time of day. */
export const reminderMinutes = (reminder: Reminder): number =>
  reminder.hour * 60 + reminder.minute

export const sameReminder = (a: Reminder, b: Reminder): boolean =>
  a.hour === b.hour && a.minute === b.minute

export const hasReminder = (reminders: readonly Reminder[], candidate: Reminder): boolean =>
  reminders.some((reminder) => sameReminder(reminder, candidate))

export const sortReminders = (reminders: readonly Reminder[]): Reminder[] =>
  [...reminders].sort((a, b) => reminderMinutes(a) - reminderMinutes(b))

/**
 * Adding one, with the duplicate rule applied. Returns the list unchanged when the
 * reminder is already there, so the caller can tell whether anything happened.
 */
export const addReminder = (
  reminders: readonly Reminder[],
  candidate: Reminder,
): Reminder[] =>
  hasReminder(reminders, candidate) ? [...reminders] : sortReminders([...reminders, candidate])

export const removeReminder = (
  reminders: readonly Reminder[],
  target: Reminder,
): Reminder[] => reminders.filter((reminder) => !sameReminder(reminder, target))

/**
 * When this reminder next fires — today if it is still ahead, otherwise tomorrow.
 *
 * Exactly on the minute counts as *past*: a reminder for 09:00 read at 09:00:00 has just
 * gone off, and saying it is due "now" for the next 60 seconds is worse than saying
 * tomorrow.
 */
export const nextOccurrence = (reminder: Reminder, now: number): number => {
  const today = startOfDay(now) + reminderMinutes(reminder) * 60_000
  return today > now ? today : addDays(today, 1)
}

/**
 * v1 skipped a notification planned within 30 minutes of the moment it was scheduled, to
 * avoid one popping right after the app was opened (`Notifications.res:3`,
 * `minutesGapToAvoidTooCloseNotif`, footnote at `SettingsNotifications.res:240-244`). Kept
 * as a rule so the screen can explain itself. v2 had 15, with no source.
 */
export const MINIMUM_GAP_MINUTES = 30

export const firesTooSoon = (reminder: Reminder, now: number): boolean =>
  nextOccurrence(reminder, now) - now < MINIMUM_GAP_MINUTES * 60_000

/** iOS keeps at most 64 pending local notifications per app. */
export const MAX_PENDING = 64

/**
 * The instants to schedule, soonest first: each reminder's next `days` occurrences, the
 * first one moved to tomorrow when it would fire too soon (v1's rule, `firesTooSoon`).
 * One-off notifications rather than a repeating one, because a repeating trigger cannot
 * skip its first firing; rescheduled on launch and on any change (spec/50-architecture.md),
 * as v1 did on each opening (`NotificationsRegisterer.res`).
 */
export const upcomingFirings = (
  reminders: readonly Reminder[],
  now: number,
  days = 7,
): number[] =>
  reminders
    .flatMap((reminder) => {
      const next = nextOccurrence(reminder, now)
      const first = firesTooSoon(reminder, now) ? addDays(next, 1) : next
      return Array.from({ length: days }, (_, i) => addDays(first, i))
    })
    .sort((a, b) => a - b)
    .slice(0, MAX_PENDING)
