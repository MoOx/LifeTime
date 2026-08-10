/**
 * One week: a stacked bar per day, on a grid.
 *
 * Rebuilt against `docs/SCREENS.md` §8b, because the first version was plausible and
 * wrong in five ways at once — which is the failure mode a screenshot cannot catch, since
 * a chart that looks like a chart looks fine.
 *
 * The geometry is v1's, and every constant below is cited there:
 *
 *   • **140 pt of plot, 16 pt of day letters** underneath (`WeeklyGraph.res:8-9`).
 *   • **A 28 pt gutter on the right**, sized in v1 with the comment `// Enough for "99m"`
 *     (`WeeklyGraph.res:10`). The axis labels live in it, so they never sit over a bar.
 *   • **A dashed vertical line at every day boundary** — eight for seven days
 *     (`WeeklyGraph.res:109-161`). These were missing entirely, and they are most of what
 *     makes the thing read as a chart rather than a row of coloured blocks.
 *   • **The day letter sits at the bottom-left of its column**, immediately right of its
 *     dash, not centred under the bar (`WeeklyGraph.res:135-156`).
 *   • **Bars are 60 % of their column**, with 3 pt top corners (`WeeklyGraph.res:43-48`).
 *
 * One departure, deliberate: v1 stacked by the *week's* category totals, so a colour band
 * moved as you swiped between weeks. Here the order is the categories' declaration order,
 * which is stable everywhere — see `stackedSegments`.
 */

import { useMemo } from 'react'
import { StyleSheet, View, useColorScheme } from 'react-native'

import { breakdownByDay, chartGrid, chartMaximum, stackedSegments } from '@/domain/aggregate'
import { getCategory } from '@/domain/categories'
import type { TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import { formatWeekdayNarrow, startOfDay } from '@/domain/time'
import { daysOfWeek, type Range } from '@/domain/week'
import { AppText } from '@/ui/AppText'
import { categoryColor, colors } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'

/** `WeeklyGraph.res:8-10`. */
const PLOT_HEIGHT = 140
const LETTER_HEIGHT = 16
const RIGHT_GUTTER = 28

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

  const grid = useMemo(() => chartGrid(maximum), [maximum])

  return (
    <View style={styles.chart}>
      <View style={styles.plotColumn}>
        <View style={styles.plot}>
          {/* Horizontal rules. Behind everything, and never taller than the plot, so an
              empty week shows a flat baseline rather than a ladder over nothing. */}
          {grid.map((line) => (
            <View
              key={line.fraction}
              pointerEvents="none"
              style={[styles.rule, { bottom: line.fraction * PLOT_HEIGHT }]}
            />
          ))}

          {/* One dashed divider per day boundary, plus the closing one. */}
          {days.map((day, index) => (
            <View
              key={`divider-${day}`}
              pointerEvents="none"
              style={[styles.divider, { left: `${(index / days.length) * 100}%` }]}
            />
          ))}
          <View pointerEvents="none" style={[styles.divider, styles.dividerEnd]} />

          <View style={styles.bars}>
            {days.map((day, index) => {
              const dayBreakdown = breakdown?.[index]
              const segments =
                dayBreakdown === undefined ? [] : stackedSegments(dayBreakdown)
              return (
                <View key={day} style={styles.column}>
                  <View style={styles.bar}>
                    {segments.map((segment) => {
                      const height =
                        maximum > 0 ? (segment.minutes / maximum) * PLOT_HEIGHT : 0
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

        {/* Day letters, each pinned to the left of its own column so it lines up with the
            dash above it. */}
        <View style={styles.axis}>
          {days.map((day, index) => (
            <View
              key={day}
              style={[styles.letterSlot, { left: `${(index / days.length) * 100}%` }]}>
              <AppText role="caption" tone={day === today ? 'accent' : 'tertiary'}>
                {formatWeekdayNarrow(day, locale)}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {/* The gutter. Labels are positioned against the plot, not the bars. */}
      <View style={styles.gutter} pointerEvents="none">
        {grid.map((line) =>
          line.label === undefined ? null : (
            <AppText
              key={line.fraction}
              role="caption"
              tone="tertiary"
              tabular
              numberOfLines={1}
              style={[styles.gutterLabel, { bottom: line.fraction * PLOT_HEIGHT - 8 }]}>
              {line.label}
            </AppText>
          ),
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: 'row',
  },
  plotColumn: {
    flex: 1,
  },
  plot: {
    height: PLOT_HEIGHT,
    justifyContent: 'flex-end',
  },
  rule: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.fill,
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
    borderLeftColor: colors.fill,
    borderStyle: 'dashed',
  },
  dividerEnd: {
    left: undefined,
    right: 0,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: PLOT_HEIGHT,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '60%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  axis: {
    height: LETTER_HEIGHT,
  },
  letterSlot: {
    position: 'absolute',
    top: 0,
    paddingLeft: space.xxs,
  },
  gutter: {
    width: RIGHT_GUTTER,
    height: PLOT_HEIGHT,
  },
  gutterLabel: {
    position: 'absolute',
    left: space.xs,
  },
})
