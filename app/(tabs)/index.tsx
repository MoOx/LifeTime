/**
 * Summary — the screen the app is about.
 *
 * Parity target: v1's `HomeScreen` + `Home` (docs/SPEC.md §4.2), with the three things
 * v1 did well kept intact — the six-week swipe, the grid behind the bars, and the four
 * contextual empty states — and the permission request moved from *before* the screen to
 * *over* it.
 */

import { useCallback, useMemo, useState } from 'react'
import { Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarPermissions } from '@/data/calendars'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useSettings } from '@/data/settingsStore'
import { initialWeekIndex, rulesOf, useReport } from '@/data/useReport'
import { calendarOfTitle, minutesByTitle } from '@/domain/aggregate'
import { explainEmptiness, filterEvents } from '@/domain/events'
import { formatDayMonth } from '@/domain/time'
import { clampToNow } from '@/domain/week'
import { EmptyState } from '@/features/summary/EmptyState'
import { PermissionSheet } from '@/features/summary/PermissionSheet'
import { TopActivities } from '@/features/summary/TopActivities'
import { WeekPager } from '@/features/summary/WeekPager'
import { AppText } from '@/ui/AppText'
import { colors } from '@/ui/theme/colors'

export default function SummaryScreen() {
  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const [permission, requestPermission] = useCalendarPermissions()
  const granted = permission?.granted ?? false

  // A single `now` for the whole render keeps every derived number consistent.
  const now = useMemo(() => Date.now(), [])
  const rules = useMemo(() => rulesOf(settings), [settings])
  const report = useReport(settings, weekStartsOn, now, granted)

  const filter = useMemo(
    () => ({
      skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
      skippedActivityTitles: settings.skippedActivityTitles,
      hideSkippedActivities: settings.hideSkippedActivities,
    }),
    [settings],
  )

  const visibleByWeek = useMemo(
    () =>
      report.eventsByWeek.map((events) =>
        events === undefined ? undefined : filterEvents(events, filter),
      ),
    [report.eventsByWeek, filter],
  )

  const [index, setIndex] = useState(() => initialWeekIndex(visibleByWeek))

  const week = report.weeks[index] ?? report.weeks[report.weeks.length - 1]!
  const rawEvents = report.eventsByWeek[index]
  const events = visibleByWeek[index]
  const range = useMemo(() => clampToNow(week, now), [week, now])

  const buckets = useMemo(
    () => (events === undefined ? [] : minutesByTitle(events, range)),
    [events, range],
  )

  const titleCalendar = useCallback(
    (title: string) => calendarOfTitle(events ?? [], title),
    [events],
  )

  const emptiness = useMemo(
    () => (rawEvents === undefined ? 'has-events' : explainEmptiness(rawEvents, filter)),
    [rawEvents, filter],
  )

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {})
  }, [])

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          // Room for the permission sheet, so the last row is never trapped behind it.
          { paddingBottom: insets.bottom + (granted ? 32 : 300) },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          granted ? (
            <RefreshControl refreshing={report.loading} onRefresh={report.refresh} />
          ) : undefined
        }>
        <View style={styles.header}>
          <AppText role="caption" tone="tertiary">
            {formatDayMonth(now, locale).toUpperCase()}
          </AppText>
          <AppText role="screenTitle">Your LifeTime</AppText>
        </View>

        <WeekPager
          weeks={report.weeks}
          eventsByWeek={visibleByWeek}
          rules={rules}
          locale={locale}
          weekStartsOn={weekStartsOn}
          now={now}
          initialIndex={index}
          onIndexChange={setIndex}
        />

        {emptiness === 'has-events' ? (
          <>
            <View style={styles.blockHeading}>
              <AppText role="sectionTitle">Activities</AppText>
            </View>
            <TopActivities
              buckets={buckets}
              rules={rules}
              calendarOfTitle={titleCalendar}
            />
          </>
        ) : (
          <EmptyState reason={emptiness} />
        )}
      </ScrollView>

      {!granted && (
        <PermissionSheet
          onRequest={requestPermission}
          blocked={permission !== null && !permission.granted && !permission.canAskAgain}
          onOpenSettings={openSettings}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  header: {
    gap: 2,
    paddingHorizontal: 2,
  },
  blockHeading: {
    paddingHorizontal: 2,
    paddingTop: 4,
  },
})
