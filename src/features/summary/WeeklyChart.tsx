/**
 * Stacked bar chart: one bar per day, one segment per category.
 *
 * Deliberately built from plain views rather than a chart library — for seven stacked
 * bars that is less code than a dependency, it behaves identically on both platforms, and
 * once colours and labels come from the platform it reads as native. See
 * docs/ARCHITECTURE.md §3.6 for the SwiftUI `Chart` upgrade path.
 */

import { useMemo } from 'react'
import { StyleSheet, Text, View, useColorScheme } from 'react-native'

import { breakdownByDay, chartMaximum } from '@/domain/aggregate'
import type { Activity } from '@/domain/activities'
import { getCategory } from '@/domain/categories'
import type { TimeEvent } from '@/domain/events'
import { formatWeekdayNarrow } from '@/domain/time'
import { daysOfWeek, type Range } from '@/domain/week'
import { categoryColor, colors } from '@/ui/theme/colors'
import { FALLBACK_SIZES } from '@/ui/theme/type'

const CHART_HEIGHT = 140

export type WeeklyChartProps = {
  week: Range
  events: TimeEvent[] | undefined
  activities: Activity[]
  locale: string
}

export function WeeklyChart({ week, events, activities, locale }: WeeklyChartProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const days = useMemo(() => daysOfWeek(week), [week])

  const breakdown = useMemo(
    () => (events === undefined ? undefined : breakdownByDay(events, activities, days)),
    [events, activities, days],
  )

  const max = useMemo(
    () =>
      breakdown === undefined
        ? 0
        : chartMaximum(Math.max(0, ...breakdown.map((d) => d.totalMinutes))),
    [breakdown],
  )

  return (
    <View style={styles.container} accessibilityRole="image">
      {days.map((day, index) => {
        const dayBreakdown = breakdown?.[index]
        return (
          <View key={day} style={styles.column}>
            <View style={styles.barArea}>
              <View style={styles.bar}>
                {dayBreakdown?.byCategory.map((bucket) => {
                  const height = max > 0 ? (bucket.minutes / max) * CHART_HEIGHT : 0
                  if (height <= 0) return null
                  return (
                    <View
                      key={bucket.key}
                      style={{
                        height,
                        backgroundColor: categoryColor(
                          getCategory(bucket.key).color,
                          scheme,
                        ),
                      }}
                    />
                  )
                })}
              </View>
            </View>
            <Text style={styles.dayLabel} allowFontScaling>
              {formatWeekdayNarrow(day, locale)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  barArea: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '55%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  dayLabel: {
    ...FALLBACK_SIZES.caption,
    color: colors.tertiaryLabel,
    marginTop: 6,
  },
})
