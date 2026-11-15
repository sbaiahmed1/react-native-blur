import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BlurView,
  LiquidGlassView,
  ProgressiveBlurView,
} from '@sbaiahmed1/react-native-blur';

import type { SceneProps } from '../scenes';

const STRIPE = 12;
const STRIPES = 40;
const RESIZE_STEPS = [0, 80, 160];

function Stripes({ vertical }: { vertical: boolean }) {
  return (
    <View style={[styles.half, vertical ? styles.row : styles.column]}>
      {Array.from({ length: STRIPES }, (_, index) => (
        <View
          key={index}
          style={[
            vertical ? styles.verticalStripe : styles.horizontalStripe,
            index % 2 === 0 ? styles.black : styles.white,
          ]}
        />
      ))}
    </View>
  );
}

export default function Geometry({ params, running }: SceneProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(2);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () => setStep((current) => (current + 1) % RESIZE_STEPS.length),
      1000
    );
    return () => clearInterval(timer);
  }, [running]);

  return (
    <View style={styles.root}>
      <Stripes vertical />
      <Stripes vertical={false} />

      <LiquidGlassView
        glassType="regular"
        style={[styles.edgeGlass, { top: -(insets.top + 48) }]}
      />

      <View style={styles.scaled}>
        <BlurView
          blurType="light"
          blurAmount={params.amount}
          blurRounds={params.rounds}
          style={styles.scaledCard}
        />
        <LiquidGlassView glassType="clear" style={styles.scaledCard} />
      </View>

      <View style={styles.layer} renderToHardwareTextureAndroid>
        <BlurView
          blurType="light"
          blurAmount={params.amount}
          blurRounds={params.rounds}
          style={styles.layerCard}
        />
        <LiquidGlassView glassType="regular" style={styles.layerCard} />
      </View>

      <ProgressiveBlurView
        blurType="light"
        blurAmount={params.amount}
        blurRounds={params.rounds}
        direction="blurredTopClearBottom"
        style={styles.progressive}
      />

      <BlurView
        blurType="light"
        blurAmount={params.amount}
        blurRounds={params.rounds}
        style={[styles.resizing, { height: RESIZE_STEPS[step] }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  half: {
    flex: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  verticalStripe: {
    width: STRIPE,
    height: '100%',
  },
  horizontalStripe: {
    height: STRIPE,
    width: '100%',
  },
  black: {
    backgroundColor: '#000000',
  },
  white: {
    backgroundColor: '#FFFFFF',
  },
  edgeGlass: {
    position: 'absolute',
    left: 16,
    width: 180,
    height: 120,
    borderRadius: 28,
  },
  scaled: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    gap: 16,
    transform: [{ scale: 0.5 }],
  },
  scaledCard: {
    height: 120,
    borderRadius: 24,
  },
  layer: {
    position: 'absolute',
    top: 400,
    left: 16,
    flexDirection: 'row',
    gap: 19,
  },
  layerCard: {
    width: 180,
    height: 110,
    borderRadius: 20,
  },
  progressive: {
    position: 'absolute',
    top: 540,
    left: 0,
    right: 0,
    height: 160,
  },
  resizing: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
  },
});
