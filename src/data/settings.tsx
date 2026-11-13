/**
 * The settings, in memory. Persistence comes with slice 7 (Settings, export, import).
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import { DEFAULT_SETTINGS, type Settings } from '@/domain/settings'

type SettingsContext = {
  settings: Settings
  update: (patch: (settings: Settings) => Settings) => void
}

const Context = createContext<SettingsContext | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const value = useMemo(() => ({ settings, update: setSettings }), [settings])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useSettings = (): SettingsContext => {
  const context = useContext(Context)
  if (context === null) throw new Error('useSettings outside SettingsProvider')
  return context
}
