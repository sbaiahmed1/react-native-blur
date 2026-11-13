import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView, LiquidGlassView } from '@sbaiahmed1/react-native-blur';

import type { SceneProps } from '../scenes';

const SWAP_MS = 1000;

// Swaps from mount and keeps going after the recorder stops, so B7 stays observable.
export default function Recycle(_props: SceneProps) {
  const [showA, setShowA] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setShowA((value) => !value), SWAP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.root}>
      {showA ? (
        <>
          <BlurView
            key="a"
            testID="recycle-a"
            overlayColor="#FF000080"
            pointerEvents="none"
            style={styles.box}
          />
          <LiquidGlassView
            key="ga"
            glassType="regular"
            glassTintColor="#FF0000"
            style={styles.box}
          />
        </>
      ) : (
        <>
          <BlurView key="b" testID="recycle-b" style={styles.box} />
          <LiquidGlassView key="gb" style={styles.box} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  box: {
    width: 160,
    height: 120,
  },
});
