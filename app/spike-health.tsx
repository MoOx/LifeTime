import { Redirect, Stack } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Button, PlatformColor, ScrollView, StyleSheet, Text as RNText, View } from 'react-native'

import LifeTimeHealth, { type NativeHealthSample } from '../modules/lifetime-health'

import { E2E_ENABLED } from '@/data/e2e'
import { addDays, startOfDay } from '@/domain/time'

/**
 * Spike 5 (docs/spikes/05-healthkit.md): a throwaway screen, in E2E builds only, that asks
 * for Health, seeds a week into the simulator's Health, reads it back and counts the change
 * signals. Removed or replaced by slice 12.
 */

const MINUTE = 60_000
const HOUR = 60 * MINUTE

/** HKCategoryValueSleepAnalysis raw values. */
const SLEEP = { inBed: 0, asleep: 1, awake: 2, core: 3, deep: 4, rem: 5 } as const
const ASLEEP: number[] = [SLEEP.asleep, SLEEP.core, SLEEP.deep, SLEEP.rem]

/** HKWorkoutActivityType raw values used by the seed. */
const ACTIVITY: Record<number, string> = { 37: 'Running', 50: 'Strength training', 57: 'Yoga' }

/**
 * A week as an Apple Watch would record it: a night in bed with stages that overlap the
 * in-bed sample but not each other (DATA-SOURCES.md), three gym sessions, a run, and a short
 * meditation each morning.
 */
async function seedWeek(now: number) {
  const health = LifeTimeHealth
  if (!health.e2eSaveSleep || !health.e2eSaveWorkout || !health.e2eSaveMindful) return
  await health.e2eDeleteSeeded?.()
  const today = startOfDay(now)
  for (let back = 7; back >= 1; back--) {
    const night = addDays(today, -back) + 23 * HOUR
    await health.e2eSaveSleep(night, night + 8 * HOUR, SLEEP.inBed)
    const stages: [number, number][] = [
      [SLEEP.awake, 15],
      [SLEEP.core, 90],
      [SLEEP.deep, 60],
      [SLEEP.core, 90],
      [SLEEP.rem, 45],
      [SLEEP.core, 120],
      [SLEEP.rem, 45],
      [SLEEP.awake, 15],
    ]
    let at = night
    for (const [value, minutes] of stages) {
      await health.e2eSaveSleep(at, at + minutes * MINUTE, value)
      at += minutes * MINUTE
    }
    const morning = night + 8 * HOUR + 15 * MINUTE
    await health.e2eSaveMindful(morning, morning + 10 * MINUTE)
    const day = addDays(today, -back + 1)
    const weekday = new Date(day).getDay()
    if (weekday === 1 || weekday === 3 || weekday === 5) {
      await health.e2eSaveWorkout(50, day + 18 * HOUR, day + 19 * HOUR)
    }
    if (weekday === 6) await health.e2eSaveWorkout(37, day + 10 * HOUR, day + 10.75 * HOUR)
  }
  // Beyond iOS 27's "Past 30 Days" window: does the limit hide what the app wrote itself?
  const old = addDays(today, -45) + 9 * HOUR
  await health.e2eSaveWorkout(57, old, old + HOUR)
}

function minutes(samples: NativeHealthSample[]) {
  return Math.round(samples.reduce((sum, s) => sum + (s.end - s.start), 0) / MINUTE)
}

/** Text in the system label colour, so the spike reads in dark mode too. */
function Text({ style, ...props }: React.ComponentProps<typeof RNText>) {
  return <RNText style={[{ color: PlatformColor('label') }, style]} {...props} />
}

export default function SpikeHealth() {
  const [status, setStatus] = useState('…')
  const [samples, setSamples] = useState<NativeHealthSample[]>([])
  const [changes, setChanges] = useState(0)
  const [error, setError] = useState('')

  const read = useCallback(async () => {
    try {
      setStatus(await LifeTimeHealth.getRequestStatus())
      const now = Date.now()
      setSamples(
        await LifeTimeHealth.listSamples(
          addDays(startOfDay(now), -60),
          addDays(startOfDay(now), 1),
        ),
      )
    } catch (e) {
      setError(String(e))
    }
  }, [])

  useEffect(() => {
    if (!E2E_ENABLED) return
    read()
    const subscription = LifeTimeHealth.addListener('onChange', () => {
      setChanges((n) => n + 1)
      read()
    })
    return () => subscription.remove()
  }, [read])

  if (!E2E_ENABLED) return <Redirect href="/" />

  const sleep = samples.filter((s) => s.kind === 'sleep')
  const inBed = sleep.filter((s) => s.sleepValue === SLEEP.inBed)
  const asleep = sleep.filter((s) => ASLEEP.includes(s.sleepValue ?? -1))
  const workouts = samples.filter((s) => s.kind === 'workout')
  const mindful = samples.filter((s) => s.kind === 'mindful')
  const beyond30Days = samples.filter((s) => s.start < addDays(startOfDay(Date.now()), -30))

  return (
    <>
      <Stack.Screen options={{ title: 'Spike: HealthKit' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.page}>
        <Text testID="health-available">Available: {String(LifeTimeHealth.isAvailable())}</Text>
        <Text testID="health-status">Request status: {status}</Text>
        <Text testID="health-changes">Change signals: {changes}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.buttons}>
          <Button
            testID="health-request"
            title="Ask for Health"
            onPress={() =>
              LifeTimeHealth.requestAccess()
                .then(read)
                .catch((e) => setError(String(e)))
            }
          />
          <Button
            testID="health-seed"
            title="Seed a week"
            onPress={() => seedWeek(Date.now()).catch((e) => setError(String(e)))}
          />
          <Button testID="health-read" title="Read again" onPress={read} />
        </View>
        <Text testID="health-totals" style={styles.totals}>
          {`Samples: ${samples.length}\n`}
          {`In bed: ${inBed.length} nights, ${minutes(inBed)} min\n`}
          {`Asleep (stages): ${asleep.length} samples, ${minutes(asleep)} min\n`}
          {`Workouts: ${workouts.length}, ${minutes(workouts)} min\n`}
          {`Mindful: ${mindful.length}, ${minutes(mindful)} min\n`}
          {`Older than 30 days: ${beyond30Days.length}`}
        </Text>
        {workouts.map((w) => (
          <Text key={w.id} style={styles.row}>
            {new Date(w.start).toLocaleString()} {ACTIVITY[w.activityType ?? -1] ?? w.activityType}{' '}
            {Math.round((w.end - w.start) / MINUTE)} min, {w.sourceName} ({w.source})
          </Text>
        ))}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 8 },
  buttons: { alignItems: 'flex-start' },
  totals: { fontVariant: ['tabular-nums'], marginTop: 8 },
  row: { fontSize: 12, color: PlatformColor('secondaryLabel') },
  error: { color: 'red' },
})
