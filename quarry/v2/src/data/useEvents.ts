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
import type { EventSource } from './source'

type CacheEntry = { status: 'loading' | 'done'; events: TimeEvent[] }

const cache = new Map<string, CacheEntry>()

/**
 * The source id is part of the key. Without it, granting permission mid-session would
 * serve the demo week back out of the cache for every range already read, and the app
 * would look like it had ignored the permission it just asked for.
 */
const keyOf = (sourceId: string, calendarIds: readonly string[], range: Range) =>
  `${sourceId}|${[...calendarIds].sort().join(',')}|${range.start}|${range.end}`

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
  source: EventSource,
  calendarIds: string[],
  ranges: Range[],
): {
  byRange: (TimeEvent[] | undefined)[]
  loading: boolean
  /** When the last read completed — drives the "Updated …" footnote v1 had. */
  updatedAt: number
  refresh: () => void
} => {
  const [revision, setRevision] = useState(0)
  const [updatedAt, setUpdatedAt] = useState(() => Date.now())
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
    () => ranges.map((range) => keyOf(source.id, calendarIds, range)),
    [source, calendarIds, ranges],
  )

  useEffect(() => {
    let cancelled = false
    const pending = ranges.filter((_, i) => !cache.has(keys[i]!))
    if (pending.length === 0) return

    for (const [i, range] of ranges.entries()) {
      const key = keys[i]!
      if (cache.has(key)) continue
      cache.set(key, { status: 'loading', events: [] })
      source
        .listEvents(calendarIds, new Date(range.start), new Date(range.end))
        .then((events) => {
          cache.set(key, { status: 'done', events })
          if (!cancelled && mounted.current) {
            setUpdatedAt(Date.now())
            setRevision((r) => r + 1)
          }
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
  }, [source, calendarIds, ranges, keys, revision])

  const byRange = keys.map((key) => {
    const entry = cache.get(key)
    return entry?.status === 'done' ? entry.events : undefined
  })

  return {
    byRange,
    loading: byRange.some((events) => events === undefined),
    updatedAt,
    refresh,
  }
}
