import { router, Stack } from 'expo-router'

import { FormScreen, Section } from '@/ui/Form'

// New Goal sheet: `Cancel` leading, `Add` trailing, disabled until the goal is valid
// (30-screens.md). The editor comes with slice 6.
export default function Goal() {
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" disabled>
          Add
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <FormScreen testID="goal">
        <Section footer="New Goal: placeholder for slice 6.">{null}</Section>
      </FormScreen>
    </>
  )
}
