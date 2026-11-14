import type React from 'react';
import { useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView, LiquidGlassView } from '@sbaiahmed1/react-native-blur';

let visible = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getVisible(): boolean {
  return visible;
}

export function setRootOverlayVisible(next: boolean): void {
  if (visible === next) return;
  visible = next;
  listeners.forEach((listener) => listener());
}

// Rendered next to the root Stack, so no Screen is an ancestor of these effects.
export function RootOverlayHost(): React.JSX.Element | null {
  const isVisible = useSyncExternalStore(subscribe, getVisible, getVisible);
  if (!isVisible) return null;
  return (
    <>
      <View style={[styles.wrapper, styles.first]}>
        <LiquidGlassView glassType="regular" style={styles.fill} />
      </View>
      <View style={[styles.wrapper, styles.second]}>
        <BlurView blurType="light" blurAmount={40} style={styles.fill} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 96,
  },
  first: {
    top: 120,
  },
  second: {
    top: 232,
  },
  fill: {
    flex: 1,
  },
});
