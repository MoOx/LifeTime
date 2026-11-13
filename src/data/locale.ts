/**
 * Locale facts, straight from the OS, as v2 read them (quarry/v2/src/data/locale.ts).
 *
 * v1 kept a hand-written table of country codes to decide which day the week starts on
 * (`git show main:src/Date.res`, lines 238-310). The device knows; this replaces it.
 */

import { useCalendars, useLocales } from 'expo-localization'

import type { WeekStartsOn } from '@/domain/week'

/** `expo-localization` counts Sunday as 1, `Date.getDay()` as 0. */
export const useWeekStartsOn = (): WeekStartsOn => {
  const [calendar] = useCalendars()
  const firstWeekday = calendar?.firstWeekday
  if (firstWeekday == null) return 1
  return ((firstWeekday - 1) % 7) as WeekStartsOn
}

/** BCP-47 tag for `Intl` formatting, such as `fr-FR`. */
export const useLocaleTag = (): string => {
  const [locale] = useLocales()
  return locale?.languageTag ?? 'en-US'
}
