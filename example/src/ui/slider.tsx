import { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import {
  GestureDetector,
  useExclusiveGestures,
  usePanGesture,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { cell } from './group';
import { useTheme } from './theme';

const THUMB = 28;

function decimals(step: number): number {
  const text = String(step);
  return text.includes('.') ? text.length - text.indexOf('.') - 1 : 0;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const t = useTheme();
  const width = useSharedValue(0);
  const progress = useSharedValue((value - min) / (max - min));
  const places = decimals(step);

  useEffect(() => {
    progress.set((value - min) / (max - min));
  }, [progress, value, min, max]);

  const commit = useCallback(
    (fraction: number) => {
      const raw = min + fraction * (max - min);
      const snapped = Math.min(
        max,
        Math.max(min, Math.round(raw / step) * step)
      );
      onChange(Number(snapped.toFixed(places)));
    },
    [min, max, step, places, onChange]
  );

  const seek = (x: number) => {
    'worklet';
    const usable = width.get() - THUMB;
    if (usable <= 0) return;
    const fraction = Math.min(1, Math.max(0, (x - THUMB / 2) / usable));
    progress.set(fraction);
    scheduleOnRN(commit, fraction);
  };

  const pan = usePanGesture({
    activeOffsetX: [-4, 4],
    failOffsetY: [-10, 10],
    onActivate: (e) => seek(e.x),
    onUpdate: (e) => seek(e.x),
  });
  const tap = useTapGesture({ onActivate: (e) => seek(e.x) });
  const gesture = useExclusiveGestures(pan, tap);

  const fill = useAnimatedStyle(() => ({
    width: THUMB / 2 + progress.get() * Math.max(0, width.get() - THUMB),
  }));
  const thumb = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.get() * Math.max(0, width.get() - THUMB) },
    ],
  }));

  const nudge = (direction: 1 | -1) => {
    const next = Math.min(max, Math.max(min, value + direction * step));
    onChange(Number(next.toFixed(places)));
  };

  return (
    <View style={cell.column}>
      <View style={cell.header}>
        <Text style={[t.font.body, { color: t.colors.text }]}>{label}</Text>
        <Text
          style={[t.font.label, styles.value, { color: t.colors.textMuted }]}
        >
          {value.toFixed(places)}
        </Text>
      </View>
      <GestureDetector gesture={gesture}>
        <View
          style={styles.hit}
          onLayout={(e: LayoutChangeEvent) =>
            width.set(e.nativeEvent.layout.width)
          }
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min, max, now: value }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) =>
            nudge(e.nativeEvent.actionName === 'increment' ? 1 : -1)
          }
        >
          <View style={[styles.track, { backgroundColor: t.colors.chip }]} />
          <Animated.View
            style={[styles.fill, { backgroundColor: t.colors.accent }, fill]}
          />
          <Animated.View style={[styles.thumb, thumb]} />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  value: { fontVariant: ['tabular-nums'] },
  hit: { height: 44, justifyContent: 'center' },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
  },
  fill: { position: 'absolute', left: 0, height: 4, borderRadius: 2 },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
});
