import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView, ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';

import { FeedList } from '../content';
import type { SceneProps } from '../scenes';
import { CalibrationBackdrop } from './materials';

function RampBackdrop({
  params,
  running,
  children,
}: SceneProps & { children: ReactNode }) {
  if (params.bg === 'feed') {
    return (
      <FeedList scrolling={running} images={params.images}>
        {children}
      </FeedList>
    );
  }
  return (
    <View style={styles.root}>
      <CalibrationBackdrop bg={params.bg} />
      {children}
    </View>
  );
}

export default function ProgressiveRamp(props: SceneProps) {
  const { params } = props;
  return (
    <RampBackdrop {...props}>
      <ProgressiveBlurView
        testID="progressive-ramp-view"
        blurType={params.blurType}
        blurAmount={params.amount}
        blurRounds={params.rounds}
        direction={params.direction}
        startOffset={params.offset}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
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
    </RampBackdrop>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
