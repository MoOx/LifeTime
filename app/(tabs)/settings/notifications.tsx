import { Button, DatePicker, HStack, Spacer, Text, Toggle, VStack } from '@expo/ui/swift-ui'
import {
  accessibilityIdentifier,
  labelStyle,
  buttonStyle,
  disabled,
  font,
  foregroundStyle,
  monospacedDigit,
  opacity,
} from '@expo/ui/swift-ui/modifiers'
import { useState } from 'react'
import { Alert } from 'react-native'

import {
  MINIMUM_GAP_MINUTES,
  addReminder,
  hasReminder,
  nextOccurrence,
  removeReminder,
  sortReminders,
} from '@/domain/reminders'
import type { Reminder } from '@/domain/settings'
import { formatUpdated } from '@/domain/time'
import { useLocaleTag } from '@/data/locale'
import { useNow } from '@/data/now'
import {
  openNotificationSettings,
  requestNotificationAccess,
  useNotificationAccess,
} from '@/data/notifications'
import { useSettings } from '@/data/settings'
import { FormScreen, Row, Section } from '@/ui/Form'
import { useAccessibilityTextSize } from '@/ui/textSize'

/**
 * Notifications: SCREENS.md §10b, `SettingsNotifications.res` on `main`, capture 33.
 * `Allow Notifications` mirrors the system permission: turning it on asks iOS (D20), or opens
 * the app's settings once refused. `Daily Reminders`, then the reminders sorted by time, each
 * saying when it next fires; a swipe removes one. `Add a New Reminder` shows a time picker
 * with `Cancel` / `Add`, and a duplicate is refused with v1's alert. The schedule itself is
 * `src/data/notifications.ts`.
 */
export default function Notifications() {
  const { settings, update } = useSettings()
  const access = useNotificationAccess()
  const locale = useLocaleTag()
  const now = useNow()
  const accessibilitySize = useAccessibilityTextSize()
  const [adding, setAdding] = useState<Date | undefined>(undefined)
  const allowed = access === 'granted'
  const active = allowed && settings.remindersEnabled
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })

  const onAllow = async (on: boolean) => {
    if (!on) return openNotificationSettings()
    const result = await requestNotificationAccess()
    if (result === 'denied') openNotificationSettings()
  }

  const confirmAdd = () => {
    if (!adding) return
    const reminder: Reminder = { hour: adding.getHours(), minute: adding.getMinutes() }
    if (hasReminder(settings.reminders, reminder)) {
      // v1's alert (`SettingsNotifications.res:40-58`), "a identical" corrected.
      Alert.alert(
        'Duplicate Reminder',
        "You already have an identical reminder. It's not necessary to have it twice.",
      )
      return
    }
    update((s) => ({ ...s, reminders: addReminder(s.reminders, reminder) }))
    setAdding(undefined)
  }

  return (
    <FormScreen testID="notifications">
      <Section>
        <Toggle
          label="Allow Notifications"
          isOn={allowed}
          onIsOnChange={onAllow}
          modifiers={[accessibilityIdentifier('allow-notifications')]}
        />
      </Section>

      <Section
        footer={`Notifications are skipped if they are planned in less than ${MINIMUM_GAP_MINUTES}min to avoid unnecessary reminders.`}>
        <Toggle
          label="Daily Reminders"
          isOn={settings.remindersEnabled}
          onIsOnChange={(on) => update((s) => ({ ...s, remindersEnabled: on }))}
          modifiers={[disabled(!allowed), accessibilityIdentifier('daily-reminders')]}
        />
        {sortReminders(settings.reminders).map((reminder) => {
          const at = new Date(2026, 0, 1, reminder.hour, reminder.minute)
          const label = time.format(at)
          const next = (
            <VStack alignment={accessibilitySize ? 'leading' : 'trailing'} spacing={0}>
              <Text
                modifiers={[
                  font({ textStyle: 'caption' }),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                Next notification
              </Text>
              <Text
                modifiers={[
                  font({ textStyle: 'footnote' }),
                  foregroundStyle({ type: 'hierarchical', style: 'secondary' }),
                ]}>
                {formatUpdated(nextOccurrence(reminder, now), now, locale)}
              </Text>
            </VStack>
          )
          const remove = (
            // A label with an icon-only style: `systemImage` alone draws nothing (@expo/ui
            // uses it only with a label), so the button was missing since slice 7. The label
            // is what VoiceOver reads.
            <Button
              label={`Remove ${label} reminder`}
              systemImage="minus.circle.fill"
              onPress={() =>
                update((s) => ({ ...s, reminders: removeReminder(s.reminders, reminder) }))
              }
              modifiers={[
                labelStyle('iconOnly'),
                buttonStyle('borderless'),
                foregroundStyle('red'),
                accessibilityIdentifier(`remove-${reminder.hour}-${reminder.minute}`),
              ]}
            />
          )
          const hour = (
            <Text modifiers={[font({ textStyle: 'title3' }), monospacedDigit()]}>{label}</Text>
          )
          const rowModifiers = [
            // v1 dimmed to 0.1, which reads as a rendering fault (SCREENS.md §10b).
            opacity(active ? 1 : 0.4),
            accessibilityIdentifier(`reminder-${reminder.hour}-${reminder.minute}`),
          ]
          // At the accessibility text sizes the next firing goes under the hour: beside it,
          // both broke mid-word ("9:00 A M", slice 9).
          return accessibilitySize ? (
            <VStack
              key={`${reminder.hour}:${reminder.minute}`}
              alignment="leading"
              spacing={4}
              modifiers={rowModifiers}>
              <HStack>
                {hour}
                <Spacer />
                {remove}
              </HStack>
              {next}
            </VStack>
          ) : (
            <HStack key={`${reminder.hour}:${reminder.minute}`} modifiers={rowModifiers}>
              {hour}
              <Spacer />
              {next}
              {remove}
            </HStack>
          )
        })}
        {adding ? (
          <VStack spacing={8}>
            <DatePicker
              title="Time"
              selection={adding}
              displayedComponents={['hourAndMinute']}
              onDateChange={setAdding}
              modifiers={[accessibilityIdentifier('reminder-picker')]}
            />
            <HStack>
              <Button
                label="Cancel"
                onPress={() => setAdding(undefined)}
                modifiers={[buttonStyle('borderless')]}
              />
              <Spacer />
              <Button
                label="Add"
                onPress={confirmAdd}
                modifiers={[buttonStyle('borderless'), accessibilityIdentifier('reminder-add')]}
              />
            </HStack>
          </VStack>
        ) : (
          <Row
            title="Add a New Reminder"
            tone="link"
            onPress={() => setAdding(new Date(2026, 0, 1, 9, 0))}
            testID="add-reminder"
          />
        )}
      </Section>
    </FormScreen>
  )
}
