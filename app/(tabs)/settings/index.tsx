import { router } from 'expo-router'
import type { SFSymbol } from 'sf-symbols-typescript'

import type { ThemePreference } from '@/domain/settings'
import { openAppSettings, openCalendarApp } from '@/data/calendar'
import { useSettings } from '@/data/settings'
import { FormScreen, Row, Section } from '@/ui/Form'
import { CATEGORY_PALETTE } from '@/ui/theme/colors'

const THEMES: { theme: ThemePreference; label: string; icon: SFSymbol; color: string }[] = [
  { theme: 'light', label: 'Light', icon: 'sun.max', color: CATEGORY_PALETTE.blue.light },
  { theme: 'dark', label: 'Dark', icon: 'moon.fill', color: CATEGORY_PALETTE.indigo.light },
  { theme: 'auto', label: 'Auto', icon: 'moon.stars', color: CATEGORY_PALETTE.purple.light },
]

/**
 * Settings: SCREENS.md §6, `SettingsView.res` on `main`, captures 30 and 32. A settings-like
 * screen, so a grouped list (D27, D28), with v1's coloured symbols: Notifications; Theme
 * (Light in blue, Dark in indigo, Auto in purple, a check on the chosen one); More (Help,
 * Welcome Screen, Calendar App, App System Settings); then Reset on its own, the string the
 * running v1 shows (spec/30-screens.md).
 */
export default function Settings() {
  const { settings, update } = useSettings()
  return (
    <FormScreen testID="settings">
      <Section>
        <Row
          title="Notifications"
          icon="app.badge"
          href="/settings/notifications"
          testID="row-notifications"
        />
      </Section>

      <Section
        title="Theme"
        footer="Auto theme will switch between Light & Dark automatically to match your system settings.">
        {THEMES.map(({ theme, label, icon, color }) => (
          <Row
            key={theme}
            title={label}
            icon={icon}
            iconColor={color}
            checked={settings.theme === theme}
            onPress={() => update((s) => ({ ...s, theme }))}
            testID={`theme-${theme}`}
          />
        ))}
      </Section>

      <Section title="More">
        <Row title="Help" icon="info.circle.fill" href="/help" testID="row-help" />
        {/* v1 re-opens the onboarding on demand (`SettingsView.res:96-102`). */}
        <Row
          title="Welcome Screen"
          icon="play.circle"
          chevron
          onPress={() => router.push('/welcome')}
          testID="row-welcome"
        />
        <Row
          title="Calendar App"
          icon="calendar"
          chevron
          onPress={openCalendarApp}
          testID="row-calendar-app"
        />
        <Row
          title="App System Settings"
          icon="gearshape"
          chevron
          onPress={openAppSettings}
          testID="row-system-settings"
        />
      </Section>

      <Section>
        <Row title="Reset" href="/settings/reset" testID="row-reset" />
      </Section>
    </FormScreen>
  )
}
