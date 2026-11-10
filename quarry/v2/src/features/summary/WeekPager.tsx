/**
 * Six weeks of history, one swipe apart.
 *
 * This is the gesture Screen Time uses, and the one v1 had. The week's name, its total,
 * its chart and its daily average all travel together inside the page, so there is never
 * a moment where the caption and the bars disagree — and nothing floats over the bars.
 *
 * The way back to the current week is *not* here. v1 put it in the section heading above
 * the chart ("Show This Week", next to "Weekly Chart"), which is where a control that
 * changes what the section shows belongs. The Summary owns that heading, so it owns the
 * control; this component only reports which page is visible and exposes a way to jump.
 */

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native'

import { minutesByTitle, totalMinutes } from '@/domain/aggregate'
import type { TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import { MINUTES_PER_DAY, formatMinutes, startOfDay } from '@/domain/time'
import { clampToNow, weekLabel, type Range, type WeekStartsOn } from '@/domain/week'
import { AppText } from '@/ui/AppText'
import { colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'
import { WeekChart } from './WeekChart'

export type WeekPagerHandle = { goToCurrentWeek: () => void }

export type WeekPagerProps = {
  /** Oldest first; the last entry is the week containing `now`. */
  weeks: Range[]
  /** Same order and length as `weeks`; `undefined` where a week is still loading. */
  eventsByWeek: (TimeEvent[] | undefined)[]
  rules: RuleSet
  locale: string
  weekStartsOn: WeekStartsOn
  now: number
  /** Which page to open on. See issue #19 — not always the last one. */
  initialIndex: number
  onIndexChange?: (index: number) => void
}

export const WeekPager = forwardRef<WeekPagerHandle, WeekPagerProps>(function WeekPager(
  { weeks, eventsByWeek, rules, locale, weekStartsOn, now, initialIndex, onIndexChange },
  ref,
) {
  const [width, setWidth] = useState(0)
  const list = useRef<FlatList<Range>>(null)

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width)
  }, [])

  const onMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return
      onIndexChange?.(Math.round(event.nativeEvent.contentOffset.x / width))
    },
    [width, onIndexChange],
  )

  useImperativeHandle(
    ref,
    () => ({
      goToCurrentWeek: () => {
        const last = weeks.length - 1
        list.current?.scrollToIndex({ index: last, animated: true })
        onIndexChange?.(last)
      },
    }),
    [weeks.length, onIndexChange],
  )

  const getItemLayout = useCallback(
    (_: unknown, i: number) => ({ length: width, offset: width * i, index: i }),
    [width],
  )

  const renderItem = useCallback(
    ({ item, index: i }: { item: Range; index: number }) => (
      <View style={{ width }}>
        <WeekPage
          week={item}
          events={eventsByWeek[i]}
          rules={rules}
          locale={locale}
          weekStartsOn={weekStartsOn}
          now={now}
        />
      </View>
    ),
    [width, eventsByWeek, rules, locale, weekStartsOn, now],
  )

  return (
    <View style={styles.card} onLayout={onLayout}>
      {width > 0 && (
        <FlatList
          ref={list}
          data={weeks}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(week) => String(week.start)}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialScrollIndex={initialIndex}
          onMomentumScrollEnd={onMomentumEnd}
          // Six small pages: keeping them all mounted costs nothing and removes the
          // blank frame you otherwise get when swiping quickly.
          initialNumToRender={weeks.length}
          windowSize={weeks.length}
        />
      )}
    </View>
  )
})

type WeekPageProps = {
  week: Range
  events: TimeEvent[] | undefined
  rules: RuleSet
  locale: string
  weekStartsOn: WeekStartsOn
  now: number
}

function WeekPage({ week, events, rules, locale, weekStartsOn, now }: WeekPageProps) {
  // A past week is complete; the current one only counts up to this moment.
  const range = useMemo(() => clampToNow(week, now), [week, now])

  const total = useMemo(
    () => (events === undefined ? undefined : totalMinutes(minutesByTitle(events, range))),
    [events, range],
  )

  /**
   * Days counted for the average: elapsed days only. v1 divided by seven all week, so a
   * Tuesday average was always about two-sevenths of the truth.
   */
  const average = useMemo(() => {
    if (total === undefined) return undefined
    const elapsed = Math.min(
      7,
      Math.max(1, Math.round((startOfDay(range.end) - week.start) / 86_400_000) + 1),
    )
    return total / elapsed
  }, [total, range.end, week.start])

  return (
    <View style={styles.page}>
      <AppText role="caption" tone="tertiary">
        {weekLabel(week, now, weekStartsOn, locale).toUpperCase()}
      </AppText>
      <AppText role="metric" tabular style={styles.total}>
        {total === undefined ? ' ' : formatMinutes(total)}
      </AppText>

      <WeekChart week={week} events={events} rules={rules} locale={locale} now={now} />

      <View style={styles.average}>
        <AppText role="footnote" tone="secondary">
          Daily average
        </AppText>
        <AppText role="footnote" tone="secondary" tabular>
          {average === undefined ? ' ' : formatMinutes(Math.min(average, MINUTES_PER_DAY))}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.groupRadius,
    overflow: 'hidden',
  },
  page: {
    padding: space.lg,
  },
  total: {
    marginBottom: space.xl,
  },
  average: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
})
