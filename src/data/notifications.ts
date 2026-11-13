/**
 * Daily reminders, really scheduled (SCREENS.md §10b, spec/50-architecture.md): local
 * notifications through `expo-notifications`, rescheduled on launch, on return to the
 * foreground and on any change, as v1 did on each opening (`NotificationsRegisterer.res` on
 * `main`). Nothing leaves the device.
 *
 * The permission is asked only when the user asks for reminders (D20): from the reminders
 * card after the first goal, or the `Allow Notifications` switch.
 */

import * as Notifications from 'expo-notifications'
import { useEffect, useSyncExternalStore } from 'react'
import { AppState, Linking } from 'react-native'

import { upcomingFirings } from '@/domain/reminders'
import type { Settings } from '@/domain/settings'
import { E2E_ENABLED } from '@/data/e2e'

/**
 * v1's phrases (`NotificationsRegisterer.res:4-17`), one per notification, in turn.
 * Corrected: "look to", "spend this days".
 */
export const REMINDER_PHRASES = [
  'What about checking how your time is being spent?',
  'What about taking a look at your progress?',
  'What about taking a look at your goals and summary?',
  'What about checking your rings?',
  'What about checking your progress?',
  'Want to know how your time is being spent?',
  'Want to know if you are doing good with your goals?',
  'How are your goals rings?',
  'How is your progress today?',
  'How is your time being spent these days?',
  'If you have some time, try to check your progress',
  'If you have some time, try to check your goals',
]

export type NotificationAccess = 'undetermined' | 'granted' | 'denied'

const toAccess = (status: Notifications.NotificationPermissionsStatus): NotificationAccess =>
  status.granted ? 'granted' : status.canAskAgain ? 'undetermined' : 'denied'

let access: NotificationAccess = 'undetermined'
const listeners = new Set<() => void>()
const setAccess = (next: NotificationAccess) => {
  if (next === access) return
  access = next
  for (const listener of listeners) listener()
}

export const refreshNotificationAccess = async (): Promise<NotificationAccess> => {
  setAccess(toAccess(await Notifications.getPermissionsAsync()))
  return access
}

/** Shows iOS's prompt if it has not been answered. Alerts and sounds, no badge. */
export const requestNotificationAccess = async (): Promise<NotificationAccess> => {
  setAccess(
    toAccess(
      await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      }),
    ),
  )
  return access
}

export const useNotificationAccess = (): NotificationAccess => {
  useEffect(() => {
    refreshNotificationAccess()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshNotificationAccess()
    })
    return () => subscription.remove()
  }, [])
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => access,
  )
}

const content = (at: number): Notifications.NotificationContentInput => ({
  title: '',
  // A different phrase each day, as v1 shuffled them.
  body: REMINDER_PHRASES[Math.floor(at / 86_400_000) % REMINDER_PHRASES.length],
})

const replaceSchedule = async (settings: Settings, now: number) => {
  await Notifications.cancelAllScheduledNotificationsAsync()
  if (!settings.remindersEnabled || access !== 'granted') return
  for (const at of upcomingFirings(settings.reminders, now)) {
    await Notifications.scheduleNotificationAsync({
      content: content(at),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    })
  }
}

let queue: Promise<void> = Promise.resolve()

/**
 * Replaces whatever was scheduled with what the settings ask for now. One run at a time: two
 * overlapping runs each cancelled, then each scheduled its week, and iOS held 14 reminders
 * for 7 (docs/slices/7/README.md).
 */
export const scheduleReminders = (settings: Settings, now = Date.now()): Promise<void> =>
  (queue = queue.then(() => replaceSchedule(settings, now)).catch(() => {}))

/** Keeps the schedule in step with the settings and the permission. Mounted once, at the root. */
export const useReminderSchedule = (settings: Settings) => {
  const current = useNotificationAccess()
  useEffect(() => {
    scheduleReminders(settings).catch(() => {})
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') scheduleReminders(settings).catch(() => {})
    })
    return () => subscription.remove()
    // The schedule depends on these only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.reminders, settings.remindersEnabled, current])
}

/**
 * E2E builds only: one reminder a minute from now, through the same content, so a flow can
 * see one delivered without waiting for 9:00. It skips the 30-minute rule on purpose.
 */
export const scheduleE2EReminder = async (seconds = 60) => {
  if (!E2E_ENABLED || access !== 'granted') return
  const at = Date.now() + seconds * 1000
  await Notifications.scheduleNotificationAsync({
    content: content(at),
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
  })
}

export const openNotificationSettings = () => Linking.openSettings().catch(() => {})
