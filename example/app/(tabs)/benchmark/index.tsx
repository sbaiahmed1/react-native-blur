import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { SCENES } from '@/benchmark/scenes';
import { Group, cell } from '@/ui/group';
import { MaterialCard, Screen, Section } from '@/ui/screen';
import { useTheme } from '@/ui/theme';

export default function BenchmarkIndex() {
  const router = useRouter();
  const t = useTheme();
  return (
    <Screen
      title="Benchmark"
      subtitle="Each scene records UI-thread frame times."
    >
      <Section title="Scenes">
        <Group>
          {SCENES.map((scene) => (
            <Pressable
              key={scene.id}
              testID={`bench-scene-${scene.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${scene.title}. ${scene.note}`}
              style={({ pressed }) => [
                cell.row,
                pressed && { backgroundColor: t.colors.chip },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/benchmark/[scene]',
                  params: { scene: scene.id },
                })
              }
            >
              <View style={styles.text}>
                <Text style={[t.font.headline, { color: t.colors.text }]}>
                  {scene.title}
                </Text>
                <Text style={[t.font.footnote, { color: t.colors.text }]}>
                  {scene.note}
                </Text>
                <Text
                  style={[
                    t.font.mono,
                    styles.id,
                    { color: t.colors.textMuted },
                  ]}
                >
                  {scene.id}
                </Text>
              </View>
              <SymbolView
                name={{
                  ios: 'chevron.right',
                  android: 'chevron_right',
                  web: 'chevron_right',
                }}
                size={14}
                tintColor={t.colors.textMuted}
              />
            </Pressable>
          ))}
        </Group>
      </Section>
      <Section title="Run from a script">
        <MaterialCard>
          <Text style={[t.font.footnote, { color: t.colors.text }]}>
            Open a scene by deep link. The result prints as one BENCH_RESULT
            line.
          </Text>
          <Text selectable style={[t.font.mono, { color: t.colors.text }]}>
            exampleapp://benchmark/&lt;scene&gt;?autoplay=1&amp;duration=10
          </Text>
        </MaterialCard>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { flex: 1, gap: 2, paddingVertical: 4 },
  id: { fontSize: 12, lineHeight: 16 },
});
