/**
 * Reading events for a range, with a cache and a foreground refresh.
 *
 * v1 cached raw events per ISO range in memory and invalidated the whole map on any
 * refresh (`Calendars.res:110-160`). Same idea here, but the cache key includes the
 * settings that affect filtering, so changing a filter no longer forces a re-read of the
 * calendar store — it only recomputes in JS.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState } from 'react-native'

import type { TimeEvent } from '@/domain/events'
import type { Range } from '@/domain/week'
import { listEvents } from './calendars'

type CacheEntry = { status: 'loading' | 'done'; events: TimeEvent[] }

const cache = new Map<string, CacheEntry>()

const keyOf = (calendarIds: readonly string[], range: Range) =>
  `${[...calendarIds].sort().join(',')}|${range.start}|${range.end}`

export const invalidateEvents = () => cache.clear()

export type EventsResult = {
  events: TimeEvent[] | undefined
  loading: boolean
  refresh: () => void
}

/**
 * Fetches every range in `ranges` and returns them in the same order, so the Summary can
 * ask for six weeks at once and render each page as it arrives.
 */
export const useEventRanges = (
  calendarIds: string[],
  ranges: Range[],
): { byRange: (TimeEvent[] | undefined)[]; loading: boolean; refresh: () => void } => {
  const [revision, setRevision] = useState(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const refresh = useCallback(() => {
    invalidateEvents()
    setRevision((r) => r + 1)
  }, [])

  // The OS gives us no change notification for calendars, so re-read on foreground —
  // the same strategy v1 used, and still the only option (docs/CALENDAR.md §6).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh()
    })
    return () => subscription.remove()
  }, [refresh])

  const keys = useMemo(
    () => ranges.map((range) => keyOf(calendarIds, range)),
    [calendarIds, ranges],
  )

  useEffect(() => {
    let cancelled = false
    const pending = ranges.filter((_, i) => !cache.has(keys[i]!))
    if (pending.length === 0) return

    for (const [i, range] of ranges.entries()) {
      const key = keys[i]!
      if (cache.has(key)) continue
      cache.set(key, { status: 'loading', events: [] })
      listEvents(calendarIds, new Date(range.start), new Date(range.end))
        .then((events) => {
          cache.set(key, { status: 'done', events })
          if (!cancelled && mounted.current) setRevision((r) => r + 1)
        })
        .catch(() => {
          cache.set(key, { status: 'done', events: [] })
          if (!cancelled && mounted.current) setRevision((r) => r + 1)
        })
    }
    return () => {
      cancelled = true
    }
    // `revision` is a deliberate dependency: bumping it after `invalidateEvents` re-runs
    // the fetch for every range.
  }, [calendarIds, ranges, keys, revision])

  const byRange = keys.map((key) => {
    const entry = cache.get(key)
    return entry?.status === 'done' ? entry.events : undefined
  })

  return { byRange, loading: byRange.some((events) => events === undefined), refresh }
}
