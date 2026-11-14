import { StyleSheet } from 'react-native';
import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

export default function ProgressiveBars({ params, running }: SceneProps) {
  return (
    <FeedList scrolling={running} images={params.images}>
      <ProgressiveBlurView
        blurType="light"
        blurAmount={params.amount}
        blurRounds={params.rounds}
        direction="blurredTopClearBottom"
        style={[styles.bar, styles.top]}
      />
      <ProgressiveBlurView
        blurType="light"
        blurAmount={params.amount}
        blurRounds={params.rounds}
        direction="blurredBottomClearTop"
        style={[styles.bar, styles.bottom]}
      />
    </FeedList>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 120,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
});
