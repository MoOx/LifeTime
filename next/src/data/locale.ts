/**
 * Locale facts, straight from the OS.
 *
 * v1 shipped a hand-maintained table of ~70 country codes to decide which day the week
 * starts on (`src/Date.res:238-250`) and hardcoded English day/month names. The device
 * already knows both; this file is the whole replacement.
 */

import { useCalendars, useLocales } from 'expo-localization'

import type { WeekStartsOn } from '@/domain/week'

/**
 * `expo-localization` reports `firstWeekday` with Sunday = 1, while `Date.getDay()` uses
 * Sunday = 0.
 */
export const useWeekStartsOn = (): WeekStartsOn => {
  const [calendar] = useCalendars()
  const firstWeekday = calendar?.firstWeekday
  if (firstWeekday == null) return 1
  return ((firstWeekday - 1) % 7) as WeekStartsOn
}

/** BCP-47 tag for `Intl` formatting, e.g. `fr-FR`. */
export const useLocaleTag = (): string => {
  const [locale] = useLocales()
  return locale?.languageTag ?? 'en-US'
}
