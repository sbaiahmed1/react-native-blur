import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function Stacked({ params, running }: SceneProps) {
  return (
    <FeedList scrolling={running} images={params.images}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: params.count }, (_, index) => (
          <BlurView
            key={index}
            blurType="light"
            blurAmount={params.amount}
            blurRounds={params.rounds}
            style={[
              styles.card,
              { top: 24 + 28 * index, left: 16 + 8 * index },
            ]}
          >
            <Text style={styles.cardText}>{`Card ${index + 1}`}</Text>
          </BlurView>
        ))}
      </View>
    </FeedList>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: 240,
    height: 160,
    borderRadius: 20,
    padding: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
});
