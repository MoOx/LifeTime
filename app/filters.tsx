/**
 * "Customize report" — one place for every rule that decides what a week looks like.
 *
 * Two details are lifted straight from v1's `Filters.res`, because it had thought them
 * through:
 *
 *   • **A "Show All" / "Hide All" action in the section heading.** With eight calendars,
 *     the common move is "only this one" — eight taps without it, two with.
 *   • **The check mark is tinted with the calendar's own colour.** That is the colour the
 *     user sees in Calendar.app, so the row is recognisable before the title is read. It
 *     costs nothing and no generic accent tick can do it.
 *
 * What v1 could not do, and this can:
 *
 *   • **A calendar can carry a category.** "Everything in my work calendar is Work" is
 *     one tap and categorises hundreds of events — for anyone whose work already lives in
 *     its own calendar, that is the whole setup.
 *   • **Rules broader than an exact title** — issue #13, promised in v1's own help text.
 */

import { Host, Picker } from '@expo/ui'
import { useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarPermissions } from '@/data/calendars'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { DEVICE_SOURCE_AVAILABLE, sourceFor } from '@/data/source'
import { useCalendarList } from '@/data/useCalendarList'
import { invalidateEvents } from '@/data/useEvents'
import { describeMatch } from '@/domain/activities'
import { DEFAULT_CATEGORIES, UNKNOWN_CATEGORY_ID, getCategory } from '@/domain/categories'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { RawSymbol, Symbol } from '@/ui/Symbol'
import { categoryColor, colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

/** "No category" first, so the picker can also clear a rule. */
const PICKER_ITEMS = [
  { label: 'No category', value: UNKNOWN_CATEGORY_ID },
  ...DEFAULT_CATEGORIES.filter((c) => c.id !== UNKNOWN_CATEGORY_ID).map((c) => ({
    label: c.name,
    value: c.id,
  })),
]

export default function FiltersScreen() {
  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const update = useUpdateSettings()
  const router = useRouter()
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const [permission] = useCalendarPermissions()
  const source = sourceFor(permission?.granted ?? false)
  const calendars = useCalendarList(source)

  const allHidden = useMemo(
    () =>
      calendars.length > 0 &&
      calendars.every((c) => settings.skippedCalendars.some((s) => s.id === c.id)),
    [calendars, settings.skippedCalendars],
  )

  const toggleCalendar = useCallback(
    (id: string, counted: boolean) => {
      const calendar = calendars.find((c) => c.id === id)
      if (calendar === undefined) return
      update((current) => ({
        ...current,
        skippedCalendars: counted
          ? current.skippedCalendars.filter((c) => c.id !== id)
          : [...current.skippedCalendars, calendar],
      }))
      // Filtering happens in JS, but the set of calendars we query changes, so drop the
      // cached ranges.
      invalidateEvents()
    },
    [calendars, update],
  )

  const setAll = useCallback(
    (counted: boolean) => {
      update((current) => ({
        ...current,
        skippedCalendars: counted ? [] : calendars,
      }))
      invalidateEvents()
    },
    [calendars, update],
  )

  const setCalendarCategory = useCallback(
    (calendarId: string, categoryId: string) => {
      update((current) => {
        const next = { ...current.calendarCategories }
        if (categoryId === UNKNOWN_CATEGORY_ID) delete next[calendarId]
        else next[calendarId] = categoryId
        return { ...current, calendarCategories: next }
      })
      invalidateEvents()
    },
    [update],
  )

  const removeRule = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        activities: current.activities.filter((a) => a.id !== id),
      }))
      invalidateEvents()
    },
    [update],
  )

  const rules = useMemo(
    () =>
      [...settings.activities].sort(
        (a, b) =>
          getCategory(a.categoryId).name.localeCompare(getCategory(b.categoryId).name) ||
          a.title.localeCompare(b.title),
      ),
    [settings.activities],
  )

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
      contentInsetAdjustmentBehavior="automatic">
      <ListHeader
        title="Calendars"
        // Offering "Hide all" over an empty group is an action that does nothing, which
        // reads as a broken screen rather than an empty one.
        action={
          calendars.length === 0
            ? undefined
            : {
                label: allHidden ? 'Show all' : 'Hide all',
                onPress: () => setAll(allHidden),
              }
        }
      />
      <ListGroup separatorInset={calendars.length === 0 ? 'full' : 'text'}>
        {calendars.length === 0 && (
          <ListRow
            title="No calendars"
            subtitle={
              DEVICE_SOURCE_AVAILABLE
                ? 'This device has no event calendars to read.'
                : 'The browser has no calendars to read.'
            }
          />
        )}
        {calendars.map((calendar) => {
          const counted = !settings.skippedCalendars.some((c) => c.id === calendar.id)
          const categoryId =
            settings.calendarCategories[calendar.id] ?? UNKNOWN_CATEGORY_ID
          return (
            <ListRow
              key={calendar.id}
              title={calendar.title}
              subtitle={
                counted && categoryId !== UNKNOWN_CATEGORY_ID
                  ? `${calendar.source} · everything is ${getCategory(categoryId).name}`
                  : calendar.source
              }
              onPress={() => toggleCalendar(calendar.id, !counted)}
              leading={
                // Tinted with the calendar's own colour, as in v1 — recognisable before
                // the title is read.
                <View
                  style={[
                    styles.tick,
                    { borderColor: calendar.color },
                    counted && { backgroundColor: calendar.color },
                  ]}>
                  {counted && (
                    <Symbol name="checkmark" size={13} color={colors.onAccent} />
                  )}
                </View>
              }
              accessory={
                counted ? (
                  <Host matchContents>
                    <Picker
                      selectedValue={categoryId}
                      onValueChange={(value) =>
                        setCalendarCategory(calendar.id, String(value))
                      }>
                      {PICKER_ITEMS.map((item) => (
                        <Picker.Item
                          key={item.value}
                          label={item.label}
                          value={item.value}
                        />
                      ))}
                    </Picker>
                  </Host>
                ) : undefined
              }
            />
          )
        })}
      </ListGroup>
      <ListFootnote>
        Turn a calendar off to leave its events out of every report. Give one a category to
        file everything in it at once — a rule on a title still wins over it.
      </ListFootnote>
      {source.id === 'demo' && calendars.length > 0 && (
        <ListFootnote>
          These are the demo calendars. Everything you set here applies to your own the
          moment you grant access.
        </ListFootnote>
      )}

      <ListHeader title="Rules" />
      <ListGroup separatorInset={rules.length > 0 ? 'text' : 'full'}>
        {rules.length === 0 ? (
          <ListRow
            title="No rules yet"
            subtitle="Sorting your activities creates one per activity."
          />
        ) : (
          rules.map((activity) => {
            const category = getCategory(activity.categoryId)
            const color = categoryColor(category.color, scheme)
            return (
              <ListRow
                key={activity.id}
                title={category.name}
                subtitle={describeMatch(activity)}
                leading={
                  <View style={[styles.icon, { backgroundColor: color }]}>
                    <RawSymbol
                      pair={{ ios: category.sf, android: category.material }}
                      size={15}
                      color={colors.onAccent}
                    />
                  </View>
                }
                accessory={<Symbol name="remove" size={20} color={colors.destructive} />}
                onPress={() => removeRule(activity.id)}
                accessibilityLabel={`Remove rule: ${describeMatch(activity)} is ${category.name}`}
              />
            )
          })
        )}
      </ListGroup>
      <ListFootnote>
        More specific rules win, so an exact title always beats a broad match. Open an
        activity to widen its rule.
      </ListFootnote>

      <ListGroup style={styles.spaced}>
        <ListRow
          centeredAction
          title="Sort my activities"
          onPress={() => router.push('/categorize')}
        />
      </ListGroup>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tick: {
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: layout.iconSize / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
