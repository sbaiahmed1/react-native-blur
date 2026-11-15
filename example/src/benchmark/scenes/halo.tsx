import { StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function Halo({ params, running }: SceneProps) {
  return (
    <FeedList scrolling={running} images={params.images}>
      <BlurView
        blurType="light"
        blurAmount={params.amount}
        blurRounds={params.rounds}
        style={styles.bar}
      />
      <View pointerEvents="none" style={styles.button}>
        <Text style={styles.plus}>+</Text>
      </View>
    </FeedList>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
  },
  button: {
    position: 'absolute',
    bottom: 52,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
});
