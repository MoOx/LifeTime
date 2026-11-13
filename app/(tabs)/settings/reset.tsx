import * as Clipboard from 'expo-clipboard'
import { Alert } from 'react-native'

import { DEFAULT_SETTINGS, parseSettings } from '@/domain/settings'
import { useSettings } from '@/data/settings'
import { FormScreen, Row, Section } from '@/ui/Form'

/**
 * Reset: SCREENS.md §10c, `SettingsDangerZone.res` on `main`, capture 10. Three groups, each
 * with v1's footnote; every destructive action asks first, with v1's alerts.
 *
 *   - **Metadata**: `Export Backup` copies the settings to the clipboard, `Import Backup`
 *     replaces them with the clipboard's, through `parseSettings`, which also reads a v1
 *     export.
 *   - **Demo Data**: one row, `Show Demo Data` / `Hide Demo Data`, since the demo lives in
 *     memory (spec/30-screens.md); v1 wrote a calendar.
 *   - **Reset Settings & Erase All Metadata**. Calendars are never touched.
 */
export default function Reset() {
  const { settings, update } = useSettings()

  const exportBackup = async () => {
    await Clipboard.setStringAsync(JSON.stringify(settings))
    // "you clipboard" corrected.
    Alert.alert(
      'Export Finished',
      'Data are in your clipboard. Be sure to paste that in a safe place.',
    )
  }

  const importBackup = () =>
    Alert.alert(
      'Import Data from Clipboard?',
      "This is a destructive command, all settings will be overwritten by the content of the clipboard (assuming that's a valid Export Backup).",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          style: 'destructive',
          onPress: async () => {
            const text = await Clipboard.getStringAsync().catch(() => '')
            if (text.trim() === '') return Alert.alert('No data in your clipboard')
            let raw: unknown
            try {
              raw = JSON.parse(text)
            } catch {
              raw = undefined
            }
            if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
              return Alert.alert("Data don't seem to be a valid Export Backup")
            }
            // An import does not send anyone back through Welcome.
            update(() => ({ ...parseSettings(raw), onboarded: true }))
            Alert.alert('Import Finished')
          },
        },
      ],
    )

  const reset = () =>
    Alert.alert(
      'Reset Settings & Erase All Data?',
      'This is a destructive operation and will wipe all settings & data. It cannot be undone unless you use an Export.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          // Welcome is not shown again in the middle of the app: it is one row away.
          onPress: () => update(() => ({ ...DEFAULT_SETTINGS, onboarded: true })),
        },
      ],
    )

  return (
    <FormScreen testID="reset">
      <Section
        title="Metadata"
        footer="Export contains events metadata including categories & goals that are not stored into your calendars. Export copies raw metadata into your clipboard. Import assumes that you have your export in your clipboard, ready to be injected.">
        <Row
          title="Export Backup"
          icon="square.and.arrow.up"
          tone="link"
          onPress={exportBackup}
          testID="export-backup"
        />
        <Row
          title="Import Backup"
          icon="square.and.arrow.down"
          tone="link"
          onPress={importBackup}
          testID="import-backup"
        />
      </Section>

      <Section
        title="Demo Data"
        footer="Demo data allows you to quickly test the app if you have currently not enough data in your actual calendars. It is generated on the fly and never written to your calendars.">
        <Row
          title={settings.showDemo ? 'Hide Demo Data' : 'Show Demo Data'}
          tone="link"
          onPress={() => update((s) => ({ ...s, showDemo: !s.showDemo }))}
          testID="toggle-demo"
        />
      </Section>

      <Section footer="This is a destructive operation and will delete all application metadata. Note: All your calendars and events are safe and are not affected by this operation.">
        <Row
          title="Reset Settings & Erase All Metadata"
          tone="destructive"
          onPress={reset}
          testID="reset-all"
        />
      </Section>
    </FormScreen>
  )
}
