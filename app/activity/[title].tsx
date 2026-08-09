/**
 * One activity: which category it belongs to, and the events behind it.
 * Parity target: v1's `ActivityOptionsScreen` + `ActivityOptions` (docs/SPEC.md §4.6).
 */

import { Host, List, ListItem } from '@expo/ui'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { useCalendarPermissions } from '@/data/calendars'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { useCalendarList } from '@/data/useCalendarList'
import { useEventRanges } from '@/data/useEvents'
import {
  makeActivityId,
  matches,
  resolveCategoryId,
  suggestCategoryId,
} from '@/domain/activities'
import { DEFAULT_CATEGORIES } from '@/domain/categories'
import { eventKey, filterEvents } from '@/domain/events'
import { formatDayMonthShort, formatMinutes, msToMinutes } from '@/domain/time'
import { clampToNow, weekRange } from '@/domain/week'
import { AppText } from '@/ui/AppText'
import { Section } from '@/ui/Section'
import { colors } from '@/ui/theme/colors'

export default function ActivityScreen() {
  const { title } = useLocalSearchParams<{ title: string }>()
  const activityTitle = title ?? ''

  const settings = useSettings()
  const update = useUpdateSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const [permission] = useCalendarPermissions()
  const calendars = useCalendarList(permission?.granted ?? false)

  const now = useMemo(() => Date.now(), [])
  const ranges = useMemo(
    () => [clampToNow(weekRange(now, weekStartsOn), now)],
    [now, weekStartsOn],
  )
  const calendarIds = useMemo(
    () =>
      calendars
        .map((c) => c.id)
        .filter((id) => !settings.skippedCalendars.some((s) => s.id === id)),
    [calendars, settings.skippedCalendars],
  )
  const { byRange } = useEventRanges(calendarIds, ranges)

  const events = useMemo(() => {
    const raw = byRange[0]
    if (raw === undefined) return []
    return filterEvents(raw, {
      skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
      skippedActivityTitles: settings.skippedActivityTitles,
      hideSkippedActivities: false,
    })
      .filter((event) => event.title === activityTitle)
      .sort((a, b) => b.start - a.start)
  }, [byRange, settings, activityTitle])

  const currentCategoryId = resolveCategoryId(activityTitle, settings.activities)
  // Only offered when the user has not decided yet.
  const suggestion =
    currentCategoryId === 'unknown' ? suggestCategoryId(activityTitle) : undefined

  const assign = (categoryId: string) => {
    update((current) => ({
      ...current,
      activities: [
        // Replace any rule that already claims this exact title.
        ...current.activities.filter(
          (activity) => !(activity.match === 'exact' && matches(activity, activityTitle)),
        ),
        {
          id: makeActivityId(activityTitle, now),
          title: activityTitle,
          match: 'exact' as const,
          categoryId,
          createdAt: now,
        },
      ],
    }))
  }

  return (
    <>
      <Stack.Screen options={{ title: activityTitle }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Section style={styles.header}>
          <AppText role="screenTitle" numberOfLines={2}>
            {activityTitle}
          </AppText>
          {suggestion !== undefined ? (
            <AppText role="secondary" tone="secondary">
              {`Looks like ${DEFAULT_CATEGORIES.find((c) => c.id === suggestion)?.name}. Tap to confirm.`}
            </AppText>
          ) : null}
        </Section>

        <Host style={styles.list} matchContents>
          <List>
            {DEFAULT_CATEGORIES.map((category) => (
              <ListItem
                key={category.id}
                onPress={() => assign(category.id)}
                supportingText={
                  category.id === currentCategoryId
                    ? 'Selected'
                    : category.id === suggestion
                      ? 'Suggested'
                      : undefined
                }>
                {category.name}
              </ListItem>
            ))}
          </List>
        </Host>

        <Section style={styles.header}>
          <AppText role="sectionTitle">This week</AppText>
        </Section>
        <View style={styles.events}>
          {events.map((event) => (
            <View key={eventKey(event)} style={styles.event}>
              <Section>
                <AppText role="body">{formatDayMonthShort(event.start, locale)}</AppText>
              </Section>
              <Section>
                <AppText role="secondary" tone="secondary">
                  {formatMinutes(msToMinutes(event.end - event.start))}
                </AppText>
              </Section>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  header: {
    gap: 4,
    paddingHorizontal: 4,
  },
  list: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  events: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  event: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
})
