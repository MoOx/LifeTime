import {
  Button,
  HStack,
  Image,
  LabeledContent,
  Slider,
  Spacer,
  Text,
  TextField,
  useNativeState,
  VStack,
} from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  accessibilityLabel,
  background,
  buttonStyle,
  font,
  foregroundStyle,
  frame,
  monospacedDigit,
  padding,
  shapes,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert, useColorScheme } from 'react-native'
import type { SFSymbol } from 'sf-symbols-typescript'

import { DEFAULT_CATEGORIES, type CategoryId } from '@/domain/categories'
import {
  ALL_DAYS,
  makeGoal,
  missingParts,
  updateGoal,
  type Goal,
  type GoalMode,
} from '@/domain/goals'
import { formatMinutes } from '@/domain/time'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useSettings } from '@/data/settings'
import { FormScreen, Section } from '@/ui/Form'
import { CATEGORY_PALETTE, categoryColor, colors } from '@/ui/theme/colors'
import { layout } from '@/ui/theme/space'

/** v1's quick durations (`GoalEdit.res:242-287`, capture 06). */
const QUICK = [30, 45, 60, 90]

const TYPES: { mode: GoalMode; label: string; icon: SFSymbol; color: string }[] = [
  { mode: 'goal', label: 'Goal to Reach', icon: 'scope', color: CATEGORY_PALETTE.green.light },
  {
    mode: 'limit',
    label: 'Limit to Respect',
    icon: 'hourglass',
    color: CATEGORY_PALETTE.orange.light,
  },
]

/**
 * The goal editor: SCREENS.md §8, `GoalEdit.res` on `main`, captures 06, 20 and 22. A sheet
 * with `Cancel` and `Add` (or `Save` when editing), `Add` disabled until the goal is valid
 * and a red footnote naming what is missing (spec/30-screens.md: v1 only disabled `Add`).
 * Drawn by SwiftUI (D27): this is a settings-like screen, so it stays a grouped list (D28).
 */
