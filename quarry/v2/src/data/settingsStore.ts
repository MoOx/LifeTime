/**
 * Persistence for the settings document, plus the React binding.
 *
 * Backed by `./storage`, which is `expo-sqlite/kv-store` on device — the same key/value
 * API as AsyncStorage, but on SQLite, so it stays fast as the document grows and gives us
 * somewhere to put derived aggregate caches later (IMPROVEMENTS.md §C.3).
 *
 * All parsing lives in `src/domain/settings.ts`, which is pure and unit-tested.
 */

import { useCallback, useSyncExternalStore } from 'react'

import { DEFAULT_SETTINGS, Settings, parseSettings } from '@/domain/settings'
import { storage } from './storage'

export const STORAGE_KEY = 'lifetime.settings.v2'

type Listener = () => void

let current: Settings = DEFAULT_SETTINGS
let loaded = false
const listeners = new Set<Listener>()

const emit = () => {
  for (const listener of listeners) listener()
}

const subscribe = (listener: Listener) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const persist = async () => {
  await storage.setItem(STORAGE_KEY, JSON.stringify(current))
}

export const settingsStore = {
  subscribe,
  getSnapshot: (): Settings => current,
  isLoaded: (): boolean => loaded,

  async load(): Promise<Settings> {
    if (loaded) return current
    const stored = await storage.getItem(STORAGE_KEY)
    if (stored !== null) {
      try {
        current = parseSettings(JSON.parse(stored))
      } catch {
        current = DEFAULT_SETTINGS
      }
    }
    loaded = true
    emit()
    return current
  },

  /**
   * Updates are applied to memory first and emitted synchronously, then written. v1
   * bounced settings writes through nested `InteractionManager` + `setTimeout(0)` hops to
   * stop them janking the UI (`App.res:118-140`); keeping the write off the render path
   * removes the need for that.
   */
  async update(patch: Partial<Settings> | ((s: Settings) => Settings)): Promise<void> {
    current = typeof patch === 'function' ? patch(current) : { ...current, ...patch }
    emit()
    await persist()
  },
}

export const useSettings = (): Settings =>
  useSyncExternalStore(subscribe, settingsStore.getSnapshot, settingsStore.getSnapshot)

export const useSettingsLoaded = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => loaded,
    () => loaded,
  )

export const useUpdateSettings = () =>
  useCallback(
    (patch: Partial<Settings> | ((s: Settings) => Settings)) => settingsStore.update(patch),
    [],
  )
