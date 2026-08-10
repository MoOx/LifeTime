/**
 * One activity.
 *
 * v1's `ActivityOptions.res` had a shape worth keeping, and it was not a flat list:
 *
 *     heading "Category" → every category as a row, its own icon on the left, a filled
 *                          check ring in the category's colour on the right
 *     heading "Events"   → the events behind the number
 *     a red centred "Hide Activity", with a footnote explaining what that does
 *
 * Picking a category from a list of nine, each showing its own colour and icon, is both
 * faster and more informative than opening a menu — you see the palette, and you see
 * which one is chosen. So the category picker is a group of rows, not a `Picker`.
 *
 * What is added is the part issue #13 described and v1 never built: a **Match** row that
 * widens the rule from this exact title to a prefix, suffix or substring — and, because
 * a rule whose reach you cannot see is a rule you cannot trust, a live count of how many
 * other titles it would claim.
 */

import { Host, Picker } from '@expo/ui'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarPermissions } from '@/data/calendars'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { useCalendarList } from '@/data/useCalendarList'
import { invalidateEvents, useEventRanges } from '@/data/useEvents'
import { rulesOf } from '@/data/useReport'
import { type MatchMode, makeActivityId, matches, suggestCategoryId } from '@/domain/activities'
import { DEFAULT_CATEGORIES, UNKNOWN_CATEGORY_ID, getCategory } from '@/domain/categories'
import { demoEvents } from '@/domain/demo'
import { eventKey, filterEvents } from '@/domain/events'
import { resolve } from '@/domain/rules'
import { formatDayMonthShort, formatMinutes, msToMinutes } from '@/domain/time'
import { lastWeeks } from '@/domain/week'
import { AppText } from '@/ui/AppText'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { RawSymbol, Symbol } from '@/ui/Symbol'
import { categoryColor, colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

const MATCH_MODES: { label: string; value: MatchMode }[] = [
  { label: 'This exact title', value: 'exact' },
  { label: 'Titles starting with it', value: 'startsWith' },
  { label: 'Titles ending with it', value: 'endsWith' },
  { label: 'Titles containing it', value: 'contains' },
]

const HISTORY_WEEKS = 6
const EVENTS_SHOWN = 20

export default function ActivityScreen() {
  const { title } = useLocalSearchParams<{ title: string }>()
  const activityTitle = title ?? ''

  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const update = useUpdateSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const [permission] = useCalendarPermissions()
  const granted = permission?.granted ?? false
  const calendars = useCalendarList(granted)

  const now = useMemo(() => Date.now(), [])
  const weeks = useMemo(
    () => lastWeeks(now, weekStartsOn, HISTORY_WEEKS),
    [now, weekStartsOn],
  )
  const window = useMemo(() => [{ start: weeks[0]!.start, end: now }], [weeks, now])

  const calendarIds = useMemo(
    () =>
      calendars
        .map((c) => c.id)
        .filter((id) => !settings.skippedCalendars.some((s) => s.id === id)),
    [calendars, settings.skippedCalendars],
  )
  const live = useEventRanges(granted ? calendarIds : [], window)
  const rules = useMemo(() => rulesOf(settings, !granted), [settings, granted])

  /** The rule that currently owns this title, if the user wrote one. */
  const rule = useMemo(
    () =>
      settings.activities.find(
        (activity) => activity.match === 'exact' && matches(activity, activityTitle),
      ),
    [settings.activities, activityTitle],
  )

  const events = useMemo(() => {
    const raw = granted ? live.byRange[0] : demoEvents(window[0]!, now)
    if (raw === undefined) return undefined
    return filterEvents(raw, {
      skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
      skippedActivityTitles: [],
      hideSkippedActivities: false,
    }).sort((a, b) => b.start - a.start)
  }, [granted, live.byRange, window, now, settings.skippedCalendars])

  const own = useMemo(
    () => (events ?? []).filter((event) => event.title === activityTitle),
    [events, activityTitle],
  )

  const calendarId = own[0]?.calendarId ?? ''
  const resolution = useMemo(
    () => resolve({ title: activityTitle, calendarId }, rules),
    [activityTitle, calendarId, rules],
  )

  const match: MatchMode = rule?.match ?? 'exact'
  const selectedCategoryId = rule?.categoryId ?? resolution.categoryId

  /** How many *other* titles a broader rule would pull in. */
  const reach = useMemo(() => {
    if (events === undefined || match === 'exact') return 0
    const probe = { id: '', title: activityTitle, match, categoryId: '', createdAt: 0 }
    const titles = new Set(
      events.filter((e) => matches(probe, e.title)).map((e) => e.title),
    )
    titles.delete(activityTitle)
    return titles.size
  }, [events, match, activityTitle])

  const write = useCallback(
    (categoryId: string, nextMatch: MatchMode) => {
      update((current) => {
        const others = current.activities.filter((a) => a.id !== rule?.id)
        if (categoryId === UNKNOWN_CATEGORY_ID) return { ...current, activities: others }
        return {
          ...current,
          activities: [
            ...others,
            {
              id: rule?.id ?? makeActivityId(activityTitle, now),
              title: activityTitle,
              match: nextMatch,
              categoryId,
              createdAt: rule?.createdAt ?? now,
            },
          ],
        }
      })
      invalidateEvents()
    },
    [update, rule, activityTitle, now],
  )

  const hidden = settings.skippedActivityTitles.includes(activityTitle)

  const toggleHidden = useCallback(() => {
    update((current) => ({
      ...current,
      skippedActivityTitles: hidden
        ? current.skippedActivityTitles.filter((t) => t !== activityTitle)
        : [...current.skippedActivityTitles, activityTitle],
    }))
  }, [update, hidden, activityTitle])

  const suggestion =
    resolution.source === 'none' ? suggestCategoryId(activityTitle) : undefined

  const totalMinutes = own.reduce(
    (sum, event) => sum + msToMinutes(event.end - event.start),
    0,
  )

  return (
    <>
      <Stack.Screen options={{ title: activityTitle }} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
        contentInsetAdjustmentBehavior="automatic">
        {/* The number this screen exists to explain, before anything you can change. */}
        <View style={styles.summary}>
          <AppText role="metric" tabular>
            {formatMinutes(totalMinutes)}
          </AppText>
          <AppText role="secondary" tone="secondary">
            {own.length === 0
              ? `Nothing in the last ${HISTORY_WEEKS} weeks`
              : `over ${own.length} ${own.length === 1 ? 'event' : 'events'}, last ${HISTORY_WEEKS} weeks`}
          </AppText>
        </View>

        <ListHeader title="Category" />
        <ListGroup separatorInset="text">
          {DEFAULT_CATEGORIES.map((category) => {
            const color = categoryColor(category.color, scheme)
            const selected = category.id === selectedCategoryId
            return (
              <ListRow
                key={category.id}
                title={category.name}
                subtitle={
                  category.id === suggestion
                    ? 'Suggested'
                    : selected && resolution.source === 'calendar'
                      ? 'From its calendar'
                      : undefined
                }
                onPress={() => write(category.id, match)}
                leading={
                  <View style={[styles.icon, { backgroundColor: color }]}>
                    <RawSymbol
                      pair={{ ios: category.sf, android: category.material }}
                      size={15}
                      color={colors.onAccent}
                    />
                  </View>
                }
                accessory={
                  selected ? <Symbol name="checkmark" size={17} color={color} /> : undefined
                }
              />
            )
          })}
        </ListGroup>

        <ListHeader title="Match" />
        <ListGroup>
          <ListRow
            title="Applies to"
            accessory={
              <Host matchContents>
                <Picker
                  selectedValue={match}
                  onValueChange={(value) =>
                    write(selectedCategoryId, value as MatchMode)
                  }>
                  {MATCH_MODES.map((mode) => (
                    <Picker.Item key={mode.value} label={mode.label} value={mode.value} />
                  ))}
                </Picker>
              </Host>
            }
          />
        </ListGroup>
        <ListFootnote>
          {match === 'exact'
            ? 'Only events with exactly this title. Widen it to catch the variations you keep typing.'
            : reach === 0
              ? 'No other titles match right now.'
              : `Also matches ${reach} other ${reach === 1 ? 'title' : 'titles'} in the last ${HISTORY_WEEKS} weeks.`}
        </ListFootnote>

        <ListHeader title="Events" />
        <ListGroup>
          {own.length === 0 ? (
            <ListRow title="No events" subtitle="Nothing logged under this title yet." />
          ) : (
            own
              .slice(0, EVENTS_SHOWN)
              .map((event) => (
                <ListRow
                  key={eventKey(event)}
                  title={formatDayMonthShort(event.start, locale)}
                  value={formatMinutes(msToMinutes(event.end - event.start))}
                />
              ))
          )}
        </ListGroup>
        {own.length > EVENTS_SHOWN && (
          <ListFootnote>{`Showing the ${EVENTS_SHOWN} most recent of ${own.length}.`}</ListFootnote>
        )}

        <ListGroup style={styles.spaced}>
          <ListRow
            destructive={!hidden}
            centeredAction={hidden}
            title={hidden ? 'Reveal activity' : 'Hide activity'}
            onPress={toggleHidden}
          />
        </ListGroup>
        <ListFootnote>
          {hidden
            ? 'This will show similar activities in all reports again.'
            : 'This will hide similar activities from all reports. They still count towards your goals.'}
        </ListFootnote>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summary: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.xxs,
  },
  icon: {
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: layout.iconSize / 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaced: {
    marginTop: space.xl,
  },
})
