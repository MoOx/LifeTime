/**
 * One week: a stacked bar per day, on a grid.
 *
 * Built from plain views rather than a charting library. Seven stacked bars is less code
 * than a dependency, it behaves identically on both platforms, and every colour and label
 * already comes from the platform — so it reads as native without pretending to be a
 * native chart.
 *
 * Two things v1 got right and are kept: the grid with hour markers (a bar with no scale
 * tells you nothing), and splitting an event that crosses midnight across both days.
 * One thing v1 got wrong: it sorted each day's segments by size, so the colour bands
 * jumped between neighbouring bars. `stackedSegments` fixes the order globally.
 */

import { useMemo } from 'react'
import { StyleSheet, View, useColorScheme } from 'react-native'

import { breakdownByDay, chartMaximum, gridLines, stackedSegments } from '@/domain/aggregate'
import { getCategory } from '@/domain/categories'
import type { TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import { MINUTES_PER_HOUR, formatWeekdayNarrow, startOfDay } from '@/domain/time'
import { daysOfWeek, type Range } from '@/domain/week'
import { AppText } from '@/ui/AppText'
import { categoryColor, colors } from '@/ui/theme/colors'

const CHART_HEIGHT = 168

export type WeekChartProps = {
  week: Range
  /** `undefined` while the week is still loading. */
  events: TimeEvent[] | undefined
  rules: RuleSet
  locale: string
  now: number
}

export function WeekChart({ week, events, rules, locale, now }: WeekChartProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const days = useMemo(() => daysOfWeek(week), [week])
  const today = startOfDay(now)

  const breakdown = useMemo(
    () => (events === undefined ? undefined : breakdownByDay(events, rules, days)),
    [events, rules, days],
  )

  const maximum = useMemo(
    () =>
      breakdown === undefined
        ? 0
        : chartMaximum(Math.max(0, ...breakdown.map((d) => d.totalMinutes))),
    [breakdown],
  )

  const lines = useMemo(() => gridLines(maximum), [maximum])

  return (
    <View>
      <View style={styles.plot}>
        {/* The grid sits behind the bars and is never taller than them, so an empty
            week shows a flat baseline rather than a ladder of lines over nothing. */}
        <View style={styles.grid} pointerEvents="none">
          {lines.map((minutes) => (
            <View
              key={minutes}
              style={[styles.gridLine, { bottom: (minutes / maximum) * CHART_HEIGHT }]}>
              <View style={styles.rule} />
              <AppText role="caption" tone="tertiary" tabular style={styles.gridLabel}>
                {`${Math.round(minutes / MINUTES_PER_HOUR)} h`}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.bars}>
          {days.map((day, index) => {
            const dayBreakdown = breakdown?.[index]
            const segments = dayBreakdown === undefined ? [] : stackedSegments(dayBreakdown)
            return (
              <View key={day} style={styles.column}>
                <View style={styles.bar}>
                  {segments.map((segment) => {
                    const height =
                      maximum > 0 ? (segment.minutes / maximum) * CHART_HEIGHT : 0
                    if (height < 0.5) return null
                    return (
                      <View
                        key={segment.categoryId}
                        style={{
                          height,
                          backgroundColor: categoryColor(
                            getCategory(segment.categoryId).color,
                            scheme,
                          ),
                        }}
                      />
                    )
                  })}
                </View>
              </View>
            )
          })}
        </View>
      </View>

      <View style={styles.axis}>
        {days.map((day) => (
          <View key={day} style={styles.column}>
            <AppText
              role="caption"
              tone={day === today ? 'accent' : 'tertiary'}
              style={styles.dayLabel}>
              {formatWeekdayNarrow(day, locale)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  plot: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  grid: {
    ...StyleSheet.absoluteFill,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.fill,
  },
  gridLabel: {
    minWidth: 28,
    textAlign: 'right',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '52%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  axis: {
    flexDirection: 'row',
    marginTop: 8,
  },
  dayLabel: {
    textAlign: 'center',
  },
})
