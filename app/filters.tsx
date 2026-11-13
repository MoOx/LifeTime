import { Button, HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import { accessibilityIdentifier, font, foregroundStyle, tint } from '@expo/ui/swift-ui/modifiers'
import { router, Stack } from 'expo-router'

import { openAppSettings } from '@/data/calendar'
import { useWeekStartsOn } from '@/data/locale'
import { useNow } from '@/data/now'
import { useReport } from '@/data/report'
import { useSettings } from '@/data/settings'
import type { CalendarRef } from '@/domain/settings'
import { FormScreen, Section } from '@/ui/Form'

/**
 * Filters ("Customize report"): SCREENS.md §5, `Filters.res` on `main`, capture 17. One row
 * per calendar, its title and its source under it, and on the right a check in the
 * calendar's own colour; `Hide All` / `Show All` in the heading. Drawn by SwiftUI (D27).
 */
export default function Filters() {
  const { settings, update } = useSettings()
  const report = useReport(settings, useWeekStartsOn(), useNow())
  const skipped = new Set(settings.skippedCalendars.map((c) => c.id))
  const nothingSkipped = skipped.size === 0

  const toggle = (calendar: CalendarRef) =>
    update((s) => ({
      ...s,
      skippedCalendars: skipped.has(calendar.id)
        ? s.skippedCalendars.filter((c) => c.id !== calendar.id)
        : [...s.skippedCalendars, calendar],
    }))

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" onPress={() => router.back()}>
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <FormScreen testID="filters">
        {report.source === 'denied' ? (
          <Section footer="LifeTime has no access to your calendars.">
            <Button label="Open Settings" onPress={openAppSettings} />
          </Section>
        ) : (
          <Section
            title="Calendars"
            action={{
              // `Filters.res:20-52`: "Hide All" while nothing is skipped.
              label: nothingSkipped ? 'Hide All' : 'Show All',
              onPress: () =>
                update((s) => ({
                  ...s,
                  skippedCalendars: nothingSkipped ? report.calendars : [],
                })),
              testID: 'calendars-toggle-all',
            }}
            footer={report.calendars.length === 0 ? 'No calendars' : undefined}>
            {report.calendars.map((calendar) => {
              const shown = !skipped.has(calendar.id)
              return (
                <Button
                  key={calendar.id}
                  onPress={() => toggle(calendar)}
                  modifiers={[
                    tint('primary'),
                    accessibilityIdentifier(`calendar-${calendar.title}`),
                  ]}>
                  <HStack>
                    <VStack alignment="leading" spacing={2}>
                      <Text>{calendar.title}</Text>
                      {calendar.source ? (
                        <Text
                          modifiers={[
                            font({ textStyle: 'caption' }),
                            foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                          ]}>
                          {calendar.source}
                        </Text>
                      ) : null}
                    </VStack>
                    <Spacer />
                    <Image
                      systemName={shown ? 'checkmark.circle.fill' : 'circle'}
                      color={calendar.color}
                      size={22}
                    />
                  </HStack>
                </Button>
              )
            })}
          </Section>
        )}
      </FormScreen>
    </>
  )
}
