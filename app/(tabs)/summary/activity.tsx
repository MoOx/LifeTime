import { Button, Capsule, HStack, Image, Picker, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  background,
  containerRelativeFrame,
  fixedSize,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  shapes,
  tag,
  textCase,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'
import { useColorScheme } from 'react-native'

import { alsoMatches, normalizeTitle, ruleFor, withRule, type MatchMode } from '@/domain/activities'
import { DEFAULT_CATEGORIES } from '@/domain/categories'
import { distinctTitles } from '@/domain/events'
import { resolve } from '@/domain/rules'
import { addDays, formatMinutes } from '@/domain/time'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useNow } from '@/data/now'
import { useReport } from '@/data/report'
import { useSettings } from '@/data/settings'
import { FormScreen, Section } from '@/ui/Form'
import { categoryColor, colors } from '@/ui/theme/colors'
import { layout } from '@/ui/theme/space'

const MODES: { mode: MatchMode; label: string }[] = [
  { mode: 'exact', label: 'Exact' },
  { mode: 'startsWith', label: 'Starts With' },
  { mode: 'endsWith', label: 'Ends With' },
  { mode: 'contains', label: 'Contains' },
]

/** The longest event's bar spans this share of the list's width (`Events.res`). */
const BAR_SHARE = 30

/**
 * Activity detail: SCREENS.md §4, `ActivityOptions.res` on `main`, capture 11. Small title
 * naming the activity, minimal back button (spec/30-screens.md). Drawn by SwiftUI (D27).
 *
 *   - **Category**: the nine categories, a check in the category's colour on the current
 *     one; a tap writes the rule for this title, replacing its previous one, and the Summary's
 *     chart follows (`withRule`).
 *   - **Match** (v2, kept by spec/30-screens.md): how the rule matches titles, with the
 *     titles it would also claim over the six weeks shown before it is widened (issue #13).
 *   - **Events**: the visible week's events behind the number (`Events.res`).
 *   - **Hide Activity** / **Reveal Activity**, with v1's footnotes.
 */
