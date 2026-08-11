/**
 * Sort everything at once.
 *
 * This screen is the answer to why v1 never got past its author. Categorising in v1 meant
 * opening one activity at a time from the Summary, and a real calendar has hundreds of
 * distinct titles. Here every uncategorised title in the window is listed once, heaviest
 * first, with a category already guessed — so the six hours of "Deep work" get sorted
 * before the twenty minutes of "Charge airpods", and most of a calendar is done in a
 * couple of minutes.
 *
 * The wand accepts every guess in one tap. It is deliberately *accept*, not *apply*: the
 * guesses stay visible and reversible, and nothing is written until asked.
 *
 * The guesses come from a keyword table today. The screen is shaped so that swapping in
 * an on-device model — Apple's Foundation Models on iOS 26, ML Kit GenAI on Android —
 * changes only where `Suggestion.categoryId` comes from: same list, same rows, same
 * accept-all. See docs/CATEGORISATION.md.
 */

import { Host, Picker } from '@expo/ui'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useCalendarPermissions } from '@/data/calendars'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import { sourceFor } from '@/data/source'
import { invalidateEvents, useEventRanges } from '@/data/useEvents'
import { rulesOf, useActiveCalendarIds } from '@/data/useReport'
import { makeActivityId } from '@/domain/activities'
import { minutesInRange } from '@/domain/aggregate'
import { DEFAULT_CATEGORIES, UNKNOWN_CATEGORY_ID, getCategory } from '@/domain/categories'
import { filterEvents } from '@/domain/events'
import { type Suggestion, coverage, suggestAll } from '@/domain/rules'
import { formatMinutes } from '@/domain/time'
import { AppText } from '@/ui/AppText'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { RawSymbol, Symbol } from '@/ui/Symbol'
import { categoryColor, colors } from '@/ui/theme/colors'
import { layout, space } from '@/ui/theme/space'

const PICKER_ITEMS = [
  { label: 'Skip', value: UNKNOWN_CATEGORY_ID },
  ...DEFAULT_CATEGORIES.filter((c) => c.id !== UNKNOWN_CATEGORY_ID).map((c) => ({
    label: c.name,
    value: c.id,
  })),
]

