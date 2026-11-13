import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

/**
 * The current instant, refreshed when the app comes back to the foreground, so "this
 * week" and "Updated ..." follow the clock (v1 re-read on foreground, `Home.res:26-32`).
 */
export const useNow = (): number => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now())
    })
    return () => subscription.remove()
  }, [])
  return now
}
