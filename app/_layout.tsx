import { Stack } from 'expo-router';
import { PlatformColor } from 'react-native';

// Slice 0 placeholder. Slice 1 replaces it with the native tabs and three stacks
// of docs/spec/30-screens.md.
export default function RootLayout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: PlatformColor('systemGroupedBackground') } }}>
      <Stack.Screen name="index" options={{ title: 'Your LifeTime', headerLargeTitle: true }} />
    </Stack>
  );
}
