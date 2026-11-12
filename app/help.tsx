import { router, Stack } from 'expo-router'

import { FormScreen, Section } from '@/ui/Form'

// Sheet with a small header and `Done` trailing (30-screens.md). Content comes with slice 3.
export default function Help() {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" onPress={() => router.back()}>
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <FormScreen testID="help">
        <Section footer="Help: placeholder for slice 3.">{null}</Section>
      </FormScreen>
    </>
  )
}
