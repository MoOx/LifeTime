/**
 * One week: a stacked bar per day, on v1's grid. Drawn by React Native, the one part of
 * the Summary the OS has no component for (INTENT.md D27); it sits in a SwiftUI section
 * through `RNHostView`.
 *
 * Geometry from docs/SCREENS.md §8b, each constant cited to `WeeklyGraph.res` on `main`;
 * the structure is v2's (quarry/v2/src/features/summary/WeekChart.tsx), with two changes:
 *
 *   - **Stacking by the week's totals**, the biggest category at the bottom
 *     (`WeeklyGraph.res:265-267`, D25), where v2 used the declaration order.
 *   - **Real dashes.** v2 set `borderStyle: 'dashed'` on a left border only, which iOS
 *     draws solid; `DashedLine` clips a fully dashed box to its left edge.
 */

import { useMemo } from 'react'
import { PlatformColor, StyleSheet, View, useColorScheme } from 'react-native'

import {
  breakdownByDay,
  chartGrid,
  chartMaximum,
  describeWeekChart,
  stackedSegments,
  weekStackOrder,
} from '@/domain/aggregate'
import { getCategory } from '@/domain/categories'
import type { TimeEvent } from '@/domain/events'
import type { RuleSet } from '@/domain/rules'
import { formatWeekdayLong, formatWeekdayNarrow } from '@/domain/time'
import { daysOfWeek, type Range } from '@/domain/week'
import { AppText } from '@/ui/AppText'
import { categoryColor } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'
import { useTextScale } from '@/ui/textSize'

/** `WeeklyGraph.res:6-10`: plot, day-letter strip, and the gutter "Enough for "99m"". */
const PLOT_HEIGHT = 140
const LETTER_HEIGHT = 16
const RIGHT_GUTTER = 28
/** Labels scale with Dynamic Type up to this factor only: the plot is fixed (40-design.md). */
export const LABEL_SCALE_LIMIT = 1.3

/** `WeeklyGraph.res`: horizontal lines in `gray5`, dashed day dividers in `gray4`. */
const gridColor = PlatformColor('systemGray5')
const dashColor = PlatformColor('systemGray4')

export type WeekChartProps = {
  week: Range
  events: readonly TimeEvent[]
  rules: RuleSet
  locale: string
}

/** The letter strip's height, as the pager sizes itself around the chart. */
export const chartHeight = (labelScale: number) => PLOT_HEIGHT + LETTER_HEIGHT * labelScale

export function WeekChart({ week, events, rules, locale }: WeekChartProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const days = useMemo(() => daysOfWeek(week), [week])
  const breakdown = useMemo(() => breakdownByDay(events, rules, days), [events, rules, days])
  const order = useMemo(() => weekStackOrder(breakdown), [breakdown])
  const maximum = useMemo(
    () => chartMaximum(Math.max(0, ...breakdown.map((d) => d.totalMinutes))),
    [breakdown],
  )
  const grid = useMemo(() => chartGrid(maximum), [maximum])
  // The gutter and the letter strip grow with their labels, up to the same limit (slice 9):
  // at 28 pt, "10h" was cut to "1…" at the largest sizes.
  const labelScale = useTextScale(LABEL_SCALE_LIMIT)
  const spoken = useMemo(
    () =>
      describeWeekChart(
        breakdown,
        (day) => formatWeekdayLong(day, locale),
        (id) => getCategory(id).name,
      ).join('. '),
    [breakdown, locale],
  )

  return (
    // One element for VoiceOver: the bars, letters and gridlines say nothing on their own,
    // so the chart reads as the day-by-day sentence (slice 9).
    <View style={styles.chart} accessible accessibilityRole="image" accessibilityLabel={spoken}>
      <View style={styles.plotColumn}>
        <View style={styles.plot}>
          {grid.map((line) => (
            <View
              key={line.fraction}
              pointerEvents="none"
              style={[styles.rule, { bottom: line.fraction * PLOT_HEIGHT }]}
            />
          ))}
          {/* A dashed divider at every day boundary: eight for seven days. */}
          {[...days, null].map((day, index) => (
            <DashedLine key={day ?? 'end'} left={`${(index / days.length) * 100}%`} />
          ))}
          <View style={styles.bars}>
            {breakdown.map((day) => (
              <View key={day.day} style={styles.column}>
                <View style={styles.bar}>
                  {/* Bottom first in the data; a column lays out top first. */}
                  {stackedSegments(day, order)
                    .reverse()
                    .map((segment) => {
                      const height = maximum > 0 ? (segment.minutes / maximum) * PLOT_HEIGHT : 0
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
            ))}
          </View>
        </View>
        {/* Day letters at the bottom left of their column, beside the dash. */}
        <View style={[styles.axis, { height: LETTER_HEIGHT * labelScale }]}>
          {days.map((day, index) => (
            <View
              key={day}
              style={[styles.letterSlot, { left: `${(index / days.length) * 100}%` }]}>
              <AppText role="caption" tone="tertiary" maxFontSizeMultiplier={LABEL_SCALE_LIMIT}>
                {formatWeekdayNarrow(day, locale)}
              </AppText>
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.gutter, { width: RIGHT_GUTTER * labelScale }]} pointerEvents="none">
        {grid.map((line) =>
          line.label === undefined ? null : (
            <AppText
              key={line.fraction}
              role="caption"
              tone="tertiary"
              tabular
              numberOfLines={1}
              maxFontSizeMultiplier={LABEL_SCALE_LIMIT}
              style={[styles.gutterLabel, { bottom: line.fraction * PLOT_HEIGHT - 8 }]}>
              {line.label}
            </AppText>
          ),
        )}
      </View>
    </View>
  )
}

/** A 1 pt dashed vertical line: a dashed box whose right part is clipped away. */
function DashedLine({ left }: { left: `${number}%` }) {
  return (
    <View pointerEvents="none" style={[styles.dashClip, { left }]}>
      <View style={styles.dashBox} />
    </View>
  )
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row' },
  plotColumn: { flex: 1 },
  plot: { height: PLOT_HEIGHT, justifyContent: 'flex-end' },
  rule: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: gridColor,
  },
  dashClip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    overflow: 'hidden',
  },
  dashBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: dashColor,
  },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: PLOT_HEIGHT },
  column: { flex: 1, alignItems: 'center' },
  /** 60 % of the column, top corners 3 (`WeeklyGraph.res:43-48`). */
  bar: {
    width: '60%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  axis: {},
  letterSlot: { position: 'absolute', top: 0, paddingLeft: space.xxs },
  gutter: { height: PLOT_HEIGHT },
  gutterLabel: { position: 'absolute', left: space.xs },
})
