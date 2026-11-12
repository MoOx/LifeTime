import { FormScreen, Section } from '@/ui/Form'

// Pushed screen with a small title (30-screens.md). Content comes with slice 7.
export default function Notifications() {
  return (
    <FormScreen testID="notifications">
      <Section footer="Notifications: placeholder for slice 7.">{null}</Section>
    </FormScreen>
  )
}
