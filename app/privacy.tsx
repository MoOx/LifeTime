import { router, Stack } from 'expo-router'

import { Paragraph, ProseScreen } from '@/ui/Prose'

// "LifeTime & Privacy": v1's text (`Privacy.res:23-40`, quoted in SCREENS.md §9), with the
// corrections of spec/30-screens.md: "read-only" without v1's "mostly" (the calendar is only
// ever read), and the typos of "Corrected strings".
export default function Privacy() {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" onPress={() => router.back()}>
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <ProseScreen title="LifeTime & Privacy" centered testID="privacy">
        <Paragraph>
          LifeTime is designed to protect your information. It only runs computation on your device
          and does not share your information anywhere.
        </Paragraph>
        <Paragraph>
          The calendars access we need to run our computation is read-only. All the information
          retrieved from your calendars is only used on your device, to generate reports & offers
          you suggestions. We don't collect anything. We don't track you with any kind of
          third-party services.
        </Paragraph>
        <Paragraph>
          {[
            'The settings of the application are stored on device, which includes things like:',
            '',
            '- Names of activities that are assigned to categories,',
            '- Categories of activities,',
            '- Names of calendars skipped',
            '- Goals information',
            '- Application settings like color theme & notifications preferences',
          ].join('\n')}
        </Paragraph>
        <Paragraph>
          This means that unless you backup your data, you cannot recover your personal settings if
          you remove the application.
        </Paragraph>
        <Paragraph>
          In the future, if we need to share collected data to improve the application, this will be
          with your explicit consent and all the data will be anonymised to respect privacy.
        </Paragraph>
      </ProseScreen>
    </>
  )
}
