import { PlaceholderSections } from '@/features/shell/Placeholder'
import { FormScreen, Row, Section } from '@/ui/Form'

// Settings: the navigation rows of v1 (docs/reference/v1/ios/light/30-settings-top.png)
// that slice 1 needs, then filler. Slice 7 draws the real screen.
export default function Settings() {
  return (
    <FormScreen testID="settings">
      <Section title="Navigation">
        <Row title="Notifications" href="/settings/notifications" testID="row-notifications" />
        <Row title="Help" href="/help" testID="row-help" />
        <Row title="Reset" href="/settings/reset" testID="row-reset" />
      </Section>
      <PlaceholderSections count={3} />
    </FormScreen>
  )
}
