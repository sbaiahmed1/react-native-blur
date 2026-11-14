import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const HALF_CYCLE_MS = 1000;

export default function AnimatedAmount({ params, running }: SceneProps) {
  const amount = useSharedValue(0);

  useEffect(() => {
    if (!running) return;
    amount.set(
      withRepeat(
        withTiming(100, { duration: HALF_CYCLE_MS, easing: Easing.linear }),
        -1,
        true
      )
    );
    return () => cancelAnimation(amount);
  }, [running, amount]);

  const animatedProps = useAnimatedProps(() => ({
    blurAmount: amount.get(),
  }));

  return (
    <FeedList scrolling={false} images={params.images}>
      <View style={styles.center} pointerEvents="box-none">
        <AnimatedBlurView
          blurType="light"
          animatedProps={animatedProps}
          style={styles.box}
        />
      </View>
    </FeedList>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  box: {
    height: 200,
  },
});