export default function Activity() {
  const { title = 'Activity', week } = useLocalSearchParams<{ title?: string; week?: string }>()
  const { settings, update } = useSettings()
  const locale = useLocaleTag()
  const now = useNow()
  const report = useReport(settings, useWeekStartsOn(), now)
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'

  const weekIndex = Math.max(
    0,
    report.weeks.findIndex((w) => String(w.start) === week),
  )
  const range = report.weeks[weekIndex] ?? report.weeks[report.weeks.length - 1]
  const pattern = normalizeTitle(title)

  const events = useMemo(
    () =>
      (report.rawByWeek[weekIndex] ?? [])
        .filter((e) => !e.allDay && normalizeTitle(e.title) === pattern)
        .sort((a, b) => b.start - a.start),
    [report.rawByWeek, weekIndex, pattern],
  )
  const calendarId = events[0]?.calendarId ?? ''
  const current = resolve({ title, calendarId }, report.rules).categoryId
  const mode = ruleFor(settings.activities, title)?.match ?? 'exact'
  const claimed = useMemo(
    () => alsoMatches({ title, match: mode }, distinctTitles(report.rawByWeek.flat())),
    [title, mode, report.rawByWeek],
  )
  const hidden = settings.skippedActivityTitles.some((t) => normalizeTitle(t) === pattern)

  const setRule = (categoryId: string, match: MatchMode) =>
    update((s) => ({
      ...s,
      activities: withRule(s.activities, title, categoryId, match, Date.now()),
    }))
  const toggleHidden = () =>
    update((s) => ({
      ...s,
      skippedActivityTitles: hidden
        ? s.skippedActivityTitles.filter((t) => normalizeTitle(t) !== pattern)
        : [...s.skippedActivityTitles, title],
    }))

  const longest = Math.max(1, ...events.map((e) => e.end - e.start))
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })
  const last = addDays(range.start, 6)
  const rangeLabel = `${new Date(range.start).getDate()} - ${date.format(new Date(last))}`

  return (
    <>
      <Stack.Screen options={{ title }} />
      <FormScreen testID="activity">
        <Section title="Category">
          {DEFAULT_CATEGORIES.map((category) => {
            const color = categoryColor(category.color, scheme)
            const selected = category.id === current
            return (
              <Button
                key={category.id}
                onPress={() => setRule(category.id, mode)}
                modifiers={[
                  tint('primary'),
                  accessibilityIdentifier(`category-${category.id}${selected ? '-selected' : ''}`),
                ]}>
                <HStack spacing={layout.iconGap}>
                  <Image
                    systemName={category.sf}
                    color="white"
                    size={15}
                    modifiers={[
                      frame({ width: layout.iconSize, height: layout.iconSize }),
                      background(
                        color,
                        shapes.roundedRectangle({
                          cornerRadius: 7,
                          roundedCornerStyle: 'continuous',
                        }),
                      ),
                    ]}
                  />
                  <Text>{category.name}</Text>
                  <Spacer />
                  <Image
                    systemName={selected ? 'checkmark.circle.fill' : 'circle'}
                    color={color}
                    size={24}
                  />
                </HStack>
              </Button>
            )
          })}
        </Section>

        <Section
          footer={
            claimed.length === 0
              ? `Matches only “${title}”.`
              : `Also matches ${claimed.length} other ${claimed.length === 1 ? 'activity' : 'activities'}: ${claimed.slice(0, 3).join(', ')}${claimed.length > 3 ? '…' : ''}`
          }>
          <Picker
            label="Match"
            selection={mode}
            onSelectionChange={(next: MatchMode) => setRule(current, next)}
            modifiers={[accessibilityIdentifier('match-mode')]}>
            {MODES.map(({ mode: value, label }) => (
              <Text key={value} modifiers={[tag(value)]}>
                {label}
              </Text>
            ))}
          </Picker>
        </Section>

        <Section
          title="Events"
          footer={
            events.length === 0
              ? 'You should add some events to your calendar or activate more calendars.'
              : undefined
          }>
          <Text modifiers={[font({ textStyle: 'subheadline' }), textCase('uppercase')]}>
            {rangeLabel}
          </Text>
          {events.length === 0 ? <Text>No events</Text> : null}
          {events.map((event) => {
            const span = Math.max(1, Math.round(((event.end - event.start) / longest) * BAR_SHARE))
            return (
              <HStack key={`${event.id}@${event.start}`}>
                <VStack alignment="leading" spacing={6}>
                  <Text>
                    {`${day.format(new Date(event.start))} - ${date.format(new Date(event.start))}`}
                  </Text>
                  <HStack spacing={6}>
                    <Capsule
                      modifiers={[
                        foregroundStyle(colors.fill),
                        containerRelativeFrame({
                          axes: 'horizontal',
                          count: 100,
                          span,
                          alignment: 'leading',
                        }),
                        frame({ height: 6 }),
                      ]}
                    />
                    <Text
                      modifiers={[
                        font({ textStyle: 'footnote' }),
                        foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                        monospacedDigit(),
                        // Never wrapped: at 40 % the bar left "7 h" on two lines.
                        fixedSize(),
                      ]}>
                      {formatMinutes((event.end - event.start) / 60_000)}
                    </Text>
                  </HStack>
                </VStack>
                <Spacer />
                <VStack alignment="trailing" spacing={2}>
                  <Text
                    modifiers={[
                      foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      monospacedDigit(),
                    ]}>
                    {time.format(new Date(event.start))}
                  </Text>
                  <Text modifiers={[monospacedDigit()]}>{time.format(new Date(event.end))}</Text>
                </VStack>
              </HStack>
            )
          })}
        </Section>

        <Section
          footer={
            hidden
              ? 'This will reveal similar activities in all reports.'
              : 'This will hide similar activities from all reports.'
          }>
          <Button
            role="destructive"
            onPress={toggleHidden}
            modifiers={[accessibilityIdentifier('toggle-activity-hidden')]}>
            <HStack>
              <Spacer />
              <Text>{hidden ? 'Reveal Activity' : 'Hide Activity'}</Text>
              <Spacer />
            </HStack>
          </Button>
        </Section>
      </FormScreen>
    </>
  )
}
