import { requireNativeModule, type EventSubscription } from 'expo'

/** See ios/LifeTimeCalendarModule.swift. Times are milliseconds since 1970. */
export type NativeCalendar = { id: string; title: string; source: string; color: string }
export type NativeEvent = {
  id: string
  calendarId: string
  title: string
  start: number
  end: number
  allDay: boolean
}

type LifeTimeCalendar = {
  getAccess(): 'granted' | 'undetermined' | 'denied'
  requestAccess(): Promise<boolean>
  listCalendars(): Promise<NativeCalendar[]>
  listEvents(calendarIds: string[], start: number, end: number): Promise<NativeEvent[]>
  addListener(event: 'onChange', listener: () => void): EventSubscription
  /** E2E builds only (LIFETIME_E2E). */
  e2eResetCalendar?(title: string): Promise<null>
  e2eCreateCalendar?(title: string): Promise<string>
  e2eCreateEvent?(
    calendarId: string,
    title: string,
    start: number,
    end: number,
    allDay: boolean,
  ): Promise<string>
}

export default requireNativeModule<LifeTimeCalendar>('LifeTimeCalendar')
