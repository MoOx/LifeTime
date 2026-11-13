import { Button, HStack, Spacer, Text } from '@expo/ui/swift-ui'
import { accessibilityIdentifier, disabled, textCase } from '@expo/ui/swift-ui/modifiers'
import { useMemo, useRef, useState } from 'react'

import { calendarOfTitle, minutesByTitle, totalMinutes } from '@/domain/aggregate'
import { categoryOf } from '@/domain/rules'
import { formatMinutes, formatUpdated } from '@/domain/time'
import { clampToNow } from '@/domain/week'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useNow } from '@/data/now'
import { useReport } from '@/data/report'
import { useSettings } from '@/data/settings'
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

  return (
    <FormScreen testID="summary">
      <Section header={<Text modifiers={[textCase('uppercase')]}>{dateLine(now, locale)}</Text>}>
        {report.isDemo ? (
          // spec/20-sources.md, "Demo": a persistent row while the data is generated.
          // `Use my calendar` opens the permission card, which arrives with slice 4.
          <HStack>
            <Text>Demo data</Text>
            <Spacer />
            <Button
              label="Use my calendar"
              modifiers={[disabled(true), accessibilityIdentifier('use-my-calendar')]}
            />
          </HStack>
        ) : null}
      </Section>

      <Section
        title="Weekly Chart"
        action={{
          label: 'Show This Week',
          onPress: () => pager.current?.showThisWeek(),
          testID: 'show-this-week',
          hidden: index === last,
        }}
        footer={`Updated ${formatUpdated(report.updatedAt, now, locale)}`}>
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

      {/* `Customize report` opens Filters, which arrives with slice 4. */}
      <TopActivities activities={activities} />

      <Section>
        <Button
          onPress={() =>
            update((s) => ({
              ...s,
              hideSkippedActivities: !s.hideSkippedActivities,
            }))
          }
          modifiers={[accessibilityIdentifier('toggle-hidden')]}>
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
