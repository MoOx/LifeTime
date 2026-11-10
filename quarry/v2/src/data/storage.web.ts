/**
 * Web persistence: `localStorage`.
 *
 * The web target is a preview harness, not a product — it exists so the layout, the type
 * scale, the list grammar and the chart can be rendered and inspected without building
 * for a device. `localStorage` is plenty for that, and it avoids `expo-sqlite`'s
 * WebAssembly worker, whose `.wasm` asset Metro cannot resolve for web.
 *
 * Guarded rather than assumed available: this same file runs in a server-side render
 * during `expo export`, where there is no `window`.
 */

const available = typeof window !== 'undefined' && 'localStorage' in window

export const storage = {
  async getItem(key: string): Promise<string | null> {
    return available ? window.localStorage.getItem(key) : null
  },
  async setItem(key: string, value: string): Promise<void> {
    if (available) window.localStorage.setItem(key, value)
  },
  async removeItem(key: string): Promise<void> {
    if (available) window.localStorage.removeItem(key)
  },
}
