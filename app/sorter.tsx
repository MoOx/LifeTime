import { Button, HStack, Menu, Picker, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityElement,
  accessibilityIdentifier,
  accessibilityLabel,
  accessibilityValue,
  buttonBorderShape,
  buttonStyle,
  disabled,
  font,
  foregroundStyle,
  lineLimit,
  monospacedDigit,
  tag,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { router, Stack } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { useColorScheme } from 'react-native'

import { alsoMatches, inferRule, withRule, type MatchMode } from '@/domain/activities'
import { DEFAULT_CATEGORIES, getCategory, UNKNOWN_CATEGORY_ID } from '@/domain/categories'
import { distinctTitles } from '@/domain/events'
import { coverage, resolve, suggestAll, type Suggestion } from '@/domain/rules'
import { formatMinutes } from '@/domain/time'
import { useWeekStartsOn } from '@/data/locale'
import { useNow } from '@/data/now'
import { useReport } from '@/data/report'
import { useSettings } from '@/data/settings'
import { FormScreen, Section } from '@/ui/Form'
import { categoryColor, colors } from '@/ui/theme/colors'
import { layout } from '@/ui/theme/space'
import { CheckCircle, IconTile, selectionTraits } from '@/ui/Symbols'
import { useAccessibilityTextSize } from '@/ui/textSize'

const MODES: { mode: MatchMode; label: string }[] = [
  { mode: 'exact', label: 'Exact' },
  { mode: 'startsWith', label: 'Starts With' },
  { mode: 'endsWith', label: 'Ends With' },
  { mode: 'contains', label: 'Contains' },
]

const minutesOf = (event: { start: number; end: number }) => (event.end - event.start) / 60_000

/**
 * The Sorter: CATEGORISATION.md §3, spec/30-screens.md ("Sorter"), D26. New in this rebuild,
 * so no v1 capture. A sheet, `Sort Activities`, `Done`.
 *
 *   - **Coverage**: the share of logged minutes that has a category, the honest measure of
 *     how done this is, and `Accept All`, which applies every guess at once.
 *   - **To Sort**: every uncategorised title over the six weeks shown, heaviest first, frozen
 *     when the events arrive so rows never move under the thumb. Each carries a guess
 *     (keywords, `suggestAll`); choosing a category writes an `exact` rule.
 *   - **Select** (D26): pick several titles, `Make a Rule…` deduces one rule (`inferRule`),
 *     shows what else it would claim, and applies it to the chosen category, future events
 *     included. When nothing is shared, each title gets its own `exact` rule.
 */
export default function Sorter() {
  const { settings, update } = useSettings()
  const now = useNow()
  const report = useReport(settings, useWeekStartsOn(), now)
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const accessibilitySize = useAccessibilityTextSize()
  const events = useMemo(() => report.eventsByWeek.flat(), [report.eventsByWeek])

  const [rows, setRows] = useState<Suggestion[] | undefined>(undefined)
  // Frozen once the events are in: this screen's report starts empty and reads the calendar.
  useEffect(() => {
    if (rows === undefined && !report.loading && events.length > 0) {
      setRows(suggestAll(events, report.rules, minutesOf))
    }
  }, [rows, report.loading, events, report.rules])

  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  /** `rule` once `Make a Rule…` was tapped; `proposal` is null when nothing is shared. */
  const [step, setStep] = useState<'select' | 'rule'>('select')
  const [proposal, setProposal] = useState<{ title: string; match: MatchMode } | null>(null)

  const share = coverage(events, report.rules, minutesOf)
  const titles = useMemo(() => distinctTitles(events), [events])
  /** The rule that now sorts a row, its own or a broader one written since. */
  const sortedBy = (title: string) => {
    const resolution = resolve({ title, calendarId: '' }, report.rules)
    return resolution.source === 'activity' ? resolution.categoryId : undefined
  }
  const pending = (rows ?? []).filter(
    (row) => sortedBy(row.title) === undefined && row.categoryId !== UNKNOWN_CATEGORY_ID,
  )

  const answer = (title: string, categoryId: string) =>
    update((s) => ({
      ...s,
      activities: withRule(s.activities, title, categoryId, 'exact', Date.now()),
    }))
  const acceptAll = () =>
    update((s) => ({
      ...s,
      activities: pending.reduce(
        (activities, row) => withRule(activities, row.title, row.categoryId, 'exact', Date.now()),
        s.activities,
      ),
    }))
  const stopSelecting = () => {
    setSelecting(false)
    setSelected([])
    setStep('select')
    setProposal(null)
  }
  const makeRule = () => {
    setProposal(inferRule(selected) ?? null)
    setStep('rule')
  }
  const applyRule = (categoryId: string) => {
    update((s) => ({
      ...s,
      activities: proposal
        ? withRule(s.activities, proposal.title, categoryId, proposal.match, Date.now())
        : selected.reduce(
            (activities, title) => withRule(activities, title, categoryId, 'exact', Date.now()),
            s.activities,
          ),
    }))
    stopSelecting()
  }
  const claimed = proposal ? alsoMatches(proposal, titles).filter((t) => !selected.includes(t)) : []

  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => (selecting ? stopSelecting() : setSelecting(true))}>
          {selecting ? 'Cancel' : 'Select'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" onPress={() => router.back()}>
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <FormScreen testID="sorter">
        <Section>
          <VStack alignment="leading" spacing={6}>
            <Text
              modifiers={[
                font({ textStyle: 'footnote', weight: 'semibold' }),
                foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
              ]}>
              Categorized
            </Text>
            <Text
              modifiers={[
                font({ textStyle: 'largeTitle', weight: 'semibold', design: 'rounded' }),
                monospacedDigit(),
                accessibilityIdentifier('coverage'),
              ]}>
              {`${Math.floor(share * 100)}%`}
            </Text>
            <Text modifiers={[font({ textStyle: 'subheadline' })]}>
              of the time logged over these six weeks has a category.
            </Text>
            <Button
              label={pending.length > 0 ? `Accept All (${pending.length})` : 'Accept All'}
              onPress={acceptAll}
              modifiers={[
                buttonStyle('borderedProminent'),
                buttonBorderShape('capsule'),
                tint(colors.accent),
                disabled(pending.length === 0 || selecting),
                accessibilityIdentifier('accept-all'),
              ]}
            />
          </VStack>
        </Section>

        {selecting && step === 'select' ? (
          <Section footer="Select the activities one rule should cover. It will apply to future events too.">
            <HStack>
              <Text>{`${selected.length} selected`}</Text>
              <Spacer />
              <Button
                label="Make a Rule…"
                onPress={makeRule}
                modifiers={[
                  buttonStyle('borderless'),
                  disabled(selected.length === 0),
                  accessibilityIdentifier('make-rule'),
                ]}
              />
            </HStack>
          </Section>
        ) : null}

        {selecting && step === 'rule' && proposal ? (
          <Section
            title="Rule"
            footer={
              claimed.length === 0
                ? 'It claims only the selected activities, and future events like them.'
                : `Also matches ${claimed.length} other ${claimed.length === 1 ? 'activity' : 'activities'}: ${claimed.slice(0, 3).join(', ')}${claimed.length > 3 ? '…' : ''}`
            }>
            <HStack>
              <Text>Pattern</Text>
              <Spacer />
              <Text
                modifiers={[
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                  accessibilityIdentifier('rule-pattern'),
                ]}>
                {`“${proposal.title}”`}
              </Text>
            </HStack>
            <Picker
              label="Match"
              selection={proposal.match}
              onSelectionChange={(match: MatchMode) =>
                setProposal((p) => (p ? { ...p, match } : p))
              }
              modifiers={[accessibilityIdentifier('rule-mode')]}>
              {MODES.map(({ mode, label }) => (
                <Text key={mode} modifiers={[tag(mode)]}>
                  {label}
                </Text>
              ))}
            </Picker>
          </Section>
        ) : null}

        {selecting && step === 'rule' ? (
          <Section
            title="Category"
            footer={
              proposal
                ? undefined
                : 'These activities share no words: each gets a rule for its exact title.'
            }>
            {DEFAULT_CATEGORIES.filter((c) => c.id !== UNKNOWN_CATEGORY_ID).map((category) => (
              <Button
                key={category.id}
                onPress={() => applyRule(category.id)}
                modifiers={[
                  tint('primary'),
                  accessibilityIdentifier(`rule-category-${category.id}`),
                ]}>
                <HStack spacing={layout.iconGap}>
                  <IconTile icon={category.sf} color={categoryColor(category.color, scheme)} />
                  <Text>{category.name}</Text>
                  <Spacer />
                </HStack>
              </Button>
            ))}
          </Section>
        ) : null}

        <Section
          title="To Sort"
          footer={
            (rows ?? []).length === 0
              ? 'Everything is sorted.'
              : 'Choosing a category writes a rule for that exact title. Open an activity from the Summary to broaden it.'
          }>
          {(rows ?? []).map((row) => {
            const rule = sortedBy(row.title)
            const category = getCategory(rule ?? row.categoryId)
            const color = categoryColor(category.color, scheme)
            const isSelected = selected.includes(row.title)
            const label = (
              <HStack spacing={layout.iconGap}>
                {selecting ? (
                  <CheckCircle
                    selected={isSelected}
                    size={22}
                    color={isSelected ? colors.link : colors.tertiaryLabel}
                  />
                ) : null}
                <IconTile icon={category.sf} color={color} />
                {/*
                  One element for VoiceOver, "Gym, 10h 30m · Guess", whatever it makes of the
                  symbols beside it (slice 9).
                */}
                <VStack
                  alignment="leading"
                  spacing={2}
                  modifiers={[accessibilityElement('combine')]}>
                  {/* Whole at the accessibility sizes: "Cross…" did not say which (slice 9). */}
                  <Text modifiers={[lineLimit(accessibilitySize ? 3 : 1)]}>{row.title}</Text>
                  <Text
                    modifiers={[
                      font({ textStyle: 'footnote' }),
                      foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      monospacedDigit(),
                    ]}>
                    {`${formatMinutes(row.minutes)} · ${rule ? 'Sorted' : row.categoryId === UNKNOWN_CATEGORY_ID ? 'No guess' : 'Guess'}`}
                  </Text>
                </VStack>
                <Spacer />
              </HStack>
            )
            if (selecting) {
              return (
                <Button
                  key={row.title}
                  onPress={() =>
                    setSelected((list) =>
                      list.includes(row.title)
                        ? list.filter((t) => t !== row.title)
                        : [...list, row.title],
                    )
                  }
                  modifiers={[
                    tint('primary'),
                    selectionTraits(isSelected),
                    accessibilityIdentifier(`sort-select-${row.title}${isSelected ? '-on' : ''}`),
                  ]}>
                  {label}
                </Button>
              )
            }
            const menu = (
              <Menu
                label={category.id === UNKNOWN_CATEGORY_ID ? 'Choose' : category.name}
                modifiers={[
                  // "Exercise" alone does not say what it changes (slice 9).
                  accessibilityLabel(`Category for ${row.title}`),
                  accessibilityValue(category.id === UNKNOWN_CATEGORY_ID ? 'None' : category.name),
                  accessibilityIdentifier(`sort-row-${row.title}${rule ? '-sorted' : ''}`),
                ]}>
                {DEFAULT_CATEGORIES.filter((c) => c.id !== UNKNOWN_CATEGORY_ID).map((c) => (
                  <Button key={c.id} label={c.name} onPress={() => answer(row.title, c.id)} />
                ))}
              </Menu>
            )
            // At the accessibility text sizes the menu goes under the title, which it squeezed.
            return accessibilitySize ? (
              <VStack key={row.title} alignment="leading" spacing={8}>
                {label}
                {menu}
              </VStack>
            ) : (
              <HStack key={row.title}>
                {label}
                {menu}
              </HStack>
            )
          })}
        </Section>
      </FormScreen>
    </>
  )
}
