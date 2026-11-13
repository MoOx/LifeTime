/**
 * The settings, kept on the device as one JSON document in SQLite (spec/50-architecture.md,
 * "Storage"). Read synchronously once, before the first screen, so nothing flashes (Welcome
 * at every launch, until slice 7); written after each change. What is read goes through
 * `parseSettings`, which also accepts a v1 export, so a damaged or older document still
 * opens.
 *
 * The theme preference is applied here too (SCREENS.md §6): `Appearance.setColorScheme`
 * overrides the system's for the whole app, SwiftUI views included.
 */

import * as SQLite from 'expo-sqlite'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Appearance } from 'react-native'

import { DEFAULT_SETTINGS, parseSettings, type Settings } from '@/domain/settings'

const KEY = 'settings'

const open = () => {
  const db = SQLite.openDatabaseSync('lifetime.db')
  db.execSync(
    'CREATE TABLE IF NOT EXISTS documents (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)',
  )
  return db
}

let database: SQLite.SQLiteDatabase | undefined
const db = () => (database ??= open())

const load = (): Settings => {
  try {
    const row = db().getFirstSync<{ value: string }>(
      'SELECT value FROM documents WHERE key = ?',
      KEY,
    )
    return row ? parseSettings(JSON.parse(row.value)) : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

const save = (settings: Settings) =>
  db()
    .runAsync(
      'INSERT OR REPLACE INTO documents (key, value) VALUES (?, ?)',
      KEY,
      JSON.stringify(settings),
    )
    .catch(() => {})

type SettingsContext = {
  settings: Settings
  update: (patch: (settings: Settings) => Settings) => void
}

const Context = createContext<SettingsContext | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)
  const loaded = useRef(settings)

  useEffect(() => {
    // Nothing to write for what was just read.
    if (settings !== loaded.current) save(settings)
  }, [settings])

  useEffect(() => {
    Appearance.setColorScheme(settings.theme === 'auto' ? 'unspecified' : settings.theme)
  }, [settings.theme])

  const value = useMemo(() => ({ settings, update: setSettings }), [settings])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useSettings = (): SettingsContext => {
  const context = useContext(Context)
  if (context === null) throw new Error('useSettings outside SettingsProvider')
  return context
}