export default function GoalEditor() {
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: GoalMode }>()
  const { settings, update } = useSettings()
  const locale = useLocaleTag()
  const weekStartsOn = useWeekStartsOn()
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const existing = settings.goals.find((g) => g.id === id)

  const [draft, setDraft] = useState<Goal>(
    () =>
      existing ??
      makeGoal(
        {
          title: '',
          mode: mode === 'limit' ? 'limit' : 'goal',
          days: [...ALL_DAYS],
          durationPerDay: 0,
          categoryIds: [],
          activityIds: [],
          period: 'week',
        },
        Date.now(),
        `goal_${Date.now().toString(36)}`,
      ),
  )
  const title = useNativeState(draft.title)
  const set = (patch: Partial<Goal>) => setDraft((goal) => updateGoal(goal, patch))
  const missing = missingParts(draft)
  const scheduled = draft.days.filter(Boolean).length

  const save = () => {
    update((s) => ({
      ...s,
      goals: existing ? s.goals.map((g) => (g.id === draft.id ? draft : g)) : [...s.goals, draft],
    }))
    router.back()
  }
  // v1's confirmation (`GoalEdit.res:513-532`).
  const remove = () =>
    Alert.alert('Delete This Goal', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== draft.id) }))
          router.back()
        },
      },
    ])

  const toggle = <T,>(list: readonly T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

  // Days in the week's order for this locale; v1 always started on Sunday.
  const order = Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7)
  const dayName = (index: number, style: 'short' | 'long') =>
    new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' }).format(
      // 2026-01-04 is a Sunday.
      new Date(Date.UTC(2026, 0, 4 + index)),
    )

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit Goal' : 'New Goal' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" disabled={missing.length > 0} onPress={save}>
          {existing ? 'Save' : 'Add'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <FormScreen testID="goal">
        <Section>
          <TextField
            text={title}
            placeholder="Title (Optional)"
            onTextChange={(text) => set({ title: text })}
            modifiers={[accessibilityIdentifier('goal-title')]}
          />
        </Section>

        <Section title="Type">
          {TYPES.map((type) => (
            <Button
              key={type.mode}
              onPress={() => set({ mode: type.mode })}
              modifiers={[
                tint('primary'),
                accessibilityIdentifier(
                  `goal-type-${type.mode}${draft.mode === type.mode ? '-selected' : ''}`,
                ),
              ]}>
              <HStack spacing={layout.iconGap}>
                <IconTile icon={type.icon} color={type.color} />
                <Text>{type.label}</Text>
                <Spacer />
                {draft.mode === type.mode ? (
                  <Image
                    systemName="checkmark"
                    modifiers={[font({ weight: 'semibold' }), foregroundStyle(colors.link)]}
                  />
                ) : null}
              </HStack>
            </Button>
          ))}
        </Section>

        <Section title="Days" footer="Select the days where you would like to respect this goal.">
          <HStack>
            {order.map((index, position) => (
              <HStack key={index} spacing={0}>
                {position > 0 ? <Spacer /> : null}
                <VStack spacing={6}>
                  <Text
                    modifiers={[
                      font({ textStyle: 'caption' }),
                      foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                    ]}>
                    {dayName(index, 'short')}
                  </Text>
                  <Button
                    onPress={() =>
                      set({ days: draft.days.map((on, i) => (i === index ? !on : on)) })
                    }
                    modifiers={[
                      buttonStyle('plain'),
                      accessibilityLabel(dayName(index, 'long')),
                      accessibilityIdentifier(`goal-day-${index}${draft.days[index] ? '-on' : ''}`),
                    ]}>
                    <Image
                      systemName={draft.days[index] ? 'checkmark.circle.fill' : 'circle'}
                      size={30}
                      color={draft.days[index] ? colors.link : colors.tertiaryLabel}
                    />
                  </Button>
                </VStack>
              </HStack>
            ))}
          </HStack>
        </Section>

        <Section
          title="Duration"
          footer="Goals are measured on a weekly basis. The time spent on an entire week is what matters to achieve your goal.">
          <HStack>
            {QUICK.map((minutes, position) => (
              <HStack key={minutes} spacing={0}>
                {position > 0 ? <Spacer /> : null}
                <Button
                  label={`${minutes}min`}
                  onPress={() => set({ durationPerDay: minutes })}
                  modifiers={[
                    buttonStyle('borderless'),
                    font({ textStyle: 'subheadline', weight: 'semibold' }),
                    accessibilityIdentifier(`goal-quick-${minutes}`),
                  ]}
                />
              </HStack>
            ))}
          </HStack>
          {/* v1's slider: 0 to 24 h by quarter hours (`GoalEdit.res:288-300`). */}
          <Slider
            value={draft.durationPerDay}
            min={0}
            max={1440}
            step={15}
            onValueChange={(value) => set({ durationPerDay: Math.round(value) })}
            minimumValueLabel={<Text>0</Text>}
            maximumValueLabel={<Text>24</Text>}
            modifiers={[accessibilityIdentifier('goal-duration-slider')]}
          />
          <LabeledContent label="Average Time per Day">
            <Text modifiers={[monospacedDigit()]}>{formatMinutes(draft.durationPerDay)}</Text>
          </LabeledContent>
          <LabeledContent label={draft.mode === 'goal' ? 'Weekly Goal' : 'Weekly Limit'}>
            <Text modifiers={[monospacedDigit(), accessibilityIdentifier('goal-weekly')]}>
              {formatMinutes(draft.durationPerDay * scheduled)}
            </Text>
          </LabeledContent>
        </Section>

        <Section
          title="Category or Activity"
          footer="By selecting a category, all future activities in that category will be included.">
          {DEFAULT_CATEGORIES.map((category) => {
            const color = categoryColor(category.color, scheme)
            const selected = draft.categoryIds.includes(category.id)
            const filed = settings.activities.filter((a) => a.categoryId === category.id)
            return [
              <CheckRow
                key={category.id}
                label={category.name}
                selected={selected}
                color={color}
                icon={category.sf}
                onPress={() =>
                  set({ categoryIds: toggle<CategoryId>(draft.categoryIds, category.id) })
                }
                testID={`goal-category-${category.id}`}
              />,
              // The activities filed under it, indented (v1 expanded them under the category).
              ...filed.map((activity) => (
                <CheckRow
                  key={activity.id}
                  label={activity.title}
                  selected={draft.activityIds.includes(activity.id)}
                  color={color}
                  indent
                  onPress={() => set({ activityIds: toggle(draft.activityIds, activity.id) })}
                  testID={`goal-activity-${activity.title}`}
                />
              )),
            ]
          })}
        </Section>

        {missing.length > 0 ? (
          <Section>
            <Text
              modifiers={[
                font({ textStyle: 'footnote' }),
                foregroundStyle(colors.destructive),
                accessibilityIdentifier('goal-missing'),
              ]}>
              {`To ${existing ? 'save' : 'add'} this goal, choose ${missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}` : missing[0]}.`}
            </Text>
          </Section>
        ) : null}

        {existing ? (
          <Section>
            <Button
              role="destructive"
              onPress={remove}
              modifiers={[accessibilityIdentifier('goal-delete')]}>
              <HStack>
                <Spacer />
                <Text>Delete This Goal</Text>
                <Spacer />
              </HStack>
            </Button>
          </Section>
        ) : null}
      </FormScreen>
    </>
  )
}

function IconTile({ icon, color }: { icon: SFSymbol; color: string }) {
  return (
    <Image
      systemName={icon}
      color="white"
      size={15}
      modifiers={[
        frame({ width: layout.iconSize, height: layout.iconSize }),
        background(
          color,
          shapes.roundedRectangle({ cornerRadius: 7, roundedCornerStyle: 'continuous' }),
        ),
      ]}
    />
  )
}

/** v1's rows: a circle to tick, the category's icon, its name (capture 06). */
function CheckRow({
  label,
  selected,
  color,
  icon,
  indent = false,
  onPress,
  testID,
}: {
  label: string
  selected: boolean
  color: string
  icon?: SFSymbol
  indent?: boolean
  onPress: () => void
  testID: string
}) {
  return (
    <Button
      onPress={onPress}
      modifiers={[
        tint('primary'),
        accessibilityIdentifier(`${testID}${selected ? '-selected' : ''}`),
      ]}>
      <HStack spacing={layout.iconGap} modifiers={indent ? [padding({ leading: 40 })] : []}>
        <Image systemName={selected ? 'checkmark.circle.fill' : 'circle'} color={color} size={24} />
        {icon ? <IconTile icon={icon} color={color} /> : null}
        <Text>{label}</Text>
        <Spacer />
      </HStack>
    </Button>
  )
}
