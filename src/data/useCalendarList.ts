import { useEffect, useState } from 'react'

import type { CalendarRef } from '@/domain/settings'
import type { EventSource } from './source'

/**
 * The current source's calendars, re-read whenever the source changes.
 *
 * Taking the source rather than a `granted` flag is what lets the Filters screen show real
 * rows before permission is granted: in demo mode it lists the demo calendars, so turning
 * one off and giving one a category can both be tried on the sample week.
 */
export const useCalendarList = (source: EventSource): CalendarRef[] => {
  const [calendars, setCalendars] = useState<CalendarRef[]>([])

  useEffect(() => {
    let cancelled = false
    // Clear first: the previous source's calendars are not this one's, and leaving them up
    // for a frame would show device calendars under a demo report.
    setCalendars([])
    source
      .listCalendars()
      .then((result) => {
        if (!cancelled) setCalendars(result)
      })
      .catch(() => {
        if (!cancelled) setCalendars([])
      })
    return () => {
      cancelled = true
    }
  }, [source])

  return calendars
}
