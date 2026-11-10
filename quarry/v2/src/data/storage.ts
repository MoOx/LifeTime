/**
 * Key/value persistence, one tiny interface.
 *
 * On device this is `expo-sqlite/kv-store` — the AsyncStorage API on top of SQLite, so it
 * stays fast as the settings document grows and leaves room for derived caches later
 * (IMPROVEMENTS.md §C.3).
 *
 * It is behind an interface because of the web build, and the web build exists for a
 * reason worth stating: it is the only way this app can be *looked at* without a
 * twenty-minute device build. `expo-sqlite` on web pulls a WebAssembly worker that Metro
 * cannot resolve, and there is no reason to ship SQLite to a preview target anyway —
 * `storage.web.ts` uses `localStorage` and the rest of the app cannot tell.
 */

import Storage from 'expo-sqlite/kv-store'

export const storage = {
  getItem: (key: string): Promise<string | null> => Storage.getItem(key),
  setItem: (key: string, value: string): Promise<void> => Storage.setItem(key, value),
  removeItem: (key: string): Promise<void> => Storage.removeItem(key),
}
