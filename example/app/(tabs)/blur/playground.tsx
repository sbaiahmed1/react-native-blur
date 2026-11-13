import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BlurView, type BlurType } from '@sbaiahmed1/react-native-blur';

import { BLUR_TYPES } from '@/constants/blur';
import { Chips } from '@/ui/chips';
import { Playground } from '@/ui/playground';
import { Slider } from '@/ui/slider';
import { toSnippet } from '@/ui/snippet';
import { Swatches } from '@/ui/swatches';
import { useReduceTransparency } from '@/ui/use-reduce-transparency';

const OVERLAYS = ['#FFFFFF4D', '#0000004D', '#2F5BFF4D', '#FF3D9A4D'];
const FALLBACKS = ['#FFFFFF', '#F2F2F7', '#1C1C1E', '#2F5BFF'];
const DEFAULTS = {
  blurType: 'xlight',
  blurAmount: 10,
  reducedTransparencyFallbackColor: '#FFFFFF',
};

function Tag({ text }: { text: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

export default function BlurPlayground() {
  const reduced = useReduceTransparency();
  const [blurType, setBlurType] = useState<BlurType>('systemMaterial');
  const [blurAmount, setBlurAmount] = useState(40);
  const [overlayColor, setOverlayColor] = useState<string | undefined>();
  const [radius, setRadius] = useState(0);
  const [fallback, setFallback] = useState<string | undefined>();

  const tag = toSnippet(
    'BlurView',
    {
      blurType,
      blurAmount,
      overlayColor,
      reducedTransparencyFallbackColor: fallback,
    },
    DEFAULTS
  );
  const code =
    radius > 0
      ? tag.replace(/ \/>$/, ` style={{ borderRadius: ${radius} }} />`)
      : tag;

  return (
    <Playground
      notice={
        reduced
          ? 'Reduce Transparency is on, so the preview shows the fallback color.'
          : undefined
      }
      preview={
        <>
          <BlurView
            blurType={blurType}
            blurAmount={blurAmount}
            overlayColor={overlayColor}
            reducedTransparencyFallbackColor={fallback}
            style={[styles.half, { borderRadius: radius }]}
          />
          <View style={styles.divider} />
          <View style={styles.tags} pointerEvents="none">
            <Tag text="Sharp" />
            <Tag text={`blurAmount ${blurAmount}`} />
          </View>
        </>
      }
      controls={[
        <Chips
          key="type"
          label="blurType"
          value={blurType}
          options={BLUR_TYPES}
          onChange={setBlurType}
        />,
        <Slider
          key="amount"
          label="blurAmount"
          value={blurAmount}
          min={0}
          max={100}
          onChange={setBlurAmount}
        />,
        <Swatches
          key="overlay"
          label="overlayColor"
          value={overlayColor}
          colors={OVERLAYS}
          onChange={setOverlayColor}
        />,
        <Slider
          key="radius"
          label="borderRadius"
          value={radius}
          min={0}
          max={40}
          onChange={setRadius}
        />,
        <Swatches
          key="fallback"
          label="Fallback"
          value={fallback}
          colors={FALLBACKS}
          onChange={setFallback}
        />,
      ]}
      code={code}
    />
  );
}

const styles = StyleSheet.create({
  half: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    right: 0,
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: '#FFFFFF',
  },
  tags: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '600',
  },
});
