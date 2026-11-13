import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { LiquidGlassView, type GlassType } from '@sbaiahmed1/react-native-blur';

import { GLASS_FALLBACK_NOTICE, NATIVE_GLASS } from '@/ui/glass-support';
import { Toggle } from '@/ui/group';
import { Playground } from '@/ui/playground';
import { Segmented } from '@/ui/segmented';
import { Slider } from '@/ui/slider';
import { toSnippet } from '@/ui/snippet';
import { Swatches } from '@/ui/swatches';
import { SHAPES, useTheme } from '@/ui/theme';
import { useReduceTransparency } from '@/ui/use-reduce-transparency';

const GLASS_TYPES = [
  'clear',
  'regular',
] as const satisfies readonly GlassType[];
const TINTS = ['#FFFFFF', '#0B0B0F', SHAPES.blue, SHAPES.pink, SHAPES.orange];
const DEFAULTS = { glassType: 'clear', glassOpacity: 1, isInteractive: true };

export default function GlassPlayground() {
  const t = useTheme();
  const reduced = useReduceTransparency();
  const [glassType, setGlassType] = useState<GlassType>('regular');
  const [tint, setTint] = useState<string | undefined>();
  const [glassOpacity, setGlassOpacity] = useState(1);
  const [isInteractive, setIsInteractive] = useState(true);
  const [radius, setRadius] = useState(32);

  const tag = toSnippet(
    'LiquidGlassView',
    { glassType, glassTintColor: tint, glassOpacity, isInteractive },
    DEFAULTS
  );
  const code =
    radius > 0
      ? tag.replace(/ \/>$/, ` style={{ borderRadius: ${radius} }} />`)
      : tag;

  const notice = !NATIVE_GLASS
    ? GLASS_FALLBACK_NOTICE
    : reduced
      ? 'Reduce Transparency is on, so the preview shows the fallback color.'
      : undefined;

  return (
    <Playground
      notice={notice}
      preview={
        <LiquidGlassView
          glassType={glassType}
          glassTintColor={tint}
          glassOpacity={glassOpacity}
          isInteractive={isInteractive}
          style={[styles.glass, { borderRadius: radius }]}
        >
          <Text style={[t.font.headline, { color: t.colors.text }]}>
            Liquid glass
          </Text>
          <Text style={[t.font.footnote, { color: t.colors.text }]}>
            {isInteractive ? 'Press and drag me' : 'Static'}
          </Text>
        </LiquidGlassView>
      }
      controls={[
        <Segmented
          key="type"
          label="glassType"
          value={glassType}
          options={GLASS_TYPES}
          onChange={setGlassType}
        />,
        <Swatches
          key="tint"
          label="glassTintColor"
          value={tint}
          colors={TINTS}
          onChange={setTint}
        />,
        <Slider
          key="opacity"
          label="glassOpacity"
          value={glassOpacity}
          min={0}
          max={1}
          step={0.05}
          onChange={setGlassOpacity}
        />,
        <Toggle
          key="interactive"
          label="isInteractive"
          value={isInteractive}
          onChange={setIsInteractive}
        />,
        <Slider
          key="radius"
          label="borderRadius"
          value={radius}
          min={0}
          max={60}
          onChange={setRadius}
        />,
      ]}
      code={code}
    />
  );
}

const styles = StyleSheet.create({
  glass: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    left: 40,
    right: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
});
