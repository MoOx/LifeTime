import { RNHostView } from '@expo/ui/swift-ui'
import { PlatformColor, View } from 'react-native'

import { PlaceholderSections } from '@/features/shell/Placeholder'
import { FormScreen, Section } from '@/ui/Form'

// Summary: a SwiftUI Form, with the chart (slice 2) as a React Native view hosted in a
// section, as spike 4 proves (docs/spikes/04-expo-ui-lists.md).
export default function Summary() {
  return (
    <FormScreen testID="summary">
      <Section title="This Week" footer="Stands for the chart, drawn by React Native.">
        <RNHostView matchContents={{ vertical: true }}>
          <View
            testID="chart-placeholder"
            style={{ height: 180, borderRadius: 8, backgroundColor: PlatformColor('systemTealColor') }}
          />
        </RNHostView>
      </Section>
      <PlaceholderSections
        count={4}
        href={(title) => ({ pathname: '/summary/activity', params: { title } })}
      />
    </FormScreen>
  )
}
