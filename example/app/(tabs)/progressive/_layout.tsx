import { Stack } from 'expo-router';

import { playgroundHeader } from '@/ui/stack-options';
import { useTheme } from '@/ui/theme';

// A reload or link straight into the playground still gets the showcase under it.
export const unstable_settings = { anchor: 'index' };

export default function ProgressiveLayout() {
  const t = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="playground"
        options={playgroundHeader(t, 'ProgressiveBlurView', 'Progressive')}
      />
    </Stack>
  );
}