export default function CategorizeScreen() {
  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const update = useUpdateSettings()
  const router = useRouter()
  const [permission] = useCalendarPermissions()
  const source = sourceFor(permission?.granted ?? false)
  const activeCalendarIds = useActiveCalendarIds(source, settings)

  const now = useMemo(() => Date.now(), [])
  const range = useMemo(
    () => ({ start: now - settings.categorisationWeeks * 7 * 86_400_000, end: now }),
    [now, settings.categorisationWeeks],
  )

  const ranges = useMemo(() => [range], [range])
  const events = useEventRanges(source, activeCalendarIds, ranges).byRange[0]

  const rules = useMemo(
    () => rulesOf(settings, source.id === 'demo'),
    [settings, source],
  )

  const visible = useMemo(
    () =>
      events === undefined
        ? undefined
        : filterEvents(events, {
            skippedCalendarIds: settings.skippedCalendars.map((c) => c.id),
            // Hidden activities are exactly the ones worth sorting, so nothing is
            // filtered out here on the grounds of being hidden.
            skippedActivityTitles: [],
            hideSkippedActivities: false,
          }),
    [events, settings.skippedCalendars],
  )

  /**
   * The list is frozen once, when the events arrive. Recomputing it on every choice would
   * make each row vanish the instant it was answered, which is disorienting and makes the
   * remaining count jump around under the user's thumb.
   */
  const [queue, setQueue] = useState<Suggestion[] | undefined>(undefined)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    if (visible === undefined || queue !== undefined) return
    setQueue(suggestAll(visible, rules, (event) => minutesInRange(event, range)))
  }, [visible, queue, rules, range])

  const done = useMemo(
    () =>
      visible === undefined
        ? 0
        : coverage(visible, rules, (event) => minutesInRange(event, range)),
    [visible, rules, range],
  )

  const pending = useMemo(
    () => (queue ?? []).filter((s) => answers[s.title] === undefined),
    [queue, answers],
  )

  const guessable = useMemo(() => pending.filter((s) => s.source === 'keyword'), [pending])

  /** Writes one rule per answered title, as an exact match. Broaden it from its row. */
  const commit = useCallback(
    (chosen: Record<string, string>) => {
      const entries = Object.entries(chosen).filter(
        ([, categoryId]) => categoryId !== UNKNOWN_CATEGORY_ID,
      )
      if (entries.length === 0) return

      update((current) => {
        const activities = [...current.activities]
        for (const [title, categoryId] of entries) {
          const existing = activities.findIndex(
            (a) => a.match === 'exact' && a.title === title,
          )
          const activity = {
            id:
              existing >= 0
                ? activities[existing]!.id
                : makeActivityId(title, Date.now() + activities.length),
            title,
            match: 'exact' as const,
            categoryId,
            createdAt: existing >= 0 ? activities[existing]!.createdAt : Date.now(),
          }
          if (existing >= 0) activities[existing] = activity
          else activities.push(activity)
        }
        return { ...current, activities }
      })
      invalidateEvents()
    },
    [update],
  )

  const answer = useCallback(
    (title: string, categoryId: string) => {
      setAnswers((current) => ({ ...current, [title]: categoryId }))
      commit({ [title]: categoryId })
    },
    [commit],
  )

  const acceptAllGuesses = useCallback(() => {
    const chosen: Record<string, string> = {}
    for (const suggestion of guessable) chosen[suggestion.title] = suggestion.categoryId
    setAnswers((current) => ({ ...current, ...chosen }))
    commit(chosen)
  }, [guessable, commit])

  if (queue === undefined) {
    return (
      <View style={styles.centered}>
        <AppText role="secondary" tone="secondary">
          {`Reading the last ${settings.categorisationWeeks} weeks…`}
        </AppText>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
      contentInsetAdjustmentBehavior="automatic">
      {/* Progress before the work, so the screen answers "how much is left" at a glance
          rather than after counting rows. */}
      <View style={styles.progress}>
        <AppText role="metric" tabular>
          {`${Math.round(done * 100)}%`}
        </AppText>
        <AppText role="secondary" tone="secondary">
          {pending.length === 0
            ? 'of your time is categorised. Nothing left to sort.'
            : `of your time is categorised — ${pending.length} ${
                pending.length === 1 ? 'activity' : 'activities'
              } to go.`}
        </AppText>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(done * 100)}%` }]} />
        </View>
      </View>

      {guessable.length > 0 && (
        <>
          <ListGroup style={styles.spaced}>
            <ListRow
              symbol="magicWand"
              title={`Accept ${guessable.length} suggestion${guessable.length === 1 ? '' : 's'}`}
              subtitle="Applies every guess below at once"
              onPress={acceptAllGuesses}
            />
          </ListGroup>
          <ListFootnote>
            Nothing is permanent — change any of them afterwards, from the row or from the
            activity's own screen.
          </ListFootnote>
        </>
      )}

      <ListHeader title={pending.length === 0 ? 'Sorted' : 'Biggest first'} />
      <ListGroup separatorInset="text">
        {queue.map((suggestion) => {
          const chosen = answers[suggestion.title]
          const value = chosen ?? suggestion.categoryId
          const category = getCategory(value)
          const settled = chosen !== undefined && chosen !== UNKNOWN_CATEGORY_ID
          const color = categoryColor(category.color, 'light')

          return (
            <ListRow
              key={suggestion.title}
              title={suggestion.title}
              subtitle={
                settled
                  ? `${category.name} · tap to match more titles`
                  : `${formatMinutes(suggestion.minutes)} over ${suggestion.count} ${
                      suggestion.count === 1 ? 'event' : 'events'
                    }${suggestion.source === 'keyword' ? ' · suggested' : ''}`
              }
              onPress={() =>
                router.push({
                  pathname: '/activity/[title]',
                  params: { title: suggestion.title },
                })
              }
              leading={
                settled ? (
                  <View style={[styles.icon, { backgroundColor: color }]}>
                    <RawSymbol
                      pair={{ ios: category.sf, android: category.material }}
                      size={15}
                      color={colors.onAccent}
                    />
                  </View>
                ) : (
                  <View style={styles.iconEmpty}>
                    <Symbol name="category" size={15} color={colors.tertiaryLabel} />
                  </View>
                )
              }
              accessory={
                <Host matchContents>
                  <Picker
                    selectedValue={value}
                    onValueChange={(next) => answer(suggestion.title, String(next))}>
                    {PICKER_ITEMS.map((item) => (
                      <Picker.Item key={item.value} label={item.label} value={item.value} />
                    ))}
                  </Picker>
                </Host>
              }
            />
          )
        })}
      </ListGroup>
      <ListFootnote>
        Sorted by how much time each one accounts for, so the decisions that change your
        chart come first.
      </ListFootnote>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
    backgroundColor: colors.background,
  },
  progress: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    gap: space.xxs,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.fill,
    overflow: 'hidden',
    marginTop: space.sm,
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  icon: {
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: layout.iconSize / 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmpty: {
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: layout.iconSize / 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fill,
  },
  spaced: {
    marginTop: space.lg,
  },
})
