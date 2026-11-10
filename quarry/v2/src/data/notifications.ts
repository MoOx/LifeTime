/**
 * The only file that talks to `expo-notifications`.
 *
 * Until now the Reminders screen (`app/reminders.tsx`) stored times that nothing ever
 * read: `expo-notifications` was named in `docs/ARCHITECTURE.md` but was not even a
 * dependency. The screen listed reminders, told you when each would next fire, and refused
 * duplicates — a complete, convincing interface to a feature that did not exist. That is
 * worse than an unbuilt screen, because nothing about it looks unfinished.
 *
 * So: one place that owns the schedule, and a single `sync` that makes the OS agree with
 * the settings. Rescheduling everything on every change rather than diffing is deliberate
 * — a handful of daily notifications is nothing to cancel and re-add, and a diff is where
 * the duplicate-notification bugs live.
 *
 * v1 computed the next fire date itself (`Notifications.res:3-56`) and re-registered on a
 * timer, because `react-native-push-notification` had no repeating daily trigger it could
 * trust. `expo-notifications` has `DAILY` with an hour and minute, so the whole
 * appropriate-time calculation goes away and the OS owns the clock. `nextOccurrence` in
 * `domain/reminders.ts` survives only to *display* when the next one lands.
 */

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import type { Reminder } from '@/domain/settings'

/** Android needs a channel before anything can be posted to it. */
const CHANNEL_ID = 'daily-reminders'

export const NOTIFICATIONS_AVAILABLE =
  Platform.OS === 'ios' || Platform.OS === 'android'

/**
 * What the nudge says. Deliberately not a progress report: computing one would mean
 * reading the calendar from a background task, which is exactly the kind of thing this app
 * promises not to do. It asks a question the user answers in their calendar app.
 */
const CONTENT: Notifications.NotificationContentInput = {
  title: 'What did you do today?',
  body: 'Write it in your calendar while you still remember — LifeTime will count it.',
  sound: false,
}

export const ensureChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
  })
}

export type PermissionState = 'granted' | 'denied' | 'undetermined'

export const getPermission = async (): Promise<PermissionState> => {
  if (!NOTIFICATIONS_AVAILABLE) return 'denied'
  const { status, canAskAgain } = await Notifications.getPermissionsAsync()
  if (status === 'granted') return 'granted'
  // "Denied but we may still ask" is `undetermined` as far as the UI is concerned: the
  // difference that matters is whether a button can do anything, not the OS's bookkeeping.
  return status === 'denied' && !canAskAgain ? 'denied' : 'undetermined'
}

export const requestPermission = async (): Promise<PermissionState> => {
  if (!NOTIFICATIONS_AVAILABLE) return 'denied'
  const { status, canAskAgain } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: false },
  })
  if (status === 'granted') return 'granted'
  return canAskAgain ? 'undetermined' : 'denied'
}

/**
 * Make the OS's schedule match the settings, and return what is now scheduled.
 *
 * Called on every change and on launch. Turning reminders off, or losing permission,
 * cancels everything — a notification arriving after the switch was turned off is the
 * single worst bug this feature can have.
 */
export const sync = async (
  enabled: boolean,
  reminders: readonly Reminder[],
): Promise<number> => {
  if (!NOTIFICATIONS_AVAILABLE) return 0

  await Notifications.cancelAllScheduledNotificationsAsync()
  if (!enabled || reminders.length === 0) return 0

  const permission = await getPermission()
  if (permission !== 'granted') return 0

  await ensureChannel()

  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: CONTENT,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
        channelId: CHANNEL_ID,
      },
    })
  }

  return reminders.length
}

/** What the OS actually has queued — the honest answer for the screen to display. */
export const scheduledCount = async (): Promise<number> => {
  if (!NOTIFICATIONS_AVAILABLE) return 0
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  return scheduled.length
}
