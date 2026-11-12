import { router, Stack } from 'expo-router'

import { PlaceholderSections } from '@/features/shell/Placeholder'
import { FormScreen } from '@/ui/Form'

// Goals: large title, `+` trailing opens the New Goal sheet (30-screens.md, "Headers").
export default function Goals() {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="plus" onPress={() => router.push('/goal')}>
          New Goal
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <FormScreen testID="goals">
        <PlaceholderSections count={4} />
      </FormScreen>
    </>
  )
}
