/**
 * Notifications on the web: none.
 *
 * `expo-notifications` has a web implementation, but it is push-through-a-service-worker,
 * which needs a server and a subscription — the exact thing this app promises not to have.
 * A daily local reminder in a browser tab that may not be open is not a feature that can be
 * delivered honestly, so the web build says so rather than pretending.
 *
 * This file also keeps `expo-notifications` out of the web bundle entirely, which is why
 * it re-declares the module's surface rather than importing and shimming it.
 */

import type { Reminder } from '@/domain/settings'

export const NOTIFICATIONS_AVAILABLE = false

export type PermissionState = 'granted' | 'denied' | 'undetermined'

export const ensureChannel = async (): Promise<void> => {}

export const getPermission = async (): Promise<PermissionState> => 'denied'

export const requestPermission = async (): Promise<PermissionState> => 'denied'

export const sync = async (
  _enabled: boolean,
  _reminders: readonly Reminder[],
): Promise<number> => 0

export const scheduledCount = async (): Promise<number> => 0
