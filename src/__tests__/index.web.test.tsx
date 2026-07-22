import React from 'react';
import { Switch, Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import type { ReactTestInstance } from 'react-test-renderer';
import { StyleSheet } from 'react-native';

import * as nativeIndex from '../index';
import * as webIndex from '../index.web';
import {
  BlurView,
  BlurSwitch,
  LiquidGlassContainer,
  LiquidGlassView,
  ProgressiveBlurView,
  VibrancyView,
} from '../index.web';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const render = (element: React.ReactElement) => {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
};

const flattenedStyles = (instance: ReactTestInstance) =>
  instance
    .findAllByType(View)
    .map((view) => StyleSheet.flatten(view.props.style) ?? {});

describe('web public API surface', () => {
  it('exports exactly the same runtime names as the native entry', () => {
    expect(Object.keys(webIndex).sort()).toEqual(
      Object.keys(nativeIndex).sort()
    );
  });

  it('keeps BlurView as the default export', () => {
    expect(webIndex.default).toBe(BlurView);
  });
});

describe('BlurView (web)', () => {
  it('renders the tint layer and children, without backdrop-filter in a CSS-less env', () => {
    const renderer = render(
      <BlurView blurType="dark" blurAmount={40}>
        <Text>content</Text>
      </BlurView>
    );

    const styles = flattenedStyles(renderer.root);
    const tintLayer = styles.find(
      (style) => style.backgroundColor === 'rgba(0, 0, 0, 0.5)'
    );
    expect(tintLayer).toBeDefined();
    expect(tintLayer).not.toHaveProperty('backdropFilter');
    expect(renderer.root.findAllByType(Text)).toHaveLength(1);
  });

  it('stacks the overlay color above the blur layer', () => {
    const renderer = render(
      <BlurView overlayColor="#FF000080">
        <Text>content</Text>
      </BlurView>
    );

    const styles = flattenedStyles(renderer.root);
    const blurLayerIndex = styles.findIndex(
      (style) => style.backgroundColor === 'rgba(255, 255, 255, 0.6)'
    );
    const overlayLayerIndex = styles.findIndex(
      (style) => style.backgroundColor === '#FF000080'
    );
    expect(blurLayerIndex).toBeGreaterThan(-1);
    expect(overlayLayerIndex).toBeGreaterThan(blurLayerIndex);
  });
});

describe('ProgressiveBlurView (web)', () => {
  it('renders only the directional tint gradient in a CSS-less env', () => {
    const renderer = render(
      <ProgressiveBlurView direction="blurredBottomClearTop" />
    );

    const styles = flattenedStyles(renderer.root);
    const gradients = styles.filter((style) => 'backgroundImage' in style);
    expect(gradients).toHaveLength(1);
    expect(
      (gradients[0] as { backgroundImage?: string }).backgroundImage
    ).toContain('linear-gradient(to top');
    expect(styles.some((style) => 'backdropFilter' in style)).toBe(false);
  });
});

describe('LiquidGlassView (web)', () => {
  it('renders the enhanced-blur fallback with the scaled glass tint', () => {
    const renderer = render(
      <LiquidGlassView glassTintColor="#007AFF" glassOpacity={1}>
        <Text>glass</Text>
      </LiquidGlassView>
    );

    const styles = flattenedStyles(renderer.root);
    // regular blurType tint from the delegated BlurView…
    expect(
      styles.some(
        (style) => style.backgroundColor === 'rgba(255, 255, 255, 0.2)'
      )
    ).toBe(true);
    // …plus the glass tint scaled down to the capped fallback alpha.
    expect(styles.some((style) => style.backgroundColor === '#007aff59')).toBe(
      true
    );
  });
});

describe('BlurSwitch (web)', () => {
  it('renders the built-in Switch with forwarded props', () => {
    const onValueChange = jest.fn();
    const renderer = render(
      <BlurSwitch value onValueChange={onValueChange} disabled />
    );

    const switchInstance = renderer.root.findByType(Switch);
    expect(switchInstance.props.value).toBe(true);
    expect(switchInstance.props.disabled).toBe(true);
    switchInstance.props.onValueChange(false);
    expect(onValueChange).toHaveBeenCalledWith(false);
  });
});

describe('web wrapper rendering', () => {
  it.each([
    ['BlurView', BlurView],
    ['VibrancyView', VibrancyView],
    ['ProgressiveBlurView', ProgressiveBlurView],
    ['LiquidGlassView', LiquidGlassView],
    ['LiquidGlassContainer', LiquidGlassContainer],
    ['BlurSwitch', BlurSwitch],
  ] as const)('renders %s without throwing', (_name, Component) => {
    expect(() => {
      render(
        <Component>
          <Text>child</Text>
        </Component>
      );
    }).not.toThrow();
  });
});
