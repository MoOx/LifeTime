import type { ReactNode } from 'react'

export type GoalRingProps = {
  /** 0…n. Values above 1 lap the ring. */
  fraction: number
  size: number
  thickness?: number
  /** Start and end of the sweep, usually a category or status colour and a lighter one. */
  colors: [string, string]
  trackColor: string
  children?: ReactNode
}
