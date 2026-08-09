/**
 * Which calendars count towards the report. v1's `FiltersModalScreen`.
 *
 * Presented as a native sheet (`presentation: 'formSheet'` in `app/_layout.tsx`) rather
 * than v1's `#formSheet` plus a `StatusBarFormSheet` shim and an iOS-13 capability check.
 */

import { Host, List, ListItem, Switch } from '@expo/ui'
import { StyleSheet, View } from 'react-native'

import { useCalendarPermissions } from '@/data/calendars'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { useCalendarList } from '@/data/useCalendarList'
import { invalidateEvents } from '@/data/useEvents'
import { AppText } from '@/ui/AppText'
import { Section } from '@/ui/Section'
import { colors } from '@/ui/theme/colors'

export default function FiltersScreen() {
  const settings = useSettings()
  const update = useUpdateSettings()
  const [permission] = useCalendarPermissions()
  const calendars = useCalendarList(permission?.granted ?? false)

  const toggle = (id: string, visible: boolean) => {
    const calendar = calendars.find((c) => c.id === id)
    if (calendar === undefined) return
    update((current) => ({
      ...current,
      skippedCalendars: visible
        ? current.skippedCalendars.filter((c) => c.id !== id)
        : [...current.skippedCalendars, calendar],
    }))
    // Filtering happens in JS, but the set of calendars we query changes, so drop the
    // cached ranges.
    invalidateEvents()
  }

  return (
    <View style={styles.container}>
      <Section style={styles.header}>
        <AppText role="secondary" tone="secondary">
          Turn a calendar off to leave its events out of your reports.
        </AppText>
      </Section>
      <Host style={styles.list} useViewportSizeMeasurement>
        <List>
          {calendars.map((calendar) => (
            <ListItem
              key={calendar.id}
              supportingText={calendar.source}
              trailing={
                <Switch
                  value={!settings.skippedCalendars.some((c) => c.id === calendar.id)}
                  onValueChange={(visible) => toggle(calendar.id, visible)}
                />
              }>
              {calendar.title}
            </ListItem>
          ))}
        </List>
      </Host>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
  },
  list: {
    flex: 1,
  },
})
