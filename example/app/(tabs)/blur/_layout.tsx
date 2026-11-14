import { Stack } from 'expo-router';

import { playgroundHeader } from '@/ui/stack-options';
import { useTheme } from '@/ui/theme';

export default function BlurLayout() {
  const t = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="playground"
        options={playgroundHeader(t, 'BlurView', 'Blur')}
      />
    </Stack>
  );
}
