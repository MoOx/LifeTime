/**
 * Daily reminders. Rebuilt against `docs/SCREENS.md` §10b, where v1 had a whole screen and
 * v2 had one switch.
 *
 * The row that matters is the one showing **when each reminder next fires**. A reminder
 * set for 09:00, read at six in the evening, is not going off today — and there is no way
 * to know that from "09:00" alone. v1 put the relative time in every row and it is the
 * detail that makes the list trustworthy.
 *
 * Adding a duplicate is refused with an alert rather than silently merged, also as in v1:
 * two identical reminders is always a mistake, and quietly absorbing it leaves the user
 * wondering whether the tap registered.
 */

import { Host, Picker } from '@expo/ui'
import { useCallback, useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useLocaleTag } from '@/data/locale'
import { useSettings, useUpdateSettings } from '@/data/settingsStore'
import {
  MINIMUM_GAP_MINUTES,
  addReminder,
  hasReminder,
  nextOccurrence,
  removeReminder,
  sortReminders,
} from '@/domain/reminders'
import type { Reminder } from '@/domain/settings'
import { formatRelative } from '@/domain/time'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { Symbol } from '@/ui/Symbol'
import { colors } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'

/** Whole and half hours from 06:00 to 23:30 — the range a daily nudge lives in. */
const CANDIDATES: Reminder[] = Array.from({ length: 36 }, (_, i) => ({
  hour: 6 + Math.floor(i / 2),
  minute: (i % 2) * 30,
}))

const formatTime = (reminder: Reminder, locale: string): string =>
  new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(
    new Date(2026, 0, 1, reminder.hour, reminder.minute),
  )

const key = (reminder: Reminder) => reminder.hour * 60 + reminder.minute

export default function RemindersScreen() {
  const insets = useSafeAreaInsets()
  const settings = useSettings()
  const update = useUpdateSettings()
  const locale = useLocaleTag()

  const now = useMemo(() => Date.now(), [])
  const reminders = useMemo(() => sortReminders(settings.reminders), [settings.reminders])
  const [candidate, setCandidate] = useState(key({ hour: 20, minute: 0 }))

  const add = useCallback(() => {
    const reminder = { hour: Math.floor(candidate / 60), minute: candidate % 60 }
    if (hasReminder(settings.reminders, reminder)) {
      Alert.alert(
        'Duplicate reminder',
        'You already have an identical reminder. There is no need to have it twice.',
      )
      return
    }
    update((current) => ({
      ...current,
      reminders: addReminder(current.reminders, reminder),
    }))
  }, [candidate, settings.reminders, update])

  const remove = useCallback(
    (reminder: Reminder) => {
      update((current) => ({
        ...current,
        reminders: removeReminder(current.reminders, reminder),
      }))
    },
    [update],
  )

  const enabled = settings.remindersEnabled

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
      contentInsetAdjustmentBehavior="automatic">
      <ListHeader title="Daily reminders" />
      <ListGroup separatorInset="text">
        <ListRow
          symbol="reminder"
          title={enabled ? 'On' : 'Off'}
          subtitle={
            enabled
              ? 'LifeTime will nudge you at the times below'
              : 'No reminders will be sent'
          }
          accessory={
            enabled ? <Symbol name="checkmark" size={17} color={colors.accent} /> : undefined
          }
          onPress={() => update({ remindersEnabled: !enabled })}
        />
      </ListGroup>
      <ListFootnote>
        A nudge to fill in what you did, so a week is written down while you still remember
        it. Nothing is sent anywhere — the notification is scheduled on this device.
      </ListFootnote>

      <ListHeader title="Times" />
      <ListGroup>
        {reminders.length === 0 ? (
          <ListRow title="No reminders" subtitle="Add one below." />
        ) : (
          reminders.map((reminder) => (
            <ListRow
              key={key(reminder)}
              title={formatTime(reminder, locale)}
              subtitle={
                enabled
                  ? `Next ${formatRelative(nextOccurrence(reminder, now), now, locale)}`
                  : 'Paused'
              }
              accessory={<Symbol name="remove" size={20} color={colors.destructive} />}
              onPress={() => remove(reminder)}
              accessibilityLabel={`Remove the ${formatTime(reminder, locale)} reminder`}
            />
          ))
        )}
      </ListGroup>

      <ListGroup style={styles.spaced}>
        <ListRow
          title="Add a reminder"
          accessory={
            <Host matchContents>
              <Picker
                selectedValue={candidate}
                onValueChange={(value) => setCandidate(Number(value))}>
                {CANDIDATES.map((reminder) => (
                  <Picker.Item
                    key={key(reminder)}
                    label={formatTime(reminder, locale)}
                    value={key(reminder)}
                  />
                ))}
              </Picker>
            </Host>
          }
        />
        <ListRow centeredAction title="Add" onPress={add} />
      </ListGroup>
      <ListFootnote>
        {`A reminder due in less than ${MINIMUM_GAP_MINUTES} minutes is skipped, so setting one for the time it already is does not fire immediately.`}
      </ListFootnote>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  spaced: {
    marginTop: space.xl,
  },
})
