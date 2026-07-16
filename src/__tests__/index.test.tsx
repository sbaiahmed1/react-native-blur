import type { ReactElement } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View, type ColorValue } from 'react-native';

import * as PublicApi from '../index';
import ReactNativeBlurView from '../ReactNativeBlurViewNativeComponent';
import { BlurView } from '../BlurView';
import { ProgressiveBlurView } from '../ProgressiveBlurView';
import { LiquidGlassView, getFallbackOverlayColor } from '../LiquidGlassView';
import { LiquidGlassContainer } from '../LiquidGlassContainer';
import { VibrancyView } from '../VibrancyView';
import { BlurSwitch, toColorString } from '../BlurSwitch';

// react-test-renderer under React 19 requires renders to run inside act().
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function render(element: ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
}

describe('getFallbackOverlayColor', () => {
  it('returns undefined for missing / clear / transparent tints', () => {
    expect(getFallbackOverlayColor(undefined, 1)).toBeUndefined();
    expect(getFallbackOverlayColor('', 1)).toBeUndefined();
    expect(getFallbackOverlayColor('clear', 1)).toBeUndefined();
    expect(getFallbackOverlayColor('CLEAR', 1)).toBeUndefined();
    expect(getFallbackOverlayColor('transparent', 1)).toBeUndefined();
  });

  it('scales a 6-digit hex tint down to the capped subtle alpha', () => {
    // opacity 1 * MAX_FALLBACK_TINT_ALPHA (0.35) * tintAlpha 1 * 255 = 89 -> 0x59
    expect(getFallbackOverlayColor('#FF0000', 1)).toBe('#ff000059');
    // opacity 0.5 -> 45 -> 0x2d
    expect(getFallbackOverlayColor('#FF0000', 0.5)).toBe('#ff00002d');
  });

  it('expands 3-digit hex and folds an 8-digit tint alpha in', () => {
    expect(getFallbackOverlayColor('#F00', 1)).toBe('#ff000059');
    // #FF000080 carries tintAlpha 0x80/255 ~= 0.502, so 0.35*0.502*255 ~= 45
    expect(getFallbackOverlayColor('#FF000080', 1)).toBe('#ff00002d');
  });

  it('clamps opacity into [0, 1]', () => {
    expect(getFallbackOverlayColor('#FF0000', 5)).toBe('#ff000059');
    expect(getFallbackOverlayColor('#FF0000', -1)).toBe('#ff000000');
  });

  it('passes named / rgb colours through unchanged', () => {
    expect(getFallbackOverlayColor('red', 1)).toBe('red');
    expect(getFallbackOverlayColor('rgb(255,0,0)', 1)).toBe('rgb(255,0,0)');
  });
});

describe('toColorString', () => {
  it('returns a string colour unchanged', () => {
    expect(toColorString('#abcdef', '#000000')).toBe('#abcdef');
  });

  it('falls back for undefined or non-string ColorValues', () => {
    expect(toColorString(undefined, '#E5E5EA')).toBe('#E5E5EA');
    // processColor / PlatformColor produce non-string values
    expect(toColorString(42 as unknown as ColorValue, '#34C759')).toBe(
      '#34C759'
    );
  });
});

describe('public API surface', () => {
  it('exports every wrapper component', () => {
    for (const name of [
      'BlurView',
      'ProgressiveBlurView',
      'LiquidGlassView',
      'LiquidGlassContainer',
      'VibrancyView',
      'BlurSwitch',
    ] as const) {
      expect(PublicApi[name]).toBeDefined();
    }
    expect(PublicApi.default).toBe(PublicApi.BlurView);
  });
});

describe('wrapper rendering', () => {
  it('renders BlurView with no children as the native blur view with defaults', () => {
    const tree = render(<BlurView blurAmount={20} />);
    const native = tree.root.findAllByType(ReactNativeBlurView);
    expect(native).toHaveLength(1);
    expect(native[0]?.props.blurType).toBe('xlight');
    expect(native[0]?.props.blurAmount).toBe(20);
    expect(native[0]?.props.blurRounds).toBe(5);
    expect(native[0]?.props.ignoreSafeArea).toBe(true);
    act(() => tree.unmount());
  });

  it('renders BlurView with children without throwing', () => {
    const tree = render(
      <BlurView>
        <View testID="child" />
      </BlurView>
    );
    expect(tree.root.findAllByType(ReactNativeBlurView).length).toBeGreaterThan(
      0
    );
    act(() => tree.unmount());
  });

  it('renders every wrapper without throwing', () => {
    const cases = [
      <ProgressiveBlurView key="p" blurAmount={30} />,
      <LiquidGlassView key="g" glassTintColor="#007AFF" glassOpacity={0.8} />,
      <LiquidGlassContainer key="c" spacing={12} />,
      <VibrancyView key="v" blurAmount={15} />,
      <BlurSwitch key="s" value onValueChange={() => {}} />,
    ];
    for (const element of cases) {
      const tree = render(element);
      expect(tree.toJSON()).not.toBeNull();
      act(() => tree.unmount());
    }
  });
});
