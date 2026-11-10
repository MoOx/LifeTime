/**
 * Ranked activities for the visible week, with a proportional bar per row.
 *
 * The layout is v1's, because v1's was right: a coloured category icon on the left, the
 * title, and *under it* a bar sharing its line with the duration. Putting the bar on its
 * own line is what lets it be long enough to compare at a glance — which is the entire
 * reason it exists. Comparing "3 h 15" to "2 h" means reading two numbers; comparing two
 * bars does not.
 *
 * What v1 got wrong was the spacing, and it was not really v1's fault: every gap in it was
 * a hand-placed `<Spacer size=XS />`, so the rhythm depended on remembering to add one.
 * Here the gaps come from `theme/space.ts` and the row structure, so a dot cannot end up
 * touching a bar.
 */

import { useRouter } from 'expo-router'
import { StyleSheet, View, useColorScheme } from 'react-native'

import type { Bucket } from '@/domain/aggregate'
import { getCategory } from '@/domain/categories'
import type { RuleSet } from '@/domain/rules'
import { categoryOf } from '@/domain/rules'
import { formatMinutes } from '@/domain/time'
import { AppText } from '@/ui/AppText'
import { ListGroup, ListRow } from '@/ui/List'
import { RawSymbol } from '@/ui/Symbol'
import { categoryColor, colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

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
  const router = useRouter()
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const max = buckets[0]?.minutes ?? 1
  const shown = buckets.slice(0, limit)

  if (shown.length === 0) return null

  return (
    <ListGroup separatorInset="text">
      {shown.map((bucket) => {
        const categoryId = categoryOf(
          { title: bucket.key, calendarId: calendarOfTitle(bucket.key) },
          rules,
        )
        const category = getCategory(categoryId)
        const color = categoryColor(category.color, scheme)

        return (
          <ListRow
            key={bucket.key}
            title={bucket.key}
            chevron
            onPress={() =>
              router.push({
                pathname: '/activity/[title]',
                params: { title: bucket.key },
              })
            }
            accessibilityLabel={`${bucket.key}, ${formatMinutes(bucket.minutes)}, ${category.name}`}
            leading={
              <View style={[styles.icon, { backgroundColor: color }]}>
                <RawSymbol
                  pair={{ ios: category.sf, android: category.material }}
                  size={15}
                  color={colors.onAccent}
                />
              </View>
            }>
            <View style={styles.meter}>
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
              <AppText role="footnote" tone="secondary" tabular numberOfLines={1}>
                {formatMinutes(bucket.minutes)}
              </AppText>
            </View>
          </ListRow>
        )
      })}
    </ListGroup>
  )
}

const styles = StyleSheet.create({
  icon: {
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: layout.iconSize / 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xs,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.fill,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
})
