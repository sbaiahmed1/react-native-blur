import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

import { SHAPES, useTheme } from '@/ui/theme';

/** Album art that fades into a blur at the bottom, with the title sitting on the blur. */
export function ArtworkCard() {
  const t = useTheme();
  return (
    <View style={styles.card}>
      <View style={[styles.art, { backgroundColor: SHAPES.violet }]}>
        <View style={[styles.sun, { backgroundColor: SHAPES.yellow }]} />
        <View style={[styles.moon, { backgroundColor: SHAPES.pink }]} />
        <View style={[styles.bar, { backgroundColor: SHAPES.green }]} />
      </View>
      <ProgressiveBlurView
        direction="blurredBottomClearTop"
        startOffset={0.35}
        blurType="dark"
        blurAmount={40}
        reducedTransparencyFallbackColor="#1C1C1E"
        style={styles.fade}
      />
      <View style={styles.meta}>
        <View style={styles.grow}>
          <Text style={[t.font.title, styles.white]}>Violet Hour</Text>
          <Text style={[t.font.label, styles.dim]}>June Park</Text>
        </View>
        <View style={styles.play}>
          <SymbolView
            name={{
              ios: 'play.fill',
              android: 'play_arrow',
              web: 'play_arrow',
            }}
            size={18}
            tintColor="#0B0B0F"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { aspectRatio: 1, borderRadius: 24, overflow: 'hidden' },
  art: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  sun: {
    position: 'absolute',
    width: '70%',
    aspectRatio: 1,
    borderRadius: 9999,
    left: '-12%',
    top: '-10%',
  },
  moon: {
    position: 'absolute',
    width: '44%',
    aspectRatio: 1,
    borderRadius: 9999,
    right: '6%',
    top: '30%',
  },
  bar: {
    position: 'absolute',
    height: '18%',
    left: '10%',
    right: '30%',
    bottom: '14%',
    borderRadius: 9999,
  },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },
  meta: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  grow: { flex: 1 },
  white: { color: '#FFFFFF' },
  dim: { color: 'rgba(255,255,255,0.75)' },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
