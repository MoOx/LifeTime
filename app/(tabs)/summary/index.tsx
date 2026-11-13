import { Button, HStack, ProgressView, Spacer, Text } from '@expo/ui/swift-ui'
import { accessibilityIdentifier, controlSize, textCase } from '@expo/ui/swift-ui/modifiers'
import { router } from 'expo-router'
import { useMemo, useRef, useState } from 'react'

import { calendarOfTitle, minutesByTitle, totalMinutes } from '@/domain/aggregate'
import { explainEmptinessOverWeeks } from '@/domain/events'
import { categoryOf } from '@/domain/rules'
import { formatMinutes, formatUpdated } from '@/domain/time'
import { clampToNow } from '@/domain/week'
import { openAppSettings } from '@/data/calendar'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useNow } from '@/data/now'
import { useReport } from '@/data/report'
import { useSettings } from '@/data/settings'
import {
  ACCESS_BODY,
  ACCESS_TITLE,
  PrivacyLink,
  ProminentButton,
} from '@/features/summary/CalendarAccess'
import { EmptyState } from '@/features/summary/EmptyState'
import { TopActivities, type TopActivity } from '@/features/summary/TopActivities'
import { WeekPager, type WeekPagerHandle } from '@/features/summary/WeekPager'
import { FormScreen, Row, Section } from '@/ui/Form'

/** v1's line above the title, `MONDAY 9 NOVEMBER` (`Home.res:124-133`), in the device's language. */
const dateLine = (now: number, locale: string): string => {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options).format(new Date(now))
  return `${part({ weekday: 'long' })} ${part({ day: 'numeric' })} ${part({ month: 'long' })}`
}

// Summary: docs/SCREENS.md §3 and captures 12, 14, 15, 16, drawn as a SwiftUI Form (D27)
// under the native large title. The date line becomes the first line of the content, since
// a native large title cannot hold it (spec/30-screens.md, "Headers").
export default function Summary() {
  const { settings, update } = useSettings()
  const weekStartsOn = useWeekStartsOn()
  const locale = useLocaleTag()
  const now = useNow()
  const report = useReport(settings, weekStartsOn, now)
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
      <Section header={<Text modifiers={[textCase('uppercase')]}>{dateLine(now, locale)}</Text>}>
        {report.source === 'demo' ? (
          // spec/20-sources.md, "Demo": a persistent row while the data is generated.
          <HStack>
            <Text>Demo data</Text>
            <Spacer />
            <Button
              label="Use my calendar"
              onPress={() => router.push('/calendar-access')}
              modifiers={[accessibilityIdentifier('use-my-calendar')]}
            />
          </HStack>
        ) : null}
      </Section>

      {report.source === 'denied' ? (
        // Access refused: the permission card, with `Open Settings` (spec/20-sources.md).
        <Section title={ACCESS_TITLE}>
          {ACCESS_BODY.map((paragraph) => (
            <Text key={paragraph}>{paragraph}</Text>
          ))}
          <PrivacyLink />
          <ProminentButton label="Open Settings" onPress={openAppSettings} testID="open-settings" />
        </Section>
      ) : null}

      {emptiness !== undefined && emptiness !== 'has-events' ? (
        <EmptyState reason={emptiness} onToggleHidden={toggleHidden} />
      ) : null}

      <Section
        title="Weekly Chart"
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
        <Row
          title="Total Logged Time"
          value={formatMinutes(totalMinutes(activities))}
          testID="total"
        />
      </Section>

      <TopActivities activities={activities} onCustomize={() => router.push('/filters')} />

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
