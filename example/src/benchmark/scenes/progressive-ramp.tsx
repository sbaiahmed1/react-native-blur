import { StyleSheet, View } from 'react-native';
import { BlurView, ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function ProgressiveRamp({ params, running }: SceneProps) {
  return (
    <FeedList scrolling={running} images={params.images}>
      <ProgressiveBlurView
        testID="progressive-ramp-view"
        blurType="regular"
        blurAmount={params.amount}
        blurRounds={params.rounds}
        direction={params.direction}
        startOffset={params.offset}
        style={StyleSheet.absoluteFill}
      />
      {params.count >= 2 ? (
        <View
          style={[StyleSheet.absoluteFill, styles.center]}
          pointerEvents="none"
        >
          <BlurView
            testID="progressive-ramp-card"
            blurType="light"
            blurAmount={params.amount}
            blurRounds={params.rounds}
            style={styles.card}
          />
        </View>
      ) : null}
    </FeedList>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 200,
    height: 120,
    borderRadius: 24,
  },
});
