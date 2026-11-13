import { useCallback, useEffect, useRef } from 'react';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { summarizeFrames, type FrameSummary } from './frame-stats';

// Scenes must not register Reanimated event handlers: each animated event re-runs frame callbacks mid-frame.
export function useFrameRecorder(
  running: boolean,
  durationSec: number,
  onDone: (summary: FrameSummary) => void
): void {
  const deltas = useSharedValue<number[]>([]);
  const elapsedMs = useSharedValue(0);
  const limitMs = useSharedValue(durationSec * 1000);
  const done = useSharedValue(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    limitMs.set(durationSec * 1000);
  }, [durationSec, limitMs]);

  const finish = useCallback((collected: number[]) => {
    onDoneRef.current(summarizeFrames(collected));
  }, []);

  const frame = useFrameCallback((info) => {
    'worklet';
    const dt = info.timeSincePreviousFrame;
    if (done.get() || dt === null) return;
    deltas.modify((list) => {
      'worklet';
      list.push(dt);
      return list;
    }, false);
    elapsedMs.set(elapsedMs.get() + dt);
    if (elapsedMs.get() >= limitMs.get()) {
      done.set(true);
      scheduleOnRN(finish, deltas.get());
    }
  }, false);

  useEffect(() => {
    frame.setActive(running);
    return () => frame.setActive(false);
  }, [running, frame]);
}
