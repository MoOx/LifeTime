/**
 * Six weeks of history, one swipe apart.
 *
 * This is the gesture Screen Time uses, and the one v1 had: the chart is a horizontal
 * pager, and the numbers above it belong to the page you are looking at. Nothing floats
 * over the bars — the week's name, its total and the chart all travel together, so there
 * is never a moment where the caption and the bars disagree.
 *
 * The only fixed element is the way back to the current week, and it appears solely when
 * you have left it.
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'

import { minutesByTitle, totalMinutes } from '@/domain/aggregate'
import type { TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import { formatMinutes } from '@/domain/time'
import { clampToNow, weekLabel, type Range, type WeekStartsOn } from '@/domain/week'
import { AppText } from '@/ui/AppText'
import { Symbol } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'
import { WeekChart } from './WeekChart'

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

export function WeekPager({
  weeks,
  eventsByWeek,
  rules,
  locale,
  weekStartsOn,
  now,
  initialIndex,
  onIndexChange,
}: WeekPagerProps) {
  const [width, setWidth] = useState(0)
  const [index, setIndex] = useState(initialIndex)
  const list = useRef<FlatList<Range>>(null)

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width)
  }, [])

  const onMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width <= 0) return
      const next = Math.round(event.nativeEvent.contentOffset.x / width)
      setIndex(next)
      onIndexChange?.(next)
    },
    [width, onIndexChange],
  )

  const goToCurrentWeek = useCallback(() => {
    const last = weeks.length - 1
    list.current?.scrollToIndex({ index: last, animated: true })
    setIndex(last)
    onIndexChange?.(last)
  }, [weeks.length, onIndexChange])

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

  const isCurrentWeek = index >= weeks.length - 1

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

      {!isCurrentWeek && (
        <Pressable
          onPress={goToCurrentWeek}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to this week"
          style={styles.backToNow}>
          <Symbol name="today" size={13} color={colors.accent} />
          <AppText role="button" tone="accent">
            This week
          </AppText>
        </Pressable>
      )}
    </View>
  )
}

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

  return (
    <View style={styles.page}>
      <AppText role="caption" tone="tertiary">
        {weekLabel(week, now, weekStartsOn, locale).toUpperCase()}
      </AppText>
      <AppText role="metric" tabular style={styles.total}>
        {total === undefined ? ' ' : formatMinutes(total)}
      </AppText>
      <WeekChart week={week} events={events} rules={rules} locale={locale} now={now} />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  page: {
    padding: 16,
  },
  total: {
    marginBottom: 20,
  },
  backToNow: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
})
