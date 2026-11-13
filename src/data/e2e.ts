/**
 * Calendar seeding for Maestro, in E2E builds only (`EXPO_PUBLIC_E2E=1` when the app is
 * built and `pod install` runs).
 *
 * The app never writes to a calendar (spec/20-sources.md). The empty states and the
 * "always up to date" check need known calendar contents on the simulator, as v1's Detox
 * flow had with its demo calendar (spec/20-sources.md, "Fake it"), so the `/e2e` route
 * seeds one dedicated calendar through write functions that the native module only
 * compiles into E2E builds (`modules/lifetime-calendar/ios/LifeTimeCalendar.podspec`). In
 * any other build they do not exist and `E2E_ENABLED` is false.
 */

import LifeTimeCalendar from '../../modules/lifetime-calendar'

import { addDays, startOfDay } from '@/domain/time'

export const E2E_ENABLED = process.env.EXPO_PUBLIC_E2E === '1'

export const E2E_CALENDAR = 'LifeTime E2E'

export type Scenario = 'empty' | 'week' | 'all-day' | 'late-event'

const minuteMs = 60_000
const at = (day: number, hour: number, minute = 0) => day + (hour * 60 + minute) * minuteMs

const writes = () => {
  const { e2eResetCalendar, e2eCreateCalendar, e2eCreateEvent } = LifeTimeCalendar
  if (!e2eResetCalendar || !e2eCreateCalendar || !e2eCreateEvent) {
    throw new Error('Not an E2E build: the calendar write functions are not compiled in')
  }
  return { reset: e2eResetCalendar, create: e2eCreateCalendar, event: e2eCreateEvent }
}

/** Two weeks of a plausible routine, ending now. */
const seedWeek = async (calendarId: string, now: number) => {
  const { event } = writes()
  const slots: [string, number, number, number, number][] = [
    ['Sleep', 0, 0, 7, 0],
    ['Deep work', 9, 0, 12, 0],
    ['Lunch', 12, 30, 13, 15],
    ['CrossFit', 18, 0, 19, 0],
    // Two titles sharing a start, for the Match row's blast radius (slice 5).
    ['Gym', 7, 15, 8, 0],
    ['Gym legs', 19, 30, 20, 15],
  ]
  for (let back = 13; back >= 0; back--) {
    const day = startOfDay(addDays(now, -back))
    for (const [title, h1, m1, h2, m2] of slots) {
      const end = at(day, h2, m2)
      if (end > now) continue
      await event(calendarId, title, at(day, h1, m1), end, false)
    }
  }
}

const seedAllDay = async (calendarId: string, now: number) => {
  const { event } = writes()
  for (let back = 13; back >= 0; back -= 3) {
    const day = startOfDay(addDays(now, -back))
    await event(calendarId, 'Holiday', day, addDays(day, 1) - 1, true)
  }
}

/** Seeds the scenario and returns the E2E calendar's id, if one remains. */
export const seed = async (scenario: Scenario, now = Date.now()): Promise<string | undefined> => {
  if (!E2E_ENABLED) return undefined
  const { reset, create, event } = writes()
  if (scenario === 'late-event') {
    // One more event, ending five minutes ago, in the existing calendar.
    const calendar = (await LifeTimeCalendar.listCalendars()).find((c) => c.title === E2E_CALENDAR)
    if (calendar === undefined) return undefined
    await event(calendar.id, 'Late addition', now - 60 * minuteMs, now - 5 * minuteMs, false)
    return calendar.id
  }
  await reset(E2E_CALENDAR)
  if (scenario === 'empty') return undefined
  const calendarId = await create(E2E_CALENDAR)
  if (scenario === 'week') await seedWeek(calendarId, now)
  if (scenario === 'all-day') await seedAllDay(calendarId, now)
  return calendarId
}
