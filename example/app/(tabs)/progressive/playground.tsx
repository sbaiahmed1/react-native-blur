import { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  ProgressiveBlurView,
  type BlurType,
  type ProgressiveBlurDirection,
} from '@sbaiahmed1/react-native-blur';

import { BLUR_TYPES } from '@/constants/blur';
import { Chips } from '@/ui/chips';
import { Playground } from '@/ui/playground';
import { Segmented } from '@/ui/segmented';
import { Slider } from '@/ui/slider';
import { toSnippet } from '@/ui/snippet';
import { useReduceTransparency } from '@/ui/use-reduce-transparency';

const DIRECTIONS = [
  'blurredTopClearBottom',
  'blurredBottomClearTop',
  'blurredCenterClearTopAndBottom',
] as const satisfies readonly ProgressiveBlurDirection[];

const DIRECTION_LABELS = {
  blurredTopClearBottom: 'Top',
  blurredBottomClearTop: 'Bottom',
  blurredCenterClearTopAndBottom: 'Center',
};

const DEFAULTS = {
  direction: 'blurredTopClearBottom',
  startOffset: 0,
  blurType: 'regular',
  blurAmount: 20,
};

export default function ProgressivePlayground() {
  const reduced = useReduceTransparency();
  const [direction, setDirection] = useState<ProgressiveBlurDirection>(
    'blurredTopClearBottom'
  );
  const [startOffset, setStartOffset] = useState(0.2);
  const [blurAmount, setBlurAmount] = useState(40);
  const [blurType, setBlurType] = useState<BlurType>('regular');

  return (
    <Playground
      notice={
        reduced
          ? 'Reduce Transparency is on, so the preview shows the fallback color.'
          : undefined
      }
      preview={
        <ProgressiveBlurView
          direction={direction}
          startOffset={startOffset}
          blurAmount={blurAmount}
          blurType={blurType}
          style={styles.fill}
        />
      }
      controls={[
        <Segmented
          key="direction"
          label="direction"
          value={direction}
          options={DIRECTIONS}
          labels={DIRECTION_LABELS}
          onChange={setDirection}
        />,
        <Slider
          key="offset"
          label="startOffset"
          value={startOffset}
          min={0}
          max={1}
          step={0.05}
          onChange={setStartOffset}
        />,
        <Slider
          key="amount"
          label="blurAmount"
          value={blurAmount}
          min={0}
          max={100}
          onChange={setBlurAmount}
        />,
        <Chips
          key="type"
          label="blurType"
          value={blurType}
          options={BLUR_TYPES}
          onChange={setBlurType}
        />,
      ]}
      code={toSnippet(
        'ProgressiveBlurView',
        { direction, startOffset, blurAmount, blurType },
        DEFAULTS
      )}
    />
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
