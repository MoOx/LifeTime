import { Redirect, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'

import { E2E_CALENDAR, E2E_ENABLED, seed, type Scenario } from '@/data/e2e'
import { useSettings } from '@/data/settings'

/**
 * `lifetime://e2e?scenario=...&skip=calendar|activities`: seeds the simulator's calendar
 * for a Maestro flow, then shows the Summary. Does nothing outside E2E builds
 * (`src/data/e2e.ts`).
 */
export default function E2E() {
  const { scenario, skip } = useLocalSearchParams<{ scenario?: Scenario; skip?: string }>()
  const { update } = useSettings()
  const [done, setDone] = useState(!E2E_ENABLED)

  useEffect(() => {
    if (!E2E_ENABLED) return
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
            skip === 'activities' ? ['Sleep', 'Deep work', 'Lunch', 'CrossFit'] : [],
          hideSkippedActivities: true,
        }))
      })
      .finally(() => setDone(true))
  }, [scenario, skip, update])

  return done ? <Redirect href="/summary" /> : null
}
