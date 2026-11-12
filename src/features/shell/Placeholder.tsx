import type { Href } from 'expo-router'

import { Row, Section } from '@/ui/Form'

const TITLES = ['Sleep', 'Work', 'Lunch', 'CrossFit', 'Dinner', 'Meditation', 'Commute', 'Reading']

/**
 * Slice 1 filler: a list long enough to scroll, so the large title can be seen collapsing.
 * Each later slice replaces it with the screen's real content.
 */
export function PlaceholderSections({
  count = 3,
  href,
}: {
  count?: number
  href?: (title: string) => Href
}) {
  return Array.from({ length: count }, (_, group) => (
    <Section
      key={group}
      title={`Placeholder ${group + 1}`}
      footer="Placeholder content, replaced by the screen's own slice.">
      {TITLES.map((title) => (
        <Row
          key={title}
          title={title}
          value="1h 15m"
          href={href?.(title)}
          testID={group === 0 ? `row-${title}` : undefined}
        />
      ))}
    </Section>
  ))
}
