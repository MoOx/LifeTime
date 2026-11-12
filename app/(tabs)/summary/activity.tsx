import { Stack, useLocalSearchParams } from 'expo-router'

import { FormScreen, Row, Section } from '@/ui/Form'

// Activity detail: small title naming the activity, minimal back button (30-screens.md).
export default function Activity() {
  const { title = 'Activity' } = useLocalSearchParams<{ title?: string }>()
  return (
    <>
      <Stack.Screen options={{ title }} />
      <FormScreen testID="activity">
        <Section title="Category">
          <Row title="Rest" />
          <Row title="Work" />
        </Section>
      </FormScreen>
    </>
  )
}
