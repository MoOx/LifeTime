import { Button, HStack, Image, Picker, Text, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  background,
  font,
  foregroundStyle,
  frame,
  shapes,
  tag,
  tint,
} from '@expo/ui/swift-ui/modifiers'
import { router, Stack } from 'expo-router'
import { useMemo } from 'react'
import type { SFSymbol } from 'sf-symbols-typescript'

import { goalEvents } from '@/domain/events'
import { computeProgress, goalMinutes, goalRanges, type RingMode } from '@/domain/goals'
import { useLocaleTag, useWeekStartsOn } from '@/data/locale'
import { useNow } from '@/data/now'
import { useReport } from '@/data/report'
import { useSettings } from '@/data/settings'
import { GoalCard } from '@/features/goals/GoalCard'
import { FormScreen, Section } from '@/ui/Form'
import { CATEGORY_PALETTE } from '@/ui/theme/colors'
import { layout } from '@/ui/theme/space'

/** v1's two paragraphs (`Goals.res:93-154`), "help your to" corrected. */
const INTRO = [
  'LifeTime lets you visualize the time you spend on everything. This allows you to take more informed decisions about how to use your valuable time.',
  'You can help yourself by adding goals & limits you would like to respect. LifeTime will try to remind you when you successfully achieve your goals & respect your limits and can help you to improve your self-discipline if needed.',
]

const RING_MODES: { mode: RingMode; label: string; footer: string }[] = [
  {
    mode: 'period',
    label: 'Entire Week',
    footer:
      'Rings fill across the whole week: empty on its first morning, full when the week is done.',
  },
  {
    mode: 'pace',
    label: 'Current Progress',
    footer: 'Rings fill against what is due by tonight: full means on track right now.',
  },
]

/**
 * Goals: SCREENS.md §7, `Goals.res` on `main`, captures 05 and 21. Large title, `+` trailing
 * (spec/30-screens.md). With no goal, v1's introduction and its two entry points, a goal
 * and a limit, kept apart as v1 did. Otherwise, how the rings read (spec/30-screens.md,
 * "Goals ring": v2's switch, `period` by default), then one card per goal, in the Health
 * style (INTENT.md D28).
 */
export default function Goals() {
  const { settings, update } = useSettings()
  const weekStartsOn = useWeekStartsOn()
  const locale = useLocaleTag()
  const now = useNow()
  const report = useReport(settings, weekStartsOn, now)

  const cards = useMemo(() => {
    const events = goalEvents(
      report.rawByWeek[report.rawByWeek.length - 1] ?? [],
      report.filter,
      report.rules,
    )
    return settings.goals.map((goal) => {
      const { period, counted } = goalRanges(goal, now, weekStartsOn)
      const current = goalMinutes(goal, events, report.rules, counted)
      return { goal, progress: computeProgress(goal, current, period, now) }
    })
  }, [settings.goals, report.rawByWeek, report.filter, report.rules, now, weekStartsOn])

  const ringMode = RING_MODES.find((m) => m.mode === settings.ringMode) ?? RING_MODES[0]

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="plus" onPress={() => router.push('/goal')}>
          New Goal
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <FormScreen testID="goals">
        {cards.length === 0 ? (
          <>
            <Section
              header={
                <VStack alignment="leading" spacing={10}>
                  {INTRO.map((paragraph) => (
                    <Text
                      key={paragraph}
                      modifiers={[
                        font({ textStyle: 'subheadline' }),
                        foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                      ]}>
                      {paragraph}
                    </Text>
                  ))}
                </VStack>
              }
            />
            <Section title="Minimum to Achieve">
              <AddRow
                label="Add a Goal"
                icon="scope"
                color={CATEGORY_PALETTE.green.light}
                onPress={() => router.push({ pathname: '/goal', params: { mode: 'goal' } })}
                testID="add-goal"
              />
            </Section>
            <Section title="Maximum to Respect">
              <AddRow
                label="Add a Limit"
                icon="hourglass"
                color={CATEGORY_PALETTE.orange.light}
                onPress={() => router.push({ pathname: '/goal', params: { mode: 'limit' } })}
                testID="add-limit"
              />
            </Section>
          </>
        ) : (
          <>
            <Section footer={ringMode.footer}>
              <Picker
                label="Rings Show"
                selection={ringMode.mode}
                onSelectionChange={(mode: RingMode) => update((s) => ({ ...s, ringMode: mode }))}
                modifiers={[accessibilityIdentifier('ring-mode')]}>
                {RING_MODES.map(({ mode, label }) => (
                  <Text key={mode} modifiers={[tag(mode)]}>
                    {label}
                  </Text>
                ))}
              </Picker>
            </Section>
            {cards.map(({ goal, progress }) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                progress={progress}
                ringMode={ringMode.mode}
                activities={settings.activities}
                locale={locale}
                onPress={() => router.push({ pathname: '/goal', params: { id: goal.id } })}
              />
            ))}
          </>
        )}
      </FormScreen>
    </>
  )
}

/** v1's rows: an icon tile in green or orange, then the label (`Goals.res:123-150`). */
function AddRow({
  label,
  icon,
  color,
  onPress,
  testID,
}: {
  label: string
  icon: SFSymbol
  color: string
  onPress: () => void
  testID: string
}) {
  return (
    <Button onPress={onPress} modifiers={[tint('primary'), accessibilityIdentifier(testID)]}>
      <HStack spacing={layout.iconGap}>
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
        <Text>{label}</Text>
      </HStack>
    </Button>
  )
}
