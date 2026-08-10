/**
 * One activity: which category it belongs to, how widely the rule should reach, and the
 * events behind it.
 *
 * Parity target: v1's `ActivityOptionsScreen` (docs/SPEC.md §4.6), plus the part issue #13
 * described and v1 never built:
 *
 * > What if you open *Dinner with Jane Doe* & from this screen, make this "Starts with"
 * > […] Then from here you should be able to choose the part of text you want to match
 *
 * That is what the *Match* row does. It is also where the scope question is answered
 * safely, because `resolve` prefers the most specific rule — a broad `contains` here can
 * never silently override an exact rule the user wrote elsewhere.
 */

import { Host, List, ListItem, Picker } from '@expo/ui'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

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
import { colors } from '@/ui/theme/colors'

const MATCH_MODES: { label: string; value: MatchMode }[] = [
  { label: 'Exactly this title', value: 'exact' },
  { label: 'Titles starting with it', value: 'startsWith' },
  { label: 'Titles ending with it', value: 'endsWith' },
  { label: 'Titles containing it', value: 'contains' },
]

const CATEGORY_ITEMS = [
  { label: 'Uncategorized', value: UNKNOWN_CATEGORY_ID },
  ...DEFAULT_CATEGORIES.filter((c) => c.id !== UNKNOWN_CATEGORY_ID).map((c) => ({
    label: c.name,
    value: c.id,
  })),
]

const HISTORY_WEEKS = 6

export default function ActivityScreen() {
  const { title } = useLocalSearchParams<{ title: string }>()
  const activityTitle = title ?? ''

  const settings = useSettings()
  const update = useUpdateSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const [permission] = useCalendarPermissions()
  const granted = permission?.granted ?? false
  const calendars = useCalendarList(granted)

  const now = useMemo(() => Date.now(), [])
  const weeks = useMemo(
    () => lastWeeks(now, weekStartsOn, HISTORY_WEEKS),
    [now, weekStartsOn],
  )
  const window = useMemo(
    () => [{ start: weeks[0]!.start, end: now }],
    [weeks, now],
  )

  const calendarIds = useMemo(
    () =>
      calendars
        .map((c) => c.id)
        .filter((id) => !settings.skippedCalendars.some((s) => s.id === id)),
    [calendars, settings.skippedCalendars],
  )
  const live = useEventRanges(granted ? calendarIds : [], window)
  const rules = useMemo(() => rulesOf(settings), [settings])

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

  /**
   * How many *other* titles a broader rule would pull in. Issue #13 called this out as
   * the hard part of the UX — a rule you cannot see the reach of is a rule you cannot
   * trust — so the count is shown before anything is saved.
   */
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
      <View style={styles.screen}>
        <Host style={styles.list} useViewportSizeMeasurement>
          <List>
            <ListItem
              supportingText={
                own.length === 0
                  ? `Nothing in the last ${HISTORY_WEEKS} weeks`
                  : `${formatMinutes(totalMinutes)} over ${own.length} ${
                      own.length === 1 ? 'event' : 'events'
                    }, last ${HISTORY_WEEKS} weeks`
              }>
              {activityTitle}
            </ListItem>

            <ListItem
              supportingText={
                resolution.source === 'calendar'
                  ? `Currently ${getCategory(resolution.categoryId).name}, from its calendar`
                  : suggestion !== undefined
                    ? `Suggested: ${getCategory(suggestion).name}`
                    : undefined
              }
              trailing={
                <Picker
                  selectedValue={rule?.categoryId ?? resolution.categoryId}
                  onValueChange={(value) => write(String(value), match)}>
                  {CATEGORY_ITEMS.map((item) => (
                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                  ))}
                </Picker>
              }>
              Category
            </ListItem>

            <ListItem
              supportingText={
                match === 'exact'
                  ? 'Only this exact title'
                  : reach === 0
                    ? 'No other titles match right now'
                    : `Also matches ${reach} other ${reach === 1 ? 'title' : 'titles'}`
              }
              trailing={
                <Picker
                  selectedValue={match}
                  onValueChange={(value) =>
                    write(rule?.categoryId ?? resolution.categoryId, value as MatchMode)
                  }>
                  {MATCH_MODES.map((mode) => (
                    <Picker.Item key={mode.value} label={mode.label} value={mode.value} />
                  ))}
                </Picker>
              }>
              Match
            </ListItem>

            <ListItem
              supportingText="Hidden activities stay out of your reports, but still count towards goals"
              onPress={toggleHidden}>
              {hidden ? 'Show in reports' : 'Hide from reports'}
            </ListItem>

            {own.slice(0, 30).map((event) => (
              <ListItem
                key={eventKey(event)}
                supportingText={formatMinutes(msToMinutes(event.end - event.start))}>
                {formatDayMonthShort(event.start, locale)}
              </ListItem>
            ))}
          </List>
        </Host>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
})
