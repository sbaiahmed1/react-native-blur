import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SCENES } from '@/benchmark/scenes';

export default function BenchmarkIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.header}>Benchmark</Text>
      <Text style={styles.intro}>
        Each scene records UI-thread frame times. Deep link:
        exampleapp://benchmark/&lt;scene&gt;?autoplay=1&amp;duration=10
      </Text>
      {SCENES.map((scene) => (
        <Pressable
          key={scene.id}
          testID={`bench-scene-${scene.id}`}
          accessibilityRole="button"
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() =>
            router.push({
              pathname: '/benchmark/[scene]',
              params: { scene: scene.id },
            })
          }
        >
          <Text style={styles.title}>{scene.title}</Text>
          <Text style={styles.id}>{scene.id}</Text>
          <Text style={styles.note}>{scene.note}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111',
  },
  intro: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 8,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  rowPressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111111',
  },
  id: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  note: {
    fontSize: 14,
    color: '#333333',
    marginTop: 6,
  },
});
