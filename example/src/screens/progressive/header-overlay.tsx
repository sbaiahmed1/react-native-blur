import { StyleSheet, Text, View } from 'react-native';
import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

import { Section } from '@/ui/screen';
import { SHAPES, useTheme } from '@/ui/theme';

const ROWS = [
  { title: 'Signal', subtitle: 'Mara Okon', color: SHAPES.orange },
  { title: 'Tidewater', subtitle: 'Leo Brandt', color: SHAPES.blue },
  { title: 'Bloom', subtitle: 'Ines Duarte', color: SHAPES.pink },
  { title: 'Noon', subtitle: 'Sam Ito', color: SHAPES.yellow },
  { title: 'Fernway', subtitle: 'Ada Novak', color: SHAPES.green },
];

/** A list scrolled under a header that fades from blurred to clear. */
export function HeaderOverlay() {
  const t = useTheme();
  return (
    <Section title="Header over a list">
      <View style={[styles.card, { backgroundColor: t.colors.surface }]}>
        <View style={styles.list}>
          {ROWS.map((row) => (
            <View key={row.title} style={styles.row}>
              <View style={[styles.thumb, { backgroundColor: row.color }]} />
              <View>
                <Text style={[t.font.headline, { color: t.colors.text }]}>
                  {row.title}
                </Text>
                <Text style={[t.font.footnote, { color: t.colors.textMuted }]}>
                  {row.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <ProgressiveBlurView
          direction="blurredTopClearBottom"
          startOffset={0.3}
          blurType={t.dark ? 'dark' : 'light'}
          blurAmount={30}
          reducedTransparencyFallbackColor={t.colors.surface}
          style={styles.header}
        />
        <View style={styles.titleRow} pointerEvents="none">
          <Text style={[t.font.title, { color: t.colors.text }]}>Library</Text>
          <Text style={[t.font.label, { color: t.colors.accent }]}>Edit</Text>
        </View>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  card: { height: 280, borderRadius: 24, overflow: 'hidden' },
  list: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 48, height: 48, borderRadius: 10 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  titleRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
});
