/**
 * "How to use LifeTime" — v1's `src/md/help.md`, rebuilt as a screen (`docs/SCREENS.md` §10).
 *
 * v1 wrote this as Markdown, compiled it to JSON at build time and rendered it through a
 * hand-written `MarkdownJsonRenderer`. That bought one thing — prose that was easy to edit
 * — at the cost of a build step, a renderer to maintain, and text that could never contain
 * a working control. Here the prose is prose and the links are rows, so "read the Apple
 * Calendar guide" is a tappable row rather than blue words inside a paragraph.
 *
 * The content is v1's, with three deliberate corrections:
 *
 *   • **The Premium promise is gone, because the feature shipped.** v1's help told the user
 *     that matching "events that start with the same name" was Premium; it was never built
 *     and there was never a Premium (issue #13). It is now a rule mode on every activity,
 *     free, so the paragraph says how to use it instead of how to buy it.
 *   • **The "Upcoming features" section is gone.** It promised trophies, awards and
 *     personalised encouragement. None of it exists, none of it is planned, and a help
 *     screen is the worst place to keep a roadmap that did not happen.
 *   • **Typos are fixed** ("you calendar", "Others Calendars"), and the section on hiding
 *     activities now describes where the control actually is in v2.
 */

import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Linking, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { openCalendarApp } from '@/data/calendars'
import { AppText } from '@/ui/AppText'
import { ListFootnote, ListGroup, ListHeader, ListRow } from '@/ui/List'
import { colors } from '@/ui/theme/colors'
import { space } from '@/ui/theme/space'

/**
 * v1's `<details>` block, kept because the question it answers — "how do I even get data
 * in here?" — is the first one a new user has, and no other screen answers it.
 */
const GUIDES: { group: string; links: { title: string; url: string }[] }[] = [
  {
    group: 'Apple Calendar',
    links: [
      {
        title: 'iPhone User Guide',
        url: 'https://support.apple.com/en-gb/guide/iphone/welcome/ios',
      },
      {
        title: 'iPad User Guide',
        url: 'https://support.apple.com/en-gb/guide/ipad/welcome/ipados',
      },
      {
        title: 'Calendar for Mac',
        url: 'https://support.apple.com/en-gb/guide/calendar/welcome/mac',
      },
    ],
  },
  {
    group: 'Google Calendar',
    links: [
      { title: 'Calendar Help', url: 'https://support.google.com/calendar/' },
      {
        title: 'On Android',
        url: 'https://support.google.com/calendar/topic/6118993',
      },
      {
        title: 'On iPhone & iPad',
        url: 'https://support.google.com/calendar/topic/6118975',
      },
    ],
  },
  {
    group: 'Microsoft Outlook',
    links: [
      {
        title: 'Outlook for Windows',
        url: 'https://support.microsoft.com/en-us/office/welcome-to-your-calendar-6fb9225d-9f9d-456d-8c81-8437bfcd3ebf',
      },
      {
        title: 'Outlook for Mac',
        url: 'https://support.microsoft.com/en-us/office/calendar-in-outlook-for-mac-9b9a1a4f-6a95-4e0e-8c37-b0ba1a5e0e2f',
      },
    ],
  },
]

/**
 * A prose heading, not a `ListHeader`.
 *
 * The list grammar uppercases its group headers, which is right for a terse label
 * ("CALENDARS", "RULES") and wrong for a sentence — "START BY FEEDING YOUR CALENDAR" reads
 * as shouting. A long-form screen wants a title in the reading voice, so this is
 * `sectionTitle` in the primary colour.
 */
function Section({ children }: { children: string }) {
  return (
    <View style={styles.section}>
      <AppText role="sectionTitle">{children}</AppText>
    </View>
  )
}

function Prose({ children }: { children: string }) {
  return (
    <View style={styles.prose}>
      <AppText role="body" tone="secondary">
        {children}
      </AppText>
    </View>
  )
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [guidesOpen, setGuidesOpen] = useState(false)

  const open = (url: string) => {
    Linking.openURL(url).catch(() => {})
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.section }}
      contentInsetAdjustmentBehavior="automatic">
      <Prose>
        LifeTime reads the events already in your calendars and adds them up, so you can see
        where your time actually goes and decide what to do about it.
      </Prose>

      <Section>Start by feeding your calendar</Section>
      <Prose>
        LifeTime mostly reads events that have already happened — your calendar as a diary
        rather than a plan. The more you put in it, the more accurate everything here
        becomes.
      </Prose>
      <ListGroup separatorInset="text">
        <ListRow
          symbol="calendar"
          title="Open Calendar"
          subtitle="Add what you did, then come back"
          chevron
          onPress={() => void openCalendarApp()}
        />
        <ListRow
          symbol="help"
          title="How to use your calendar app"
          subtitle={guidesOpen ? 'Tap to hide' : 'Guides for Apple, Google and Outlook'}
          onPress={() => setGuidesOpen((open) => !open)}
        />
      </ListGroup>

      {/* v1's collapsible `<details>`, which is the right shape: three providers' worth of
          links is a lot of screen for something most people need exactly once. */}
      {guidesOpen &&
        GUIDES.map((guide) => (
          <View key={guide.group}>
            <ListHeader title={guide.group} />
            <ListGroup>
              {guide.links.map((link) => (
                <ListRow
                  key={link.url}
                  title={link.title}
                  chevron
                  onPress={() => open(link.url)}
                />
              ))}
            </ListGroup>
          </View>
        ))}

      <Section>Activities</Section>
      <Prose>
        An activity is every event that shares a title. Six entries called "Deep work"
        become one activity worth six hours, which is why the Summary can tell you something
        a calendar cannot.
      </Prose>
      <Prose>
        Open an activity to widen what it catches: exactly this title, or every title that
        starts with it, ends with it, or contains it. One rule on "Client —" can cover a
        year of meetings.
      </Prose>
      <ListFootnote>
        Earlier versions of LifeTime described this as a paid feature. It is part of the
        app, and it always will be.
      </ListFootnote>

      <Section>Categories</Section>
      <Prose>
        Assigning activities to categories is the one thing worth doing: until then every
        bar is grey and the chart says nothing. "Sort my activities" walks the whole list at
        once, biggest first, with a category already guessed for each.
      </Prose>
      <ListGroup>
        <ListRow
          centeredAction
          title="Sort my activities"
          onPress={() => router.push('/categorize')}
        />
      </ListGroup>

      <Section>What counts</Section>
      <Prose>
        Whole calendars can be left out of every report — useful for a shared calendar, or
        one full of things you would rather not count. A calendar can also be given a
        category, which files everything in it at once.
      </Prose>
      <Prose>
        Single activities can be hidden instead, from their own screen. A hidden activity
        stays out of your reports but still counts towards your goals.
      </Prose>
      <ListGroup>
        <ListRow
          centeredAction
          title="Customize report"
          onPress={() => router.push('/filters')}
        />
      </ListGroup>

      <Section>Goals and limits</Section>
      <Prose>
        A goal is time you want to spend; a limit is time you would rather not. Both are
        measured against the same events the Summary counts, so they never disagree with
        your chart.
      </Prose>
      <Prose>
        The ring can show your progress against the whole period, or against where you
        should be by today. Empty rings in the morning are the point.
      </Prose>

      <Section>Privacy</Section>
      <ListGroup separatorInset="text">
        <ListRow
          symbol="privacy"
          title="What LifeTime reads"
          subtitle="And what it never does"
          chevron
          onPress={() => router.push('/privacy')}
        />
      </ListGroup>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.xxs,
  },
  prose: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
})
