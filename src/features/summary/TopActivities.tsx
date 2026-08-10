/**
 * Ranked activities for the visible week, with a proportional bar per row.
 *
 * The bar is the point: v1 showed a title and a duration, and comparing "3 h 15" to
 * "2 h" meant reading two numbers. The bar answers the same question without reading.
 *
 * Plain React Native rather than a native list row, because of that bar — a `ListItem`
 * cannot hold one. The text still goes through `AppText`, so it carries the platform's
 * type ramp either way. Screens that are *only* rows use `@expo/ui`'s `List`.
 */

import { Link } from 'expo-router'
import { Fragment } from 'react'
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native'

import type { Bucket } from '@/domain/aggregate'
import { getCategory } from '@/domain/categories'
import type { RuleSet } from '@/domain/rules'
import { categoryOf } from '@/domain/rules'
import { formatMinutes } from '@/domain/time'
import { AppText } from '@/ui/AppText'
import { Symbol } from '@/ui/Symbol'
import { categoryColor, colors } from '@/ui/theme/colors'

export type TopActivitiesProps = {
  buckets: Bucket[]
  rules: RuleSet
  /** Which calendar each title came from, so calendar rules can resolve. */
  calendarOfTitle: (title: string) => string
  limit?: number
}

export function TopActivities({
  buckets,
  rules,
  calendarOfTitle,
  limit = 8,
}: TopActivitiesProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const max = buckets[0]?.minutes ?? 1
  const shown = buckets.slice(0, limit)

  if (shown.length === 0) return null

  return (
    <View style={styles.list}>
      {shown.map((bucket, index) => {
        const categoryId = categoryOf(
          { title: bucket.key, calendarId: calendarOfTitle(bucket.key) },
          rules,
        )
        const category = getCategory(categoryId)
        const color = categoryColor(category.color, scheme)

        return (
          <Fragment key={bucket.key}>
            {index > 0 && <View style={styles.separator} />}
            <Link
              href={{ pathname: '/activity/[title]', params: { title: bucket.key } }}
              asChild>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                accessibilityRole="button"
                accessibilityLabel={`${bucket.key}, ${formatMinutes(bucket.minutes)}, ${category.name}`}>
                <View style={styles.body}>
                  <View style={styles.titleRow}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <AppText role="body" numberOfLines={1} style={styles.title}>
                      {bucket.key}
                    </AppText>
                    <AppText role="secondary" tone="secondary" tabular>
                      {formatMinutes(bucket.minutes)}
                    </AppText>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        {
                          backgroundColor: color,
                          width: `${Math.max(2, (bucket.minutes / max) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Symbol name="chevronRight" size={13} color={colors.tertiaryLabel} />
              </Pressable>
            </Link>
          </Fragment>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 12,
  },
  rowPressed: {
    backgroundColor: colors.selection,
  },
  body: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  track: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.fill,
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 2.5,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 33,
  },
})
