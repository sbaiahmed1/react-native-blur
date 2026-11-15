import { StyleSheet, Text, View } from 'react-native';
import { BlurView, LiquidGlassView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function Nested({ params, running }: SceneProps) {
  return (
    <FeedList scrolling={running} images={params.images}>
      <View pointerEvents="none" style={styles.layer}>
        <BlurView
          blurType="dark"
          blurAmount={params.amount}
          blurRounds={params.rounds}
          style={styles.card}
        >
          <View style={styles.block}>
            <Text style={styles.blockText}>Inside the card</Text>
          </View>
          <BlurView
            blurType="light"
            blurAmount={params.amount}
            blurRounds={params.rounds}
            style={styles.badge}
          >
            <Text style={styles.label}>Blur</Text>
          </BlurView>
          <LiquidGlassView glassType="regular" style={styles.glass}>
            <Text style={styles.label}>Glass</Text>
          </LiquidGlassView>
        </BlurView>
      </View>
    </FeedList>
  );
}

const styles = StyleSheet.create({
  layer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    height: 320,
    marginHorizontal: 16,
    borderRadius: 24,
  },
  block: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#E5484D',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  blockText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    top: 96,
    left: 48,
    width: 120,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glass: {
    position: 'absolute',
    top: 96,
    right: 48,
    width: 120,
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
});
