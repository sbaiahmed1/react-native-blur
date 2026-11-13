import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { MaterialCard } from '@/ui/screen';
import { SHAPES, useTheme } from '@/ui/theme';

/** A media player card: the most common place a blur sits in a real app. */
export function NowPlaying() {
  const t = useTheme();
  const [playing, setPlaying] = useState(false);
  return (
    <MaterialCard>
      <Text
        style={[t.font.footnote, styles.eyebrow, { color: t.colors.textMuted }]}
      >
        NOW PLAYING
      </Text>
      <View style={styles.row}>
        <View style={[styles.artwork, { backgroundColor: SHAPES.violet }]}>
          <View style={styles.mark} />
        </View>
        <View style={styles.grow}>
          <Text style={[t.font.headline, { color: t.colors.text }]}>
            Midnight Drive
          </Text>
          <Text style={[t.font.label, { color: t.colors.textMuted }]}>
            Neon Coast
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          onPress={() => setPlaying((p) => !p)}
          style={[styles.play, { backgroundColor: t.colors.text }]}
        >
          <SymbolView
            name={
              playing
                ? { ios: 'pause.fill', android: 'pause', web: 'pause' }
                : { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }
            }
            size={18}
            tintColor={t.colors.bg}
          />
        </Pressable>
      </View>
      <View style={[styles.track, { backgroundColor: t.colors.chip }]}>
        <View style={[styles.progress, { backgroundColor: t.colors.text }]} />
      </View>
      <View style={styles.times}>
        <Text style={[t.font.footnote, { color: t.colors.textMuted }]}>
          1:24
        </Text>
        <Text style={[t.font.footnote, { color: t.colors.textMuted }]}>
          -2:28
        </Text>
      </View>
    </MaterialCard>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontWeight: '600', letterSpacing: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  grow: { flex: 1 },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progress: { width: '40%', height: '100%', borderRadius: 2 },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
  },
});
