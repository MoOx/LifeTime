import { DisclosureGroup, Text, VStack } from '@expo/ui/swift-ui'
import { multilineTextAlignment } from '@expo/ui/swift-ui/modifiers'
import { router, Stack } from 'expo-router'
import { useState } from 'react'

import { Heading, Paragraph, ProseScreen, Subheading } from '@/ui/Prose'

/**
 * "How to use LifeTime": v1's `src/md/help.md` (`git show main:src/md/help.md`), drawn by
 * SwiftUI with v1's headings and wording, its `<details>` block as a native disclosure
 * group, and its links tappable in the text. SCREENS.md §10 lists the departures:
 *
 *   - "(Premium)" is gone from the matching modes: the feature exists and is free
 *     (issue #13); the paragraph says where to choose the mode instead.
 *   - "Upcoming features" is gone: none of it was built or is planned.
 *   - Lists keep v1's bullets: SwiftUI's inline Markdown has no lists.
 *   - Typos: "you calendar", "This apps", "Others Calendars", "If want".
 */
export default function Help() {
  const [guidesOpen, setGuidesOpen] = useState(false)
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" onPress={() => router.back()}>
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <ProseScreen title="How to use LifeTime" testID="help">
        <Paragraph>
          LifeTime can help you to understand how you use your time and rely on calendar events to
          learn how you use it. By saving events into your calendars, you will be able to visualize
          reports so you can take more informed decisions about how to use your valuable time.
        </Paragraph>

        <Heading>Start by feeding your calendar</Heading>
        <Paragraph>
          LifeTime will mostly read events that already happened as a diary. The more you feed your
          calendar, the more LifeTime will be able to show you accurate data.
        </Paragraph>
        <Paragraph>
          To learn how to take advantage of your calendar you can refer to your calendar app user
          guide.
        </Paragraph>
        {/* Collapsed at first, as v1's `<details>` (capture 34). */}
        <DisclosureGroup isExpanded={guidesOpen} onIsExpandedChange={setGuidesOpen}>
          <DisclosureGroup.Label>
            <Text modifiers={[multilineTextAlignment('leading')]}>
              Learn More about how to use your calendar app
            </Text>
          </DisclosureGroup.Label>
          <VStack alignment="leading" spacing={16}>
            <Subheading>Apple Calendar (iCloud or local)</Subheading>
            <Paragraph>
              {[
                'If you use Apple built-in calendar app, you can learn how to leverage your calendars by reading the different user guide for each operating systems:',
                '',
                '• [iPhone User Guide](https://support.apple.com/en-gb/guide/iphone/welcome/ios) and looks in the [Table of Contents](https://support.apple.com/en-gb/guide/iphone/toc) for Calendar section.',
                '• [iPad User Guide](https://support.apple.com/en-gb/guide/ipad/welcome/ipados) and looks in the [Table of Contents](https://support.apple.com/en-gb/guide/ipad/toc) for Calendar section.',
                '• [Mac Calendar User Guide](https://support.apple.com/en-gb/guide/calendar/welcome/mac)',
              ].join('\n')}
            </Paragraph>
            <Paragraph>
              These apps can be used with local (offline), iCloud, Google, Exchange, Yahoo calendars
              & more.
            </Paragraph>
            <Subheading>Google Calendar (Android, iOS & others)</Subheading>
            <Paragraph>
              {[
                'If you rely on Google Calendar apps, you can find help on how to use it on all your devices on Google Support Calendar Help:',
                '',
                '• [Generic Google Calendar Help](https://support.google.com/calendar/)',
                '• [Android Google Calendar Help](https://support.google.com/calendar/topic/6118993?hl=en&ref_topic=6076998)',
                '• [iPhone & iPad Google Calendar Help](https://support.google.com/calendar/topic/6118975?hl=en&ref_topic=6076998)',
              ].join('\n')}
            </Paragraph>
            <Subheading>Microsoft Outlook Calendar</Subheading>
            <Paragraph>
              {[
                'If you rely on Exchange and are familiar with Outlook, you can find help on how to use Exchange calendars on all your devices via Outlook Help:',
                '',
                '• [Outlook for Windows Calendar Help](https://support.office.com/en-us/article/welcome-to-your-calendar-6fb9225d-9f9d-456d-8c81-8437bfcd3ebf)',
                '• [Outlook for macOS Calendar Help](https://support.office.com/en-us/article/video-welcome-to-your-calendar-on-a-mac-2acd9147-c9eb-497e-a2b6-905284df939d)',
                '• [Outlook for iOS Calendar Help](https://www.osupportweb.com/a/outlook-mobile/?p=ios&s=calendar-1492711395)',
                '• [Outlook for Android Calendar Help](https://www.osupportweb.com/a/outlook-mobile/?p=ios&s=calendar-1492711395)',
              ].join('\n')}
            </Paragraph>
            <Paragraph>
              Note: If you rely on Exchange, you can probably use built-in calendars app on your
              device by just connecting your account into your device settings.
            </Paragraph>
            <Subheading>Other Calendars</Subheading>
            <Paragraph>
              Please let us know what device/apps you are familiar with by sending us an email.
            </Paragraph>
          </VStack>
        </DisclosureGroup>

        <Heading>Categorize & filter activities</Heading>
        <Paragraph>
          As soon as LifeTime can read events from your calendars, it will start to show you
          summarised views of events as activities on the _Summary_ screen.
        </Paragraph>
        <Subheading>Activities</Subheading>
        <Paragraph>
          {[
            'Activities are group of events that match some characteristics like:',
            '',
            '• Similar event name',
            '• Similar event that starts with the same name',
            '• Similar event that ends with the same name',
            '• Similar event that contains the same name',
            '',
            "You choose how an activity matches on the activity's own screen.",
          ].join('\n')}
        </Paragraph>
        <Paragraph>
          If you want, you can hide some activities in the dedicated activity page (on _Top
          Activities_ section on _Summary_ screen, you can tap on an activity to go to the dedicated
          screen). In case you want to see hidden activities back, you can unhide all activities. A
          switch button is available at the bottom of _Summary_ screen.
        </Paragraph>
        <Subheading>Categorizing Activities</Subheading>
        <Paragraph>
          Activities can be assigned to categories. That’s something you must do to benefit of
          LifeTime key features. By assigning activities to different categories, you will be able
          to easily visualize the kind of activities you spend your time on. This is very important
          to have relevant reports that will help you to take more informed decisions about how you
          use your valuable time.
        </Paragraph>
        <Subheading>Filtering activities by calendars</Subheading>
        <Paragraph>
          Another way to filter activities is by hiding completely some given calendars. For example
          if you have a dedicated calendar for some activities you don’t find relevant to share with
          LifeTime, you can hide it from the _Customize Report_ link on the _Summary_ screen.
        </Paragraph>

        <Heading>Adding Goals and Limits</Heading>
        <Paragraph>
          In addition to the visualisation of the time you spend on various kind of activities,
          LifeTime can become your personal coach to help you reaching your goals and spend your
          valuable time on things you love.
        </Paragraph>
      </ProseScreen>
    </>
  )
}
