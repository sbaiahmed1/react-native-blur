import { useEffect } from 'react';
import type Animated from 'react-native-reanimated';
import {
  scrollTo,
  useFrameCallback,
  useSharedValue,
  type AnimatedRef,
} from 'react-native-reanimated';

const MAX_STEP_MS = 100;

// No Reanimated event handler here: each animated event re-runs every frame callback and skews the recorder.
export function useAutoScroll(
  ref: AnimatedRef<Animated.ScrollView>,
  enabled: boolean,
  maxOffset: number,
  pxPerSec = 600
): void {
  const target = useSharedValue(0);
  const direction = useSharedValue(1);
  const max = useSharedValue(maxOffset);
  const speed = useSharedValue(pxPerSec);

  useEffect(() => {
    max.set(maxOffset);
    speed.set(pxPerSec);
  }, [maxOffset, pxPerSec, max, speed]);

  const frame = useFrameCallback((info) => {
    'worklet';
    const dt = Math.min(info.timeSincePreviousFrame ?? 0, MAX_STEP_MS);
    let next = target.get() + (direction.get() * speed.get() * dt) / 1000;
    if (next >= max.get()) {
      next = max.get();
      direction.set(-1);
    } else if (next <= 0) {
      next = 0;
      direction.set(1);
    }
    target.set(next);
    scrollTo(ref, 0, next, false);
  }, false);

  useEffect(() => {
    frame.setActive(enabled);
    return () => frame.setActive(false);
  }, [enabled, frame]);
}
