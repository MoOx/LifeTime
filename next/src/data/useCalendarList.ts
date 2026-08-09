import { useEffect, useState } from 'react'

import { listCalendars, type DeviceCalendar } from './calendars'

/** The device's event calendars, re-read whenever permission is granted. */
export const useCalendarList = (enabled: boolean): DeviceCalendar[] => {
  const [calendars, setCalendars] = useState<DeviceCalendar[]>([])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    listCalendars()
      .then((result) => {
        if (!cancelled) setCalendars(result)
      })
      .catch(() => {
        if (!cancelled) setCalendars([])
      })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return calendars
}
