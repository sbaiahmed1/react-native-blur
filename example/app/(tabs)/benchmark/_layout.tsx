import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'index',
};

export default function BenchmarkLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Set at push time, so `animation=fade` drives the push itself. */}
      <Stack.Screen
        name="detail"
        options={({ route }) => ({
          animation:
            (route.params as { animation?: string } | undefined)?.animation ===
            'fade'
              ? 'fade'
              : 'default',
        })}
      />
    </Stack>
  );
}
