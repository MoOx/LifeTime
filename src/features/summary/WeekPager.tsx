/**
 * Six weeks of charts, one swipe apart, opening on the current week (v1: `Home.res`
 * lines 200-238, a paged horizontal `ScrollView` scrolled to its end on mount).
 *
 * The pager is SwiftUI's own page-style `TabView`, one week per swipe as v1's paged
 * `UIScrollView`, each page holding the React Native chart through `RNHostView`. Two other
 * pagers failed (docs/slices/2/README.md, "Lessons"): a React Native horizontal
 * `ScrollView` inside the SwiftUI `Form` never received the swipe, and a SwiftUI
 * `ScrollView` with `.paging` let a fling skip weeks.
 *
 * The caption travels with its page, so it never disagrees with the bars mid-swipe; v1 kept
 * it above the pager and swapped it at the end of the swipe. Its strings are v1's.
 */

import { RNHostView, TabView, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  foregroundStyle,
  frame,
  lineLimit,
  tabViewStyle,
} from '@expo/ui/swift-ui/modifiers'
import { forwardRef, memo, useImperativeHandle, useState } from 'react'

import type { TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import { addDays } from '@/domain/time'
import { weeksAgo, type Range, type WeekStartsOn } from '@/domain/week'
import { useAccessibilityTextSize, useTextScale } from '@/ui/textSize'

import { chartHeight, LABEL_SCALE_LIMIT, WeekChart } from './WeekChart'

export type WeekPagerHandle = { showThisWeek: () => void }

/** `Home.res:186-198`: "Daily Average", "Last Week's Average", "4 - 10 Aug Average". */
export const weekCaption = (
  week: Range,
  now: number,
  weekStartsOn: WeekStartsOn,
  locale: string,
): string => {
  const ago = weeksAgo(week, now, weekStartsOn)
  if (ago === 0) return 'Daily Average'
  if (ago === 1) return "Last Week's Average"
  const last = addDays(week.start, 6)
  const month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(last))
  return `${new Date(week.start).getDate()} - ${new Date(last).getDate()} ${month} Average`
}

const pageId = (week: Range) => String(week.start)

/**
 * Caption, 12 pt gap, then the chart's 140 pt plot and 16 pt day letters
 * (`WeeklyGraph.res:8-9`). The caption follows the text size, on two lines at the
 * accessibility sizes, and the letters up to the chart's limit (slice 9): a fixed 190 pt cut
 * the letters off.
 */
const CAPTION_LINE = 22
const pagerHeight = (textScale: number, captionLines: number) =>
  CAPTION_LINE * textScale * captionLines + 12 + chartHeight(Math.min(textScale, LABEL_SCALE_LIMIT))

/**
 * Memoised: the Summary re-renders whenever the visible week changes, and the pager has no
 * reason to follow.
 */
export const WeekPager = memo(
  forwardRef<
    WeekPagerHandle,
    {
      weeks: Range[]
      eventsByWeek: TimeEvent[][]
      rules: RuleSet
      locale: string
      now: number
      weekStartsOn: WeekStartsOn
      onIndexChange: (index: number) => void
    }
  >(function WeekPager(
    { weeks, eventsByWeek, rules, locale, now, weekStartsOn, onIndexChange },
    ref,
  ) {
    const last = weeks.length - 1
    const textScale = useTextScale()
    const captionLines = useAccessibilityTextSize() ? 2 : 1
    const [selection, setSelection] = useState(pageId(weeks[last]))

    useImperativeHandle(ref, () => ({
      showThisWeek: () => {
        setSelection(pageId(weeks[last]))
        onIndexChange(last)
      },
    }))

    return (
      <TabView
        selection={selection}
        onSelectionChange={(page) => {
          setSelection(page)
          const index = weeks.findIndex((week) => pageId(week) === page)
          if (index !== -1) onIndexChange(index)
        }}
        modifiers={[
          tabViewStyle({ type: 'page', indexDisplayMode: 'never' }),
          // A page-style TabView does not size to its content: caption, plot and day letters.
          frame({ height: pagerHeight(textScale, captionLines) }),
          accessibilityIdentifier('week-pager'),
        ]}>
        {weeks.map((week, index) => (
          <TabView.Tab key={week.start} value={pageId(week)}>
            <VStack alignment="leading" spacing={12}>
              <Text
                modifiers={[
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                  lineLimit(captionLines),
                ]}>
                {weekCaption(week, now, weekStartsOn, locale)}
              </Text>
              <RNHostView matchContents={{ vertical: true }}>
                <WeekChart week={week} events={eventsByWeek[index]} rules={rules} locale={locale} />
              </RNHostView>
            </VStack>
          </TabView.Tab>
        ))}
      </TabView>
    )
  }),
)
