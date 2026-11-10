import { ScrollView, Text, PlatformColor } from 'react-native';

// The scroll view is the screen's root, with automatic content insets, so the large title
// collapses natively (docs/spikes/02-large-title.md).
export default function Index() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <Text
        testID="scaffold"
        dynamicTypeRamp="footnote"
        style={{ fontSize: 13, color: PlatformColor('secondaryLabel'), padding: 16 }}>
        Scaffold: Expo SDK 58
      </Text>
    </ScrollView>
  );
}
