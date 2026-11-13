import { Redirect, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'

import { E2E_CALENDAR, E2E_ENABLED, seed, WEEK_TITLES, type Scenario } from '@/data/e2e'
import { refreshNotificationAccess, scheduleE2EReminder } from '@/data/notifications'
import { useSettings } from '@/data/settings'

/**
 * `lifetime://e2e?scenario=...&skip=calendar|activities`: seeds the simulator's calendar
 * (or, with `notify=soon`, schedules one reminder a minute ahead)
 * for a Maestro flow, then shows the Summary. Does nothing outside E2E builds
 * (`src/data/e2e.ts`).
 */
export default function E2E() {
  const { scenario, skip, notify } = useLocalSearchParams<{
    scenario?: Scenario
    skip?: string
    notify?: string
  }>()
  const { update } = useSettings()
  const [done, setDone] = useState(!E2E_ENABLED)

  useEffect(() => {
    if (!E2E_ENABLED) return
    // `notify=soon`: one reminder a minute from now, nothing else (slice 7).
    if (notify === 'soon') {
      refreshNotificationAccess()
        .then(() => scheduleE2EReminder(60))
        .finally(() => setDone(true))
      return
    }
    seed(scenario ?? 'week')
      .then((calendarId) => {
        update((settings) => ({
          ...settings,
          onboarded: true,
          skippedCalendars:
            skip === 'calendar' && calendarId
              ? [{ id: calendarId, title: E2E_CALENDAR, source: '', color: '#5856D6' }]
              : [],
          skippedActivityTitles:
            skip === 'activities' ? WEEK_TITLES : [],
          hideSkippedActivities: true,
        }))
      })
      .finally(() => setDone(true))
  }, [scenario, skip, notify, update])

  return done ? <Redirect href="/summary" /> : null
}
