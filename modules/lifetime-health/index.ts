import { requireNativeModule, type EventSubscription } from 'expo'

/** See ios/LifeTimeHealthModule.swift. Times are milliseconds since 1970. */
export type NativeHealthSample = {
  id: string
  kind: 'sleep' | 'workout' | 'mindful'
  start: number
  end: number
  /** The writer's bundle identifier and name (the Health app, a watch, Strava...). */
  source: string
  sourceName: string
  /** Sleep only: HKCategoryValueSleepAnalysis (0 in bed, 1 asleep, 2 awake, 3 core, 4 deep, 5 REM). */
  sleepValue?: number
  /** Workouts only: HKWorkoutActivityType's raw value. */
  activityType?: number
}

type LifeTimeHealth = {
  isAvailable(): boolean
  getRequestStatus(): Promise<'shouldRequest' | 'unnecessary' | 'unknown'>
  requestAccess(): Promise<boolean>
  listSamples(start: number, end: number): Promise<NativeHealthSample[]>
  addListener(event: 'onChange', listener: (event: { type: string }) => void): EventSubscription
  /** E2E builds only (LIFETIME_E2E). */
  e2eDeleteSeeded?(): Promise<number>
  e2eSaveSleep?(start: number, end: number, value: number): Promise<null>
  e2eSaveMindful?(start: number, end: number): Promise<null>
  e2eSaveWorkout?(activityType: number, start: number, end: number): Promise<null>
}

export default requireNativeModule<LifeTimeHealth>('LifeTimeHealth')
