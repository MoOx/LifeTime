/**
 * Summary — the main screen.
 *
 * Parity target: v1's `HomeScreen` + `Home` (docs/SPEC.md §4.2). Present here: the
 * permission gate, the current week's chart, total logged time and top activities.
 * Still to port: the six-week paged carousel and the contextual empty states.
 */

import { useMemo } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarPermissions } from '@/data/calendars'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useSettings } from '@/data/settingsStore'
import { useEventRanges } from '@/data/useEvents'
import { useCalendarList } from '@/data/useCalendarList'
import { minutesByTitle, totalMinutes } from '@/domain/aggregate'
import { filterEvents } from '@/domain/events'
import { formatDayMonth, formatMinutes } from '@/domain/time'
import { clampToNow, weekRange } from '@/domain/week'
import { TopActivities } from '@/features/summary/TopActivities'
import { WeeklyChart } from '@/features/summary/WeeklyChart'
import { AppText } from '@/ui/AppText'
import { Section } from '@/ui/Section'
import { colors } from '@/ui/theme/colors'
import { CalendarPermissionGate } from '@/features/summary/CalendarPermissionGate'

export default function SummaryScreen() {
  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const [permission, requestPermission] = useCalendarPermissions()
  const calendars = useCalendarList(permission?.granted ?? false)

  // A single `now` for the whole render keeps every derived number consistent.
  const now = useMemo(() => Date.now(), [])
  const week = useMemo(() => weekRange(now, weekStartsOn), [now, weekStartsOn])
  const visibleRange = useMemo(() => clampToNow(week, now), [week, now])
  const ranges = useMemo(() => [visibleRange], [visibleRange])

  const activeCalendarIds = useMemo(
    () =>
      calendars
        .map((c) => c.id)
        .filter((id) => !settings.skippedCalendars.some((s) => s.id === id)),
    [calendars, settings.skippedCalendars],
  )

  const { byRange, loading, refresh } = useEventRanges(activeCalendarIds, ranges)
  const rawEvents = byRange[0]

  const events = useMemo(
    () =>
      rawEvents === undefined
        ? undefined
        : filterEvents(rawEvents, {
            skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
            skippedActivityTitles: settings.skippedActivityTitles,
            hideSkippedActivities: settings.hideSkippedActivities,
          }),
    [rawEvents, settings],
  )

  const buckets = useMemo(
    () => (events === undefined ? [] : minutesByTitle(events, visibleRange)),
    [events, visibleRange],
  )

  if (!permission?.granted) {
    return <CalendarPermissionGate onRequest={requestPermission} />
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
      <Section style={styles.header}>
        <AppText role="caption" tone="tertiary">
          {formatDayMonth(now, locale).toUpperCase()}
        </AppText>
        <AppText role="screenTitle">Your LifeTime</AppText>
      </Section>

      <View style={styles.card}>
        <Section>
          <AppText role="sectionTitle">This week</AppText>
        </Section>
        <WeeklyChart
          week={week}
          events={events}
          activities={settings.activities}
          locale={locale}
        />
        <Section>
          <AppText role="secondary" tone="secondary">
            {`Total logged — ${formatMinutes(totalMinutes(buckets))}`}
          </AppText>
        </Section>
      </View>

      <Section style={styles.blockHeading}>
        <AppText role="sectionTitle">Top activities</AppText>
      </Section>
      <TopActivities buckets={buckets} activities={settings.activities} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  header: {
    gap: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  blockHeading: {
    paddingHorizontal: 4,
  },
})
