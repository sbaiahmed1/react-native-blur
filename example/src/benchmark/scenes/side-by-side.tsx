import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

const CARDS = [
  { label: 'A', style: { top: 120, left: 16, width: 160, height: 160 } },
  { label: 'B', style: { top: 120, left: 200, width: 160, height: 160 } },
  { label: 'C', style: { top: 200, left: 60, width: 260, height: 120 } },
] as const;

export default function SideBySide({ params, running }: SceneProps) {
  return (
    <FeedList scrolling={running} images={params.images}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {CARDS.map((card) => (
          <BlurView
            key={card.label}
            blurType="light"
            blurAmount={params.amount}
            blurRounds={params.rounds}
            style={[styles.card, card.style]}
          >
            <Text style={styles.cardText}>{`Card ${card.label}`}</Text>
          </BlurView>
        ))}
      </View>
    </FeedList>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: 20,
    padding: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
});
