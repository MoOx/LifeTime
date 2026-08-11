/**
 * Summary — the screen the app is about.
 *
 * The structure is v1's, deliberately: a section heading with a blue action on the right,
 * the block it introduces, and a footnote under it. v1 had
 *
 *     "Weekly Chart"     · Show This Week
 *     "Top Activities"   · Customize report
 *     footnote: "Updated 3 minutes ago"
 *
 * and every one of those earns its place. The heading action is where a control that
 * changes what the section shows belongs — not floating over the bars. The footnote
 * matters because this app reads a calendar it cannot subscribe to: without a timestamp
 * there is no way to tell a quiet week from a stale read.
 *
 * The screen title is gone from this file entirely — `headerLargeTitle` draws it, so it
 * is UIKit's large title, at UIKit's size, collapsing into the bar on scroll.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarPermissions } from '@/data/calendars'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { initialWeekIndex, useReport } from '@/data/useReport'
import { calendarOfTitle, minutesByTitle } from '@/domain/aggregate'
import { explainEmptinessOverWeeks, filterEvents } from '@/domain/events'
import { formatRelative } from '@/domain/time'
import { clampToNow } from '@/domain/week'
import { EmptyState } from '@/features/summary/EmptyState'
import { PermissionSheet } from '@/features/summary/PermissionSheet'
import { TopActivities } from '@/features/summary/TopActivities'
import { WeekPager, type WeekPagerHandle } from '@/features/summary/WeekPager'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { colors } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'

export default function SummaryScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const settings = useSettings()
  const update = useUpdateSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const [permission, requestPermission] = useCalendarPermissions()
  const granted = permission?.granted ?? false

  // A single `now` for the whole render keeps every derived number consistent.
  const now = useMemo(() => Date.now(), [])
  const report = useReport(settings, weekStartsOn, now, granted)
  const pager = useRef<WeekPagerHandle>(null)

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

  /**
   * Which week to open on. Issue #19: on a Monday morning the current week is empty
   * through no fault of the user's, and an empty chart is a worse answer than last
   * week's. `initialWeekIndex` only knows that once the events have arrived, so the pager
   * is held back until they have. Once set, the user owns the page.
   */
  const [initial, setInitial] = useState<number | undefined>(undefined)
  const [index, setIndex] = useState(report.weeks.length - 1)

  /**
   * The permission sheet floats over this scroll view, so the content has to end above
   * it. Measured rather than guessed — the guess (300) left the last activity row trapped
   * underneath, which the preview showed immediately.
   */
  const [sheetHeight, setSheetHeight] = useState(0)

  useEffect(() => {
    if (report.loading || initial !== undefined) return
    const start = initialWeekIndex(visibleByWeek)
    setInitial(start)
    setIndex(start)
  }, [report.loading, initial, visibleByWeek])

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

  /**
   * Emptiness is judged over the last two weeks, not the visible one — see
   * `docs/SCREENS.md` §3.1. `undefined` while they are still loading, so the screen never
   * claims absence it has not verified.
   */
  const emptiness = useMemo(
    () => explainEmptinessOverWeeks(report.eventsByWeek.slice(-2), filter),
    [report.eventsByWeek, filter],
  )

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {})
  }, [])

  const toggleHidden = useCallback(
    () => update({ hideSkippedActivities: !settings.hideSkippedActivities }),
    [update, settings.hideSkippedActivities],
  )

  const isCurrentWeek = index >= report.weeks.length - 1
  const hasHidden = settings.skippedActivityTitles.length > 0

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + space.section + (granted ? 0 : sheetHeight + space.lg),
          },
        ]}
        // Required with a transparent large-title header: the OS insets the content
        // instead of the first row hiding underneath.
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          granted ? (
            <RefreshControl refreshing={report.loading} onRefresh={report.refresh} />
          ) : undefined
        }>
        <ListHeader
          title="Weekly chart"
          action={
            isCurrentWeek
              ? undefined
              : { label: 'This week', onPress: () => pager.current?.goToCurrentWeek() }
          }
        />

        {initial !== undefined && (
          <View style={styles.card}>
          <WeekPager
            ref={pager}
            weeks={report.weeks}
            eventsByWeek={visibleByWeek}
            rules={report.rules}
            locale={locale}
            weekStartsOn={weekStartsOn}
            now={now}
            initialIndex={initial}
            onIndexChange={setIndex}
          />
          </View>
        )}

        <ListFootnote>
          {report.isDemo
            ? 'Sample data — your own calendars will replace it as soon as you allow access.'
            : `Updated ${formatRelative(report.updatedAt, now, locale)}`}
        </ListFootnote>

        {emptiness === undefined || emptiness === 'has-events' ? (
          <>
            <ListHeader
              title="Activities"
              action={{
                label: 'Customize report',
                onPress: () => router.push('/filters'),
              }}
            />
            <TopActivities
              buckets={buckets}
              rules={report.rules}
              calendarOfTitle={titleCalendar}
            />
            {hasHidden && (
              <ListGroup style={styles.spacedGroup}>
                <ListRow
                  centeredAction
                  title={
                    settings.hideSkippedActivities
                      ? 'Reveal hidden activities'
                      : 'Mask hidden activities'
                  }
                  onPress={toggleHidden}
                />
              </ListGroup>
            )}
          </>
        ) : (
          <EmptyState reason={emptiness} onToggleHidden={toggleHidden} />
        )}
      </ScrollView>

      {!granted && (
        <PermissionSheet
          onRequest={requestPermission}
          blocked={permission !== null && !permission.granted && !permission.canAskAgain}
          onOpenSettings={openSettings}
          onHeight={setSheetHeight}
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
    // No horizontal padding: groups, headers and footnotes inset themselves, and the
    // chart card matches them.
    paddingBottom: space.section,
  },
  card: {
    marginHorizontal: space.lg,
  },
  spacedGroup: {
    marginTop: space.xl,
  },
})
