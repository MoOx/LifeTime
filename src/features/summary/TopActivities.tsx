/**
 * Ranked activities for the visible range, with a proportional bar per row.
 *
 * The row itself is React Native rather than a native list row, because it carries a
 * custom bar; the text inside goes through `AppText`, so it still picks up the platform
 * type ramp. Screens that are *only* rows (Settings, Filters) should use `@expo/ui`'s
 * `List` instead — see docs/ARCHITECTURE.md §3.3.
 */

import { Link } from 'expo-router'
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native'

import type { Bucket } from '@/domain/aggregate'
import type { Activity } from '@/domain/activities'
import { resolveCategoryId } from '@/domain/activities'
import { getCategory } from '@/domain/categories'
import { formatMinutes } from '@/domain/time'
import { AppText } from '@/ui/AppText'
import { Section } from '@/ui/Section'
import { categoryColor, colors } from '@/ui/theme/colors'

export type TopActivitiesProps = {
  buckets: Bucket[]
  activities: Activity[]
  limit?: number
}

export function TopActivities({ buckets, activities, limit = 8 }: TopActivitiesProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const max = buckets[0]?.minutes ?? 1
  const shown = buckets.slice(0, limit)

  if (shown.length === 0) {
    return (
      <Section style={styles.empty}>
        <AppText role="secondary" tone="secondary">
          No activities in this range yet.
        </AppText>
      </Section>
    )
  }

  return (
    <View style={styles.list}>
      {shown.map((bucket) => {
        const category = getCategory(resolveCategoryId(bucket.key, activities))
        const color = categoryColor(category.color, scheme)
        return (
          <Link
            key={bucket.key}
            href={{ pathname: '/activity/[title]', params: { title: bucket.key } }}
            asChild>
            <Pressable style={styles.row} accessibilityRole="button">
              <View style={[styles.dot, { backgroundColor: color }]} />
              <View style={styles.rowBody}>
                <Section>
                  <AppText role="body" numberOfLines={1}>
                    {bucket.key}
                  </AppText>
                </Section>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: color, width: `${(bucket.minutes / max) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <Section>
                <AppText role="secondary" tone="secondary">
                  {formatMinutes(bucket.minutes)}
                </AppText>
              </Section>
            </Pressable>
          </Link>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.separator,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
})
