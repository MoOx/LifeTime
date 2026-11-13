import { Button, Divider, HStack, ProgressView, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  controlSize,
  font,
  foregroundStyle,
  padding,
  textCase,
} from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'
import { useMemo, useRef, useState } from 'react'

import { calendarOfTitle, minutesByTitle, totalMinutes } from '@/domain/aggregate'
import { explainEmptinessOverWeeks } from '@/domain/events'
import { categoryOf } from '@/domain/rules'
import { formatUpdated } from '@/domain/time'
import { clampToNow } from '@/domain/week'
import { openAppSettings, useCalendarAccess } from '@/data/calendar'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useNow } from '@/data/now'
import { useReport } from '@/data/report'
import { useSettings } from '@/data/settings'
import { ACCESS_BODY, ACCESS_TITLE } from '@/features/summary/CalendarAccess'
import { EmptyState } from '@/features/summary/EmptyState'
import { TopActivities, type TopActivity } from '@/features/summary/TopActivities'
import { WeekPager, type WeekPagerHandle } from '@/features/summary/WeekPager'
import { NoticeCard } from '@/ui/Card'
import { FormScreen, Section } from '@/ui/Form'
import { DurationMetric } from '@/ui/Metric'

/** v1's line above the title, `MONDAY 9 NOVEMBER` (`Home.res:124-133`), in the device's language. */
const dateLine = (now: number, locale: string): string => {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options).format(new Date(now))
  return `${part({ weekday: 'long' })} ${part({ day: 'numeric' })} ${part({ month: 'long' })}`
}

// Summary: docs/SCREENS.md §3 and captures 12, 14, 15, 16, drawn as a SwiftUI Form (D27)
// under the native large title, notices as cards (D28). The date line becomes the first line of the content, since
// a native large title cannot hold it (spec/30-screens.md, "Headers").
export default function Summary() {
  const { settings, update } = useSettings()
  const weekStartsOn = useWeekStartsOn()
  const locale = useLocaleTag()
  const now = useNow()
  const report = useReport(settings, weekStartsOn, now)
  const access = useCalendarAccess()
  const last = report.weeks.length - 1
  const [index, setIndex] = useState(last)
  const pager = useRef<WeekPagerHandle>(null)

  const events = report.eventsByWeek[index]
  const range = clampToNow(report.weeks[index], now)
  const activities = useMemo<TopActivity[]>(
    () =>
      minutesByTitle(events, range).map((bucket) => ({
        ...bucket,
        categoryId: categoryOf(
          {
            title: bucket.key,
            calendarId: calendarOfTitle(events, bucket.key),
          },
          report.rules,
        ),
      })),
    [events, range.start, range.end, report.rules],
  )

  const toggleHidden = () =>
    update((s) => ({ ...s, hideSkippedActivities: !s.hideSkippedActivities }))

  // The empty states look at the last two weeks (`NoEventBox.res:12-74`), real data only.
  const emptiness =
    report.source === 'calendar' && !report.loading
      ? explainEmptinessOverWeeks(report.rawByWeek.slice(-2), report.filter)
      : undefined

  return (
    <FormScreen testID="summary">
      {/*
        The date line, alone: a section with nothing in it draws only its header. The
        notices follow as Health-style cards (INTENT.md D28).
      */}
      <Section header={<Text modifiers={[textCase('uppercase')]}>{dateLine(now, locale)}</Text>} />

      {report.source === 'demo' ? (
        // spec/20-sources.md, "Demo": a persistent invitation while the data is generated,
        // as Health's suggestion cards.
        <NoticeCard
          icon="calendar"
          title="Demo Data"
          body="These reports come from generated events. Use your calendar to see how your own weeks are spent. It stays on this device."
          primary={
            // `Show Demo Data` (Reset) with the calendar allowed: the way back is to hide it.
            access === 'granted'
              ? {
                  label: 'Hide Demo Data',
                  onPress: () => update((s) => ({ ...s, showDemo: false })),
                  testID: 'hide-demo',
                }
              : {
                  label: 'Use my calendar',
                  onPress: () => router.push('/calendar-access'),
                  testID: 'use-my-calendar',
                }
          }
          testID="demo-card"
        />
      ) : null}

      {report.source === 'denied' ? (
        // Access refused: the permission card, with `Open Settings` (spec/20-sources.md).
        <NoticeCard
          icon="calendar.badge.exclamationmark"
          title={ACCESS_TITLE}
          body={ACCESS_BODY.join('\n\n')}
          primary={{ label: 'Open Settings', onPress: openAppSettings, testID: 'open-settings' }}
          secondary={{
            label: 'Learn more about LifeTime & Privacy...',
            onPress: () => router.push('/privacy'),
            testID: 'access-privacy',
          }}
          testID="access-denied"
        />
      ) : null}

      {emptiness !== undefined && emptiness !== 'has-events' ? (
        <EmptyState reason={emptiness} onToggleHidden={toggleHidden} />
      ) : null}

      {/*
        Health's "This Week" card (INTENT.md D28): the figure first, numbers large and units
        small, then the chart. v1 put `Total Logged Time` in a row under the chart.
      */}
      <Section
        title="Weekly Chart"
        prominent
        action={{
          label: 'Show This Week',
          onPress: () => pager.current?.showThisWeek(),
          testID: 'show-this-week',
          hidden: index === last,
        }}
        footer={
          // v1's small indicator beside `Updated` while the calendar is read (`Home.res:271-275`).
          <HStack spacing={6}>
            <Text>{`Updated ${formatUpdated(report.updatedAt, now, locale)}`}</Text>
            {report.loading ? <ProgressView modifiers={[controlSize('mini')]} /> : null}
          </HStack>
        }>
        <VStack alignment="leading" spacing={12} modifiers={[padding({ vertical: 4 })]}>
          <VStack alignment="leading" spacing={0}>
            <Text
              modifiers={[
                font({ textStyle: 'footnote', weight: 'semibold' }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}>
              Total Logged Time
            </Text>
            <DurationMetric minutes={totalMinutes(activities)} testID="total" />
          </VStack>
          <Divider />
          <WeekPager
            ref={pager}
            weeks={report.weeks}
            eventsByWeek={report.eventsByWeek}
            rules={report.rules}
            locale={locale}
            now={now}
            weekStartsOn={weekStartsOn}
            onIndexChange={setIndex}
          />
        </VStack>
      </Section>

      <TopActivities
        activities={activities}
        weekStart={report.weeks[index].start}
        onCustomize={() => router.push('/filters')}
      />

      <Section>
        <Button onPress={toggleHidden} modifiers={[accessibilityIdentifier('toggle-hidden')]}>
          <HStack>
            <Spacer />
            <Text>
              {settings.hideSkippedActivities
                ? 'Reveal Hidden Activities'
                : 'Mask Hidden Activities'}
            </Text>
            <Spacer />
          </HStack>
        </Button>
      </Section>
    </FormScreen>
  )
}
