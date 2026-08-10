/**
 * "Customize report" — one place for every rule that decides what a week looks like.
 *
 * v1's equivalent was a list of calendars with a switch each. Two things are added, and
 * they are the two the app most needed:
 *
 *   • **A calendar can carry a category.** "Everything in my work calendar is Work" is
 *     one tap and categorises hundreds of events. For anyone whose work already lives in
 *     its own calendar, that is the entire setup.
 *
 *   • **Rules can be broader than an exact title.** "Anything starting with `1:1`" —
 *     issue #13, promised in v1's own help text and never built.
 *
 * Everything here is `@expo/ui`: a real inset-grouped list on iOS, a Material 3 list on
 * Android. Row heights, separator insets, press states, section headers and footers all
 * come from the OS, so this screen is one of the places the hybrid split pays off most.
 */

import { Button, Host, List, ListItem, Picker, Switch } from '@expo/ui'
import { useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { useCalendarPermissions } from '@/data/calendars'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { useCalendarList } from '@/data/useCalendarList'
import { invalidateEvents } from '@/data/useEvents'
import { describeMatch } from '@/domain/activities'
import { DEFAULT_CATEGORIES, UNKNOWN_CATEGORY_ID, getCategory } from '@/domain/categories'
import { colors } from '@/ui/theme/colors'

/** "No category" first, then the real ones, so the picker can also clear a rule. */
const PICKER_ITEMS = [
  { label: 'No category', value: UNKNOWN_CATEGORY_ID },
  ...DEFAULT_CATEGORIES.filter((c) => c.id !== UNKNOWN_CATEGORY_ID).map((c) => ({
    label: c.name,
    value: c.id,
  })),
]

function CategoryPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (categoryId: string) => void
}) {
  return (
    <Picker selectedValue={value} onValueChange={(v) => onChange(String(v))}>
      {PICKER_ITEMS.map((item) => (
        <Picker.Item key={item.value} label={item.label} value={item.value} />
      ))}
    </Picker>
  )
}

export default function FiltersScreen() {
  const settings = useSettings()
  const update = useUpdateSettings()
  const router = useRouter()
  const [permission] = useCalendarPermissions()
  const calendars = useCalendarList(permission?.granted ?? false)

  const countedCalendars = useMemo(
    () => calendars.filter((c) => !settings.skippedCalendars.some((s) => s.id === c.id)),
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

  const setCalendarCategory = useCallback(
    (calendarId: string, categoryId: string) => {
      update((current) => {
        const next = { ...current.calendarCategories }
        if (categoryId === UNKNOWN_CATEGORY_ID) delete next[calendarId]
        else next[calendarId] = categoryId
        return { ...current, calendarCategories: next }
      })
    },
    [update],
  )

  const removeRule = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        activities: current.activities.filter((a) => a.id !== id),
      }))
    },
    [update],
  )

  return (
    <View style={styles.screen}>
      <Host style={styles.list} useViewportSizeMeasurement>
        <List>
          <ListItem supportingText="Turn a calendar off to leave its events out of every report. Give it a category to file everything in it at once.">
            Calendars
          </ListItem>

          {calendars.map((calendar) => {
            const counted = !settings.skippedCalendars.some((c) => c.id === calendar.id)
            const categoryId =
              settings.calendarCategories[calendar.id] ?? UNKNOWN_CATEGORY_ID
            return (
              <ListItem
                key={calendar.id}
                supportingText={
                  counted
                    ? categoryId === UNKNOWN_CATEGORY_ID
                      ? calendar.source
                      : `${calendar.source} · everything is ${getCategory(categoryId).name}`
                    : 'Not counted'
                }
                trailing={
                  counted ? (
                    <CategoryPicker
                      value={categoryId}
                      onChange={(next) => setCalendarCategory(calendar.id, next)}
                    />
                  ) : (
                    <Switch
                      value={false}
                      onValueChange={() => toggleCalendar(calendar.id, true)}
                    />
                  )
                }
                onPress={() => toggleCalendar(calendar.id, !counted)}>
                {calendar.title}
              </ListItem>
            )
          })}

          <ListItem supportingText="A rule matches event titles and files them automatically. More specific rules win, so an exact match always beats a broad one.">
            Rules
          </ListItem>

          {settings.activities.length === 0 && (
            <ListItem supportingText="Sort your activities to create some.">
              No rules yet
            </ListItem>
          )}

          {settings.activities.map((activity) => (
            <ListItem
              key={activity.id}
              supportingText={describeMatch(activity)}
              trailing={
                <Button
                  variant="text"
                  label="Remove"
                  onPress={() => removeRule(activity.id)}
                />
              }>
              {getCategory(activity.categoryId).name}
            </ListItem>
          ))}

          <ListItem
            supportingText={`Go through everything from the last ${settings.categorisationWeeks} weeks, biggest first.`}
            onPress={() => router.push('/categorize')}>
            Sort my activities
          </ListItem>

          <ListItem supportingText={`${countedCalendars.length} of ${calendars.length} calendars counted`}>
            Summary
          </ListItem>
        </List>
      </Host>
    </View>
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
