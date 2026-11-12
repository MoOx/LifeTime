import { FormScreen, Section } from '@/ui/Form'

// Pushed screen with a small title (30-screens.md). Content comes with slice 7.
export default function Reset() {
  return (
    <FormScreen testID="reset">
      <Section footer="Reset: placeholder for slice 7.">{null}</Section>
    </FormScreen>
  )
}
